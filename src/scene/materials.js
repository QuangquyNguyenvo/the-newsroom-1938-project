import * as THREE from 'three';

function canvasTexture(draw) {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  draw(canvas.getContext('2d'));
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
export function makeMaterials(invalidate = () => {}) {
  let disposed = false;
  const owned = new Set();
  const loader = new THREE.TextureLoader();
  function load(path, material, key, color = false) {
    const texture = loader.load(`${import.meta.env.BASE_URL}assets/textures/${path}`, texture => {
      if (disposed) { texture.dispose(); return; }
      invalidate();
    });
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    owned.add(texture); material[key] = texture;
  }
  function pbr(asset, options) {
    const material = new THREE.MeshStandardMaterial(options);
    load(`pbr/${asset}_diff_1k.jpg`, material, 'map', true);
    load(`pbr/${asset}_nor_gl_1k.jpg`, material, 'normalMap');
    load(`pbr/${asset}_rough_1k.jpg`, material, 'roughnessMap');
    return material;
  }
  const materials = {
    wood: pbr('wood_table_001', {roughness: .85, normalScale: new THREE.Vector2(.3,.3)}),
    wall: new THREE.MeshStandardMaterial({color:'#d4c6a8',roughness:1}),
    ceiling: new THREE.MeshStandardMaterial({roughness:1,color:'#e2ddcc'}),
    tile: new THREE.MeshStandardMaterial({roughness:1,metalness:0}),
    glass: new THREE.MeshStandardMaterial({color:'#d7d6bd',transparent:true,opacity:.28,roughness:.25,side:THREE.DoubleSide,depthWrite:false}),
    dark: pbr('rusty_painted_metal', {color: '#504a42', metalness: .25, roughness: .85, normalScale: new THREE.Vector2(.035,.035)}),
    paper: new THREE.MeshStandardMaterial({color: '#e5d6b3', roughness: 1}),
    red: new THREE.MeshStandardMaterial({color: '#ffffff', roughness: .85, side: THREE.DoubleSide}),
    gold: new THREE.MeshStandardMaterial({color: '#a98b50', metalness: .4, roughness: .55}),
  };
  load('archival-paper.png', materials.paper, 'map', true);
  load('limewash-wall.png', materials.wall, 'map', true);
  load('ceiling-lime.png', materials.ceiling, 'map', true);
  load('notebook-cloth.png', materials.red, 'map', true);
  load('saigon-cement-tile.png', materials.tile, 'map', true);
  Object.defineProperty(materials, 'dispose', {value: () => { disposed = true; owned.forEach(t => t.dispose()); }});
  return materials;
}

export function labelTexture(title, subtitle = '') {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#eee3c9'; ctx.fillRect(0, 0, 1024, 640);
  ctx.strokeStyle = '#6d1a23'; ctx.lineWidth = 10; ctx.strokeRect(34, 34, 956, 572);
  ctx.fillStyle = '#231d17'; ctx.textAlign = 'center'; ctx.font = '700 82px "Noto Serif"';
  ctx.fillText(title, 512, 280, 890);
  ctx.fillStyle = '#30251e'; ctx.font = '400 26px "Be Vietnam Pro"'; ctx.fillText(subtitle, 512, 390, 870);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}

// Portrait print surfaces keep glyphs proportional to the physical sheet.
export function pageTexture(title,subtitle='',newspaper=false){
  const canvas=document.createElement('canvas');canvas.width=704;canvas.height=1000;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#e5d8b8';ctx.fillRect(0,0,704,1000);
  ctx.fillStyle='#30291e';ctx.textAlign='center';ctx.font=`700 ${newspaper?68:48}px "Noto Serif"`;ctx.fillText(title,352,115,620);
  ctx.font='400 19px "Noto Serif"';ctx.fillText(subtitle,352,160,620);
  ctx.strokeStyle='#635039';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(38,185);ctx.lineTo(666,185);ctx.stroke();
  const columns=newspaper?3:1,span=628/columns;
  ctx.fillStyle='#6b5e45';
  for(let col=0;col<columns;col++)for(let line=0;line<38;line++){
    const width=span-16-(line%7===6?span*.23:0);ctx.globalAlpha=.34;
    ctx.fillRect(38+col*span,220+line*17,width,2);
  }
  ctx.globalAlpha=1;const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
