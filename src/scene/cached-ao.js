import { Matrix4, NoBlending } from 'three';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';

// Dust and flame are excluded by the caller. Reuse AO only for identical opaque geometry.
export class CachedAOPass extends GTAOPass {
  constructor(...args) {
    super(...args);
    this.cacheEnabled = true;
    this.cacheValid = false;
    this.cachedView = new Matrix4();
    this.cachedProjection = new Matrix4();
    this.meshes = [];
    this.reused = false;
  }
  invalidate() {
    this.cacheValid = false;
  }
  setSize(...args) {
    super.setSize(...args);
    this.invalidate();
  }
  updateGtaoMaterial(...args) {
    super.updateGtaoMaterial(...args);
    this.invalidate();
  }
  updatePdMaterial(...args) {
    super.updatePdMaterial(...args);
    this.invalidate();
  }
  unchanged() {
    const cameraChanged =
      !this.cachedView.equals(this.camera.matrixWorldInverse) ||
      !this.cachedProjection.equals(this.camera.projectionMatrix);
    if (cameraChanged) {
      this.cachedView.copy(this.camera.matrixWorldInverse);
      this.cachedProjection.copy(this.camera.projectionMatrix);
      if (this.cacheValid) return false;
    }
    let same = this.cacheValid && !cameraChanged;
    let count = 0;
    let cacheable = true;
    this.scene.traverseVisible((object) => {
      if (!object.isMesh) return;
      // Animated skin/morph deformation needs its normal buffer every frame.
      if (object.isSkinnedMesh || object.morphTargetInfluences?.length) cacheable = false;
      const geometry = object.geometry;
      const position = geometry.attributes.position;
      const normal = geometry.attributes.normal;
      const index = geometry.index;
      const instances = object.instanceMatrix;
      let previous = this.meshes[count++];
      if (!previous) {
        previous = { matrix: new Matrix4() };
        this.meshes.push(previous);
        same = false;
      }
      if (
        previous.object !== object ||
        previous.geometry !== geometry ||
        !previous.matrix.equals(object.matrixWorld) ||
        previous.position !== position ||
        previous.positionVersion !== position?.version ||
        previous.normal !== normal ||
        previous.normalVersion !== normal?.version ||
        previous.index !== index ||
        previous.indexVersion !== index?.version ||
        previous.instances !== instances ||
        previous.instanceVersion !== instances?.version ||
        previous.instanceCount !== object.count ||
        previous.rangeStart !== geometry.drawRange.start ||
        previous.rangeCount !== geometry.drawRange.count ||
        previous.layers !== object.layers.mask ||
        previous.cameraLayers !== this.camera.layers.mask
      ) {
        same = false;
        Object.assign(previous, {
          object,
          geometry,
          position,
          positionVersion: position?.version,
          normal,
          normalVersion: normal?.version,
          index,
          indexVersion: index?.version,
          instances,
          instanceVersion: instances?.version,
          instanceCount: object.count,
          rangeStart: geometry.drawRange.start,
          rangeCount: geometry.drawRange.count,
          layers: object.layers.mask,
          cameraLayers: this.camera.layers.mask,
        });
        previous.matrix.copy(object.matrixWorld);
      }
    });
    if (count !== this.meshes.length) same = false;
    this.meshes.length = count;
    this.cacheValid = cacheable;
    return same && cacheable;
  }
  render(renderer, writeBuffer, readBuffer, ...args) {
    this.reused = this.cacheEnabled && this.unchanged() && this.output === GTAOPass.OUTPUT.Default;
    if (!this.reused) {
      super.render(renderer, writeBuffer, readBuffer, ...args);
      return;
    }
    const target = this.renderToScreen ? null : writeBuffer;
    // Composite the saved AO onto this frame's fresh lighting and atmosphere.
    this.copyMaterial.uniforms.tDiffuse.value = readBuffer.texture;
    this.copyMaterial.blending = NoBlending;
    this._renderPass(renderer, this.copyMaterial, target);
    this.blendMaterial.uniforms.intensity.value = this.blendIntensity;
    this.blendMaterial.uniforms.tDiffuse.value = this.pdRenderTarget.texture;
    this._renderPass(renderer, this.blendMaterial, target);
  }
  dispose() {
    super.dispose();
    this.meshes.length = 0;
    // GTAOPass currently leaves these two materials to the owner.
    this.gtaoMaterial.dispose();
    this.blendMaterial.dispose();
  }
}
