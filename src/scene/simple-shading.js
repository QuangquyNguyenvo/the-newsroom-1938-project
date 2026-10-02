import * as THREE from 'three';

// A CPU renderer spends nearly all of its time in the physically based fragment shader.
// Simple shading gives every standard material a Lambert twin with the same colour and
// texture, swaps the twins in for the frame and swaps the originals back when asked.
// Geometry, resolution and textures stay untouched, so the room keeps its sharpness.
export function createSimpleShading() {
  const twins = new Map();
  function twin(material) {
    if (!material?.isMeshStandardMaterial) return material;
    let copy = twins.get(material);
    if (!copy) {
      copy = new THREE.MeshLambertMaterial();
      THREE.Material.prototype.copy.call(copy, material);
      copy.map = material.map;
      copy.alphaMap = material.alphaMap;
      copy.emissiveMap = material.emissiveMap;
      copy.onBeforeCompile = material.onBeforeCompile;
      if (Object.hasOwn(material, 'customProgramCacheKey'))
        copy.customProgramCacheKey = material.customProgramCacheKey;
      copy.userData = { full: material };
      twins.set(material, copy);
    }
    // Values the scene animates on the original keep driving the twin.
    copy.color.copy(material.color);
    copy.emissive.copy(material.emissive);
    copy.emissiveIntensity = material.emissiveIntensity;
    copy.opacity = material.opacity;
    copy.visible = material.visible;
    return copy;
  }
  const full = (material) => material?.userData?.full || material;
  // Anisotropic filtering is cheap on a GPU and one of the dearest things on a CPU.
  const filtered = new Map();
  function filter(texture, simple) {
    if (!texture) return;
    if (simple && texture.anisotropy > 1) {
      filtered.set(texture, texture.anisotropy);
      texture.anisotropy = 1;
      texture.needsUpdate = true;
    } else if (!simple && filtered.has(texture)) {
      texture.anisotropy = filtered.get(texture);
      filtered.delete(texture);
      texture.needsUpdate = true;
    }
  }
  return {
    // `lite` swaps the materials; `plain` also drops anisotropic filtering.
    apply(scene, lite, plain = lite) {
      const swap = lite ? twin : full;
      scene.traverse((object) => {
        if (!object.isMesh) return;
        const material = object.material;
        object.material = Array.isArray(material) ? material.map(swap) : swap(material);
        for (const item of Array.isArray(object.material) ? object.material : [object.material])
          filter(item?.map, plain);
      });
    },
    dispose() {
      for (const copy of twins.values()) copy.dispose();
      twins.clear();
    },
  };
}
