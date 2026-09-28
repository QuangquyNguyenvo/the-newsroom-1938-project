import * as THREE from 'three';
import { gsap } from 'gsap';
import { makeMaterials, labelTexture, pageTexture } from './materials.js';

export const stations = {
  desk: { label: 'Bàn biên tập', position: [.65, 1.65, 1.55], target: [0, .8, -1.55] },
  shelf: { label: 'Kệ tư liệu', position: [-.9, 1.65, .85], target: [-1.91, 1.05, -1.6] },
  press: { label: 'Bàn in', position: [.7, 1.6, .85], target: [1.7, .65, -.65] },
};
export function buildRoom(scene, invalidate) {
  // World units are metres. Legacy construction coordinates live in one scaled group.
  // This makes the desk 0.81 m high, shelves 1.77 m high and room 6 m wide.
  const roomRoot = new THREE.Group();roomRoot.scale.setScalar(.75);scene.add(roomRoot);
  const m = makeMaterials(invalidate);
  let disposed=false;
  const modelRequests=[];
  function release(root){root.traverse(o=>{o.geometry?.dispose();for(const material of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){for(const t of Object.values(material))if(t?.isTexture)t.dispose();material.dispose();}});}
  function model(asset,size,position,id,preserve=false){
    const anchor=new THREE.Group();anchor.position.set(...position);roomRoot.add(anchor);if(id)tag(anchor,id);
    const url=`${import.meta.env.BASE_URL}assets/models/${asset}/${asset==='proofing-press'?'proofing-press.glb':asset+'_1k.gltf'}`;
    modelRequests.push({asset,url,attach(source){
      if(disposed)return()=>{};
      const object=source.clone(true);
      object.traverse(o=>{if(o.isMesh){
        o.geometry=o.geometry.clone();
        const copy=material=>{const cloned=material.clone();for(const [key,value]of Object.entries(cloned))if(value?.isTexture)cloned[key]=value.clone();return cloned;};
        o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);
      }});
      object.traverse(o=>{for(const material of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])if(material.name==='vintage_oil_lamp_glass'){
        material.map?.dispose();material.alphaMap?.dispose();material.map=null;material.alphaMap=null;
        material.color.set('#efe9dc');material.transparent=true;material.opacity=.22;material.metalness=0;material.roughness=.2;material.depthWrite=false;material.side=THREE.DoubleSide;
      }});
      const bounds=new THREE.Box3().setFromObject(object),extent=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
      const fit=new THREE.Group();fit.scale.set(size[0]/extent.x,size[1]/extent.y,size[2]/extent.z);
      if(preserve)fit.scale.setScalar(size[0]/extent.x);
      object.position.sub(new THREE.Vector3(center.x,bounds.min.y,center.z));fit.add(object);anchor.add(fit);
      object.traverse(o=>{if(o.isMesh){
        if(asset==='wooden_table_02')for(const mat of Array.isArray(o.material)?o.material:[o.material]){mat.roughness=1;mat.roughnessMap?.dispose();mat.roughnessMap=null;mat.metalness=0;}
        o.castShadow=o.receiveShadow=true;
        for(const material of Array.isArray(o.material)?o.material:[o.material])for(const t of Object.values(material))if(t?.isTexture)t.anisotropy=4;
      }});
      invalidate(true);
      return()=>{anchor.remove(fit);release(object);invalidate(true);};
    }});
    return anchor;
  }
  const targets = new Map();
  const lods = [];
  const shutters=[], ambientTweens=new Set(), interactions=new Set(['window','lamp','chair','ink','clock','calendar']), propState={};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function animate(target,values){if(reduced.matches){gsap.set(target,values);invalidate(true);return;}const tween=gsap.to(target,{...values,duration:reduced.matches?0:.55,ease:'power2.inOut',onUpdate:()=>invalidate(true),onComplete:()=>ambientTweens.delete(tween)});ambientTweens.add(tween);}
  
  function box(size, position, material, parent = roomRoot) {
    const geometry = new THREE.BoxGeometry(...size);
    if (material === m.wood || material === m.wall || material === m.dark || material === m.tile) {
      const uv = geometry.attributes.uv;
      const scale = material === m.tile ? 2/3 : material === m.wall ? 2.2 : 1.5;
      const faces = [[size[2],size[1]],[size[2],size[1]],[size[0],size[2]],[size[0],size[2]],[size[0],size[1]],[size[0],size[1]]];
      for(let i=0;i<uv.count;i++){const [w,h]=faces[Math.floor(i/4)];uv.setXY(i,uv.getX(i)*w/scale,uv.getY(i)*h/scale);}
    }
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position); mesh.castShadow = mesh.receiveShadow = true; parent.add(mesh); return mesh;
  }
  function tag(mesh, id) { mesh.userData.interaction = id; if(!targets.has(id))targets.set(id,[]);targets.get(id).push(mesh); return mesh; }
  function detailLOD(position, near, far, distance) {
    const lod=new THREE.LOD();lod.position.set(...position);lod.addLevel(near,0);lod.addLevel(far,distance,.12);roomRoot.add(lod);lods.push(lod);return lod;
  }
  box([8, .12, 8], [0, -.07, 0], m.tile);
  box([8, 4.5, .15], [0, 2.2, -3.2], m.wall);
  box([.15, 4.5, 7], [-4, 2.2, -.2], m.wall);
  box([.15, 4.5, 7], [4, 2.2, -.2], m.wall);
  box([8,.12,7],[0,4.48,-.2],m.ceiling);
  for(const x of [-2.7,0,2.7])box([.12,.15,7],[x,4.34,-.2],m.wood);
  box([8, .2, .08], [0, .1, -3.1], m.wood);
  // Poster is decorative, not a fabricated archival photograph.
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(.95, .59), new THREE.MeshStandardMaterial({ map: labelTexture('DÂN CHÚNG', 'SÀI GÒN') }));
  poster.position.set(2.6, 3.12, -3.1); roomRoot.add(poster);
  // Window with a warm daylight source.
  tag(box([1.7, 2.15, .1], [0, 2.6, -3.08], m.wood),'window');
  const outsideMap=new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/references/saigon-1930.jpg`,texture=>{if(disposed){texture.dispose();return;}invalidate();});outsideMap.colorSpace=THREE.SRGBColorSpace;
  const outside=new THREE.Mesh(new THREE.PlaneGeometry(1.48,1.94),new THREE.MeshBasicMaterial({map:outsideMap,color:'#b8ad91'}));outside.position.set(0,2.6,-3.015);roomRoot.add(outside);
  outsideMap.repeat.set(.58,1);outsideMap.offset.set(.21,0);
  box([.08, 2, .15], [0, 2.6, -2.92], m.wood);
  box([1.6, .08, .15], [0, 2.6, -2.92], m.wood);
  // Wooden louvres inspired by period Saigon house construction, not an exact room replica.
  for(const x of [-.59,.59]) {
    const hinge=new THREE.Group();hinge.position.set(Math.sign(x)*.76,2.6,-2.82);roomRoot.add(hinge);shutters.push(hinge);tag(hinge,'window');
    const shutter=new THREE.Group();shutter.position.x=-Math.sign(x)*.17;hinge.add(shutter);
    for(const edge of [-.17,.17])box([.035,1.96,.045],[edge,0,0],m.wood,shutter);
    for(let i=0;i<16;i++){const slat=box([.34,.085,.028],[0,-.88+i*.118,0],m.wood,shutter);slat.rotation.x=-.35;}
  }
  // Small storage shelf and wall documents are illustrative, never archival evidence.
  box([.72,.065,.28],[2.6,2.25,-2.94],m.wood);
  model('mantel_clock_01',[.5,.32,.18],[2.6,2.285,-2.89],'clock',true);
  const notice=new THREE.Mesh(new THREE.PlaneGeometry(.55,.344),new THREE.MeshStandardMaterial({map:labelTexture('DÂN CHÚNG','22 JUILLET 1938'),roughness:1}));notice.position.set(-1.65,2.8,-3.1);roomRoot.add(notice);
  // Desk.
  model('wooden_table_02',[3.4,1.08,1.6],[0,0,-2.1]);
  const chair=model('painted_wooden_chair_01',[.6,1.25,.6],[-.7,0,-.85],'chair');chair.rotation.y=Math.PI;
  function documentProp(id, size, position, title, subtitle, angle = 0) {
    const group = new THREE.Group(); group.position.set(...position); group.rotation.y = angle; roomRoot.add(group);
    box([size[0],.008,size[1]],[0,0,0],m.paper,group);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(size[0]*.96,size[1]*.96),new THREE.MeshStandardMaterial({map:pageTexture(title,subtitle,id==='board'),roughness:1}));
    face.rotation.x=-Math.PI/2;face.position.y=.0045;group.add(face);return tag(group,id);
  }
  const manuscript=documentProp('letter',[.235,.333],[-1.05,1.085,-1.65],'BẢN THẢO','DÂN SINH · DÂN CHỦ',.12);
  const clipMaterial=new THREE.MeshStandardMaterial({color:'#aaa18f',metalness:.65,roughness:.6});
  const clip=new THREE.Mesh(new THREE.TorusGeometry(.018,.002,6,18),clipMaterial);clip.rotation.x=-Math.PI/2;clip.scale.y=2;clip.position.set(-.08,.009,-.14);manuscript.add(clip);
  const photo=documentProp('photo',[.31,.42],[-.65,1.085,-2.4],'ẢNH SƯU TẬP','THAM KHẢO THỊ GIÁC',-.15);
  const photoFace=photo.children[1];
  const photoMap=new THREE.TextureLoader().load(`${import.meta.env.BASE_URL}assets/references/dan-chung.jpg`,texture=>{if(disposed){texture.dispose();return;}invalidate();});
  photoMap.colorSpace=THREE.SRGBColorSpace;photoMap.anisotropy=4;
  photoFace.material.map.dispose();photoFace.material.map=photoMap;
  // Key the supplied collage's white surround in the shader; retain original file unchanged.
  photoFace.material.transparent=true;photoFace.material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
    float surround=min(diffuseColor.r,min(diffuseColor.g,diffuseColor.b));
    diffuseColor.a *= 1.0-smoothstep(0.82,0.96,surround);`);};photoFace.material.needsUpdate=true;
  model('painted_wooden_cabinet',[.8,.91,.55],[-2.1,0,-.8],'drawer');
  documentProp('board',[.46,.63],[-.2,1.085,-1.85],'DÂN CHÚNG','SÀI GÒN · DÂN SINH · DÂN CHỦ');
  model('vintage_oil_lamp',[.24,.5,.24],[-1.25,1.08,-2.65],'lamp');
  const lampLight=new THREE.PointLight('#ffc075',.7,1.8);lampLight.position.set(-1.25,1.34,-2.65);roomRoot.add(lampLight);
  model('wooden_bookshelf_worn',[1.5,2.35,.6],[-2.65,0,-2.2]);
  const bookNear=new THREE.Group(),bookFar=new THREE.Group();
  box([.23,.55,.4],[0,0,0],m.paper,bookNear);
  for(const x of [-.125,.125])box([.018,.57,.43],[x,0,0],m.red,bookNear);
  box([.26,.57,.035],[0,0,-.2],m.red,bookNear);
  for(let y=-.24;y<.25;y+=.025)box([.23,.002,.008],[0,y,.203],m.gold,bookNear);
  box([.26,.57,.43],[0,0,0],m.red,bookFar);
  const notebook=tag(detailLOD([-2.85,1.45+.57*.7/2,-2.16],bookNear,bookFar,3.45),'notebook');notebook.scale.setScalar(.7);
  const archive=new THREE.Group();archive.position.set(-2.3,.92,-2.1);roomRoot.add(archive);tag(archive,'archive');
  for(let i=0;i<7;i++)box([.52,.038,.43],[0,-.15+i*.043,0],m.paper,archive);
  box([.07,.32,.445],[0,0,0],m.red,archive);
  for (let i = 0; i < 5; i++) box([.08, .25+i*.02, .26], [-3.15+i*.17, 1.89+(.25+i*.02)/2, -2.18], i%2 ? m.dark : m.red);
  // Printing station: stylized prop, not a claim about an original machine.

  const press=model('proofing-press',[1.45,1,1],[2.75,0,-.6],'proof',true);
  documentProp('proof',[.235,.333],[1.08,1.085,-1.58],'BẢN IN THỬ','ĐỐI CHIẾU TRƯỚC KHI IN',-.08);
  // Small working props keep the table lived-in without adding invented archival text.
  const ink=new THREE.Group();ink.position.set(.7,1.08,-2.55);roomRoot.add(ink);tag(ink,'ink');
  const inkGlass=new THREE.MeshStandardMaterial({color:'#202b24',roughness:.45,metalness:0});
  const bottle=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,.11,12),inkGlass);bottle.position.y=.055;ink.add(bottle);
  const inkCap=box([.09,.022,.09],[0,.12,0],m.dark,ink);
  for(let i=0;i<3;i++){const pencil=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.25,6),m.wood);pencil.rotation.z=Math.PI/2;pencil.rotation.y=.1*i;pencil.position.set(.38,1.091,-2.5+i*.025);roomRoot.add(pencil);}
  const calendarMaps=[calendarTexture(6),calendarTexture(7)];
  const calendar=new THREE.Mesh(new THREE.PlaneGeometry(.4,.56),new THREE.MeshStandardMaterial({map:calendarMaps[0],roughness:1}));calendar.position.set(1.35,2.75,-3.105);roomRoot.add(calendar);tag(calendar,'calendar');
  box([.42,.035,.035],[1.35,3.045,-3.07],m.wood);
  function calendarTexture(month){
    const canvas=document.createElement('canvas');canvas.width=600;canvas.height=840;const ctx=canvas.getContext('2d');ctx.fillStyle='#d7c9a6';ctx.fillRect(0,0,600,840);ctx.fillStyle='#63271f';ctx.textAlign='center';ctx.font='700 46px "Noto Serif"';ctx.fillText(month===6?'JUILLET':'AOÛT',300,100);ctx.font='400 28px "Noto Serif"';ctx.fillText('1938',300,145);
    ctx.font='400 20px "Noto Serif"';['L','M','M','J','V','S','D'].forEach((day,i)=>ctx.fillText(day,68+i*77,220));
    const start=(new Date(Date.UTC(1938,month,1)).getUTCDay()+6)%7,days=new Date(Date.UTC(1938,month+1,0)).getUTCDate();ctx.fillStyle='#403827';ctx.font='400 28px "Noto Serif"';for(let day=1;day<=days;day++){const cell=start+day-1;ctx.fillText(String(day),68+(cell%7)*77,290+Math.floor(cell/7)*76);}
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
  }
  function interact(id){
    propState[id]=!propState[id];const active=propState[id];
    if(id==='window')shutters.forEach((hinge,i)=>animate(hinge.rotation,{y:active?(i===0?-.95:.95):0}));
    if(id==='lamp')animate(lampLight,{intensity:active?0:.7});
    if(id==='chair')animate(chair.position,{z:active?-.55:-.85});
    if(id==='ink')animate(inkCap.position,{x:active?.12:0,y:active?.011:.12});
    if(id==='calendar'){calendar.material.map=calendarMaps[active?1:0];calendar.material.needsUpdate=true;invalidate();}
    return active;
  }
  const ambient = new THREE.HemisphereLight('#e7e5df', '#322b24', .9); roomRoot.add(ambient);
  const sun = new THREE.DirectionalLight('#eee5d4', 1.45); sun.position.set(0,3.8,-2.85);sun.target.position.set(0,.7,-.7);roomRoot.add(sun.target); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left=-5; sun.shadow.camera.right=5; sun.shadow.camera.top=5; sun.shadow.camera.bottom=-5; sun.shadow.bias=-.001;
  roomRoot.add(sun);
  return { targets, press, lods, modelRequests, interactions, interact, dispose() {
    ambientTweens.forEach(t=>t.kill());calendarMaps.forEach(t=>t.dispose());
    disposed=true;
    const geometries = new Set(), materials = new Set(), textures = new Set();
    scene.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) for (const material of Array.isArray(o.material) ? o.material : [o.material]) { materials.add(material); for(const value of Object.values(material))if(value?.isTexture)textures.add(value); } });
    m.dispose(); geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
  } };
}
