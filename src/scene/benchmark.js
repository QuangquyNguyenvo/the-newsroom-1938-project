// Opt-in profiling. ?benchmark=1 runs continuously; =ambient keeps the game's cadence.
export function createBenchmark(renderer, container) {
  const gl = renderer.getContext();
  const timer = gl.getExtension('EXT_disjoint_timer_query_webgl2');
  const debug = gl.getExtension('WEBGL_debug_renderer_info');
  const pending = [];
  let warmup = 60;
  let frames = 0;
  let first = 0;
  let previous = 0;
  let submitted = 0;
  let gpuTotal = 0;
  let gpuSamples = 0;
  let active = null;
  let start = 0;
  let complete = false;
  let dimensions = '';
  const intervals = [];
  const hardware = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : 'unavailable';
  function poll() {
    while (pending.length) {
      const query = pending[0];
      if (!gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)) break;
      pending.shift();
      if (!gl.getParameter(timer.GPU_DISJOINT_EXT)) {
        gpuTotal += gl.getQueryParameter(query, gl.QUERY_RESULT) / 1e6;
        gpuSamples++;
      }
      gl.deleteQuery(query);
    }
  }
  function reset() {
    for (const query of pending) gl.deleteQuery(query);
    pending.length = 0;
    warmup = 60;
    frames = first = previous = submitted = gpuTotal = gpuSamples = 0;
    complete = false;
    intervals.length = 0;
    delete container.dataset.benchmarkResult;
    container.dataset.benchmarkStatus = 'waiting';
  }
  return {
    reset,
    begin(stable) {
      const size = `${renderer.domElement.width}x${renderer.domElement.height}`;
      if (size !== dimensions) {
        reset();
        dimensions = size;
      }
      if (!stable) {
        reset();
        return;
      }
      poll();
      start = performance.now();
      if (complete || warmup > 0) return;
      if (timer && pending.length < 8) {
        active = gl.createQuery();
        gl.beginQuery(timer.TIME_ELAPSED_EXT, active);
      }
    },
    end(stable) {
      const now = performance.now();
      if (active) {
        gl.endQuery(timer.TIME_ELAPSED_EXT);
        pending.push(active);
        active = null;
      }
      if (!stable || complete) return false;
      if (warmup > 0) {
        warmup--;
        container.dataset.benchmarkStatus = `warmup:${warmup}`;
        return true;
      }
      if (!first) first = start;
      if (previous) intervals.push(start - previous);
      previous = start;
      submitted += now - start;
      frames++;
      container.dataset.benchmarkStatus = `sampling:${frames}/180`;
      if (frames < 180) return true;
      poll();
      complete = true;
      const sorted = intervals.slice().sort((a, b) => a - b);
      container.dataset.benchmarkStatus = 'complete';
      container.dataset.benchmarkResult = JSON.stringify({
        fps: +(((frames - 1) * 1000) / (start - first)).toFixed(2),
        frameP95Ms: +sorted[Math.floor(sorted.length * 0.95)].toFixed(2),
        submitMs: +(submitted / frames).toFixed(2),
        gpuMs: gpuSamples ? +(gpuTotal / gpuSamples).toFixed(2) : null,
        gpuSamples,
        frames,
        hardware,
        preset: container.dataset.graphicsPreset,
        resolution: container.dataset.renderResolution,
        bufferSize: dimensions,
        drawCalls: Number(container.dataset.drawCalls),
        triangles: Number(container.dataset.triangles),
      });
      return false;
    },
    dispose: reset,
  };
}
