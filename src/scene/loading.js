const progress = { active: false, loaded: 0, total: 0, errors: [] };

export function getAssetProgress() {
  return progress;
}

export function trackAssets(manager) {
  progress.active = false;
  progress.loaded = progress.total = 0;
  progress.errors.length = 0;
  const update = (_url, loaded, total) => {
    progress.active = loaded < total;
    progress.loaded = loaded;
    progress.total = total;
  };
  manager.onStart = update;
  manager.onProgress = update;
  manager.onLoad = () => {
    progress.active = false;
  };
  manager.onError = (url) => {
    progress.errors.push(url);
  };
}
