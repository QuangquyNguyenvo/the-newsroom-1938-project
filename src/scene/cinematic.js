import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

// Linear-light grading precedes AgX/output conversion. UI never enters this pipeline.
const gradeShader = {
  uniforms: { tDiffuse: { value: null }, amount: { value: 0.85 } },
  vertexShader:
    'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader: `uniform sampler2D tDiffuse; uniform float amount; varying vec2 vUv;
    void main(){ vec4 pixel=texture2D(tDiffuse,vUv); vec3 c=pixel.rgb;
      float l=dot(c,vec3(.2126,.7152,.0722));
      vec3 shadows=vec3(.94,.985,1.045), highlights=vec3(1.04,1.005,.945);
      vec3 tint=mix(shadows,highlights,smoothstep(.03,.85,l));
      vec3 graded=mix(vec3(l),c,.96)*tint;
      float vignette=smoothstep(.25,.78,length((vUv-.5)*vec2(1.,.88)));
      c=mix(c,graded,amount)*(1.-vignette*.16*amount);
      gl_FragColor=vec4(max(c,vec3(0.)),pixel.a);
    }`,
};

export function createCinematic(renderer, scene, camera, initial, container) {
  let settings,
    composer,
    passes = [],
    ao,
    bloom,
    bokeh,
    grade,
    fxaa,
    signature = '',
    width = 0,
    height = 0,
    ratio = 0;
  const hidden = [];
  const hide = () =>
    hidden.forEach((object) => {
      object.visible = false;
    });
  const show = () =>
    hidden.forEach((object) => {
      object.visible = true;
    });
  function excludeTransparent(pass) {
    const render = pass.render;
    pass.render = function (...args) {
      hide();
      try {
        return render.apply(this, args);
      } finally {
        show();
      }
    };
  }
  function collectTransparent(object) {
    if (!object.isMesh && !object.isSprite && !object.isPoints) return;
    const transparent = (material) => material?.transparent && material.depthWrite === false;
    if (
      object.isSprite ||
      object.isPoints ||
      (Array.isArray(object.material)
        ? object.material.every(transparent)
        : transparent(object.material))
    )
      hidden.push(object);
  }
  const lookupListeners = [];
  let requestFrame = () => {};
  const focus = new THREE.Vector3();
  const inverseRotation = new THREE.Quaternion();
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  function disposePasses() {
    for (const [image, callback] of lookupListeners) image.removeEventListener('load', callback);
    lookupListeners.length = 0;
    for (const pass of passes) {
      pass.dispose?.();
      if (pass.isGTAO) {
        pass.gtaoMaterial.dispose();
        pass.blendMaterial.dispose();
      }
    }
    composer?.dispose();
    passes = [];
  }
  function build() {
    disposePasses();
    composer = new EffectComposer(renderer);
    ao = bloom = bokeh = null;
    const add = (pass) => {
      passes.push(pass);
      composer.addPass(pass);
      return pass;
    };
    add(new RenderPass(scene, camera));
    if (settings.ao !== 'off') {
      ao = add(new GTAOPass(scene, camera, 1, 1));
      ao.isGTAO = true;
      ao.blendIntensity = 0.62;
      excludeTransparent(ao);
      ao.updateGtaoMaterial({
        radius: 0.22,
        thickness: 0.18,
        distanceExponent: 1.2,
        distanceFallOff: 0.6,
        samples: settings.ao === 'high' ? 16 : 8,
        screenSpaceRadius: false,
      });
      ao.updatePdMaterial({ radius: 4, samples: settings.ao === 'high' ? 16 : 8 });
    }
    if (settings.dof) {
      bokeh = add(new BokehPass(scene, camera, { focus: 4, aperture: 0.00065, maxblur: 0.001 }));
      excludeTransparent(bokeh);
    }
    if (settings.bloom) bloom = add(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.14, 0.35, 1.65));
    grade = add(new ShaderPass(gradeShader));
    // SMAA targets geometry edges rather than smoothing texture detail across the frame.
    fxaa = null;
    if (settings.dpr >= 1.65) {
      const smaa = add(new SMAAPass());
      // Lookup images load asynchronously, including when atmospheric animation is off.
      for (const texture of [smaa._areaTexture, smaa._searchTexture]) {
        const image = texture.image,
          callback = () => requestFrame();
        image.addEventListener('load', callback);
        lookupListeners.push([image, callback]);
      }
    }
    add(new OutputPass());
    if (settings.dpr < 1.65) fxaa = add(new ShaderPass(FXAAShader));
    width = height = ratio = 0;
  }
  function configure(next) {
    settings = next;
    const nextSignature = [next.ao, next.dof, next.bloom, next.dpr >= 1.65 ? 'smaa' : 'fxaa'].join(
      ':',
    );
    if (signature !== nextSignature || !composer) {
      signature = nextSignature;
      build();
    }
    grade.uniforms.amount.value = next.film;
    renderer.toneMappingExposure = 1.08 * next.exposure;
    container.dataset.postprocessing = nextSignature;
  }
  function resize(w, h, dpr) {
    if (w === width && h === height && dpr === ratio) return;
    width = w;
    height = h;
    ratio = dpr;
    composer.setPixelRatio(dpr);
    composer.setSize(w, h);
    // AO gets its own smaller G-buffer. High mode preserves the full output size.
    if (ao) {
      const scale = settings.ao === 'high' ? 1 : 0.6;
      ao.setSize(
        Math.max(1, Math.round(w * dpr * scale)),
        Math.max(1, Math.round(h * dpr * scale)),
      );
    }
    fxaa?.uniforms.resolution.value.set(1 / (w * dpr), 1 / (h * dpr));
    if (bokeh) bokeh.uniforms.aspect.value = camera.aspect;
    container.dataset.renderResolution = `${Math.round(w * dpr)} × ${Math.round(h * dpr)}`;
  }
  configure(initial);
  return {
    configure,
    render(state, delta, target) {
      requestFrame = state.invalidate;
      resize(state.size.width, state.size.height, renderer.getPixelRatio());
      if (bokeh) {
        // Focus on the actual station/inspection target without blurring HTML documents.
        inverseRotation.copy(camera.quaternion).invert();
        focus.copy(target).sub(camera.position).applyQuaternion(inverseRotation);
        const distance = THREE.MathUtils.clamp(-focus.z, 0.35, 12);
        bokeh.uniforms.focus.value = reduced.matches
          ? distance
          : THREE.MathUtils.lerp(
              bokeh.uniforms.focus.value,
              distance,
              1 - Math.exp(-Math.min(delta, 0.1) * 5),
            );
        if (Math.abs(bokeh.uniforms.focus.value - distance) > 0.01) state.invalidate();
      }
      // Transparent glass, shafts and dust must not write opaque depth/AO silhouettes.
      hidden.length = 0;
      if (ao || bokeh) scene.traverseVisible(collectTransparent);
      const autoReset = renderer.info.autoReset;
      renderer.info.autoReset = false;
      renderer.info.reset();
      try {
        composer.render(delta);
      } finally {
        renderer.info.autoReset = autoReset;
      }
      container.dataset.drawCalls = String(renderer.info.render.calls);
      container.dataset.triangles = String(renderer.info.render.triangles);
    },
    dispose: disposePasses,
  };
}
