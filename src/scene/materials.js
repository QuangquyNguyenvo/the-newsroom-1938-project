import * as THREE from 'three';

function canvasTexture(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  draw(canvas.getContext('2d'));
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
export function makeMaterials(invalidate = () => {}) {
  let disposed = false;
  const owned = new Set();
  const reliefMaps = new Map();
  const loader = new THREE.TextureLoader();
  function load(path, material, key, color = false) {
    const texture = loader.load(`${import.meta.env.BASE_URL}assets/textures/${path}`, (texture) => {
      if (disposed) {
        texture.dispose();
        return;
      }
      invalidate();
    });
    texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
    owned.add(texture);
    material[key] = texture;
  }
  function pbr(asset, options) {
    const material = new THREE.MeshStandardMaterial(options);
    load(`pbr/${asset}_diff_1k.jpg`, material, 'map', true);
    load(`pbr/${asset}_nor_gl_1k.jpg`, material, 'normalMap');
    load(`pbr/${asset}_rough_1k.jpg`, material, 'roughnessMap');
    return material;
  }
  function relief(kind) {
    if (reliefMaps.has(kind)) return reliefMaps.get(kind);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext('2d'),
      image = ctx.createImageData(512, 512);
    let seed = 1938;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    for (let y = 0; y < 512; y++)
      for (let x = 0; x < 512; x++) {
        const joint = kind === 'tile' && (x % 256 < 3 || y % 256 < 3);
        const u = (x / 512) * Math.PI * 2,
          v = (y / 512) * Math.PI * 2;
        // Broad, continuous plaster undulation, not pixel noise under grazing light.
        const plaster =
          150 +
          12 * Math.sin(u * 3 + 0.6 * Math.sin(v * 2)) * Math.cos(v * 4) +
          4 * Math.sin(u * 11 + v * 7);
        const value =
          kind === 'plaster'
            ? plaster
            : joint
              ? 75
              : kind === 'paper'
                ? 155 + random() * 16
                : 155 + random() * 12;
        const i = (y * 512 + x) * 4;
        image.data[i] = image.data[i + 1] = image.data[i + 2] = value;
        image.data[i + 3] = 255;
      }
    ctx.putImageData(image, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    owned.add(texture);
    reliefMaps.set(kind, texture);
    return texture;
  }
  const limewash = canvasTexture((ctx) => {
    const image = ctx.createImageData(512, 512);
    for (let y = 0; y < 512; y++)
      for (let x = 0; x < 512; x++) {
        const u = (x / 512) * Math.PI * 2,
          v = (y / 512) * Math.PI * 2;
        // Hand-brushed lime: broad uneven coats, faint vertical brush drag, a few pale blooms.
        const wash =
          5 * Math.sin(u + Math.sin(v)) * Math.cos(v * 2) +
          3 * Math.sin(u * 3 + v * 2) +
          2.2 * Math.sin(u * 23 + 1.5 * Math.sin(v * 3)) +
          3 * Math.sin(u * 2 + 1.7) * Math.sin(v * 5 + u);
        const i = (y * 512 + x) * 4;
        image.data[i] = 236 + wash;
        image.data[i + 1] = 233 + wash;
        image.data[i + 2] = 226 + wash * 1.15;
        image.data[i + 3] = 255;
      }
    ctx.putImageData(image, 0, 0);
  });
  limewash.wrapS = limewash.wrapT = THREE.RepeatWrapping;
  limewash.anisotropy = 8;
  owned.add(limewash);
  const edges = canvasTexture((ctx) => {
    ctx.fillStyle = '#dfd3b5';
    ctx.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 4) {
      ctx.fillStyle = y % 12 === 0 ? '#b7a98c' : '#c9bc9e';
      ctx.fillRect(0, y, 512, 1);
      ctx.fillStyle = '#f0e5cd';
      ctx.fillRect(0, y + 1, 512, 1);
    }
  });
  edges.anisotropy = 8;
  owned.add(edges);
  // Late-1930s Saigon shophouse interior: yellow limewash above a darker painted dado,
  // with damp at the skirting and lamp soot under the ceiling. The band is placed by world
  // height so it lines up across every wall segment and around the openings.
  const wall = new THREE.MeshStandardMaterial({
    color: '#efd9a2',
    map: limewash,
    roughness: 0.97,
    bumpMap: relief('plaster'),
    bumpScale: 0.0016,
  });
  const dado = {
    uDadoHeight: { value: 0.98 },
    uDadoColor: { value: new THREE.Color('#6f7f68') },
    uDadoLine: { value: new THREE.Color('#3f4a3c') },
  };
  wall.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, dado);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying vec3 vWallPosition;`)
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>\nvWallPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWallPosition;
        uniform float uDadoHeight;
        uniform vec3 uDadoColor;
        uniform vec3 uDadoLine;`,
      )
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        {
          float height = vWallPosition.y;
          float wear = 0.012 * sin(vWallPosition.x * 9.0 + vWallPosition.z * 7.0);
          float above = smoothstep(uDadoHeight - 0.003, uDadoHeight + 0.003, height);
          float line = smoothstep(uDadoHeight - 0.03, uDadoHeight - 0.024, height) * (1.0 - above);
          float coat = dot(diffuseColor.rgb, vec3(0.333)) / 0.72;
          vec3 lower = mix(uDadoColor, uDadoLine, line) * coat;
          diffuseColor.rgb = mix(lower, diffuseColor.rgb, above);
          float damp = 1.0 - smoothstep(0.0, 0.42 + wear * 6.0, height);
          float soot = smoothstep(2.75, 3.4, height);
          diffuseColor.rgb *= 1.0 - 0.2 * damp - 0.1 * soot;
        }`,
      );
  };
  wall.customProgramCacheKey = () => 'limewash-dado';
  const materials = {
    wood: pbr('wood_table_001', { roughness: 0.85, normalScale: new THREE.Vector2(0.3, 0.3) }),
    wall,
    ceiling: new THREE.MeshStandardMaterial({ map: limewash, roughness: 1, color: '#ded8c6' }),
    tile: new THREE.MeshStandardMaterial({
      color: '#cbc5b7',
      roughness: 0.91,
      metalness: 0,
      bumpMap: relief('tile'),
      bumpScale: 0.005,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: '#d7d6bd',
      transparent: true,
      opacity: 0.28,
      roughness: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    dark: pbr('rusty_painted_metal', {
      color: '#504a42',
      metalness: 0.25,
      roughness: 0.85,
      normalScale: new THREE.Vector2(0.035, 0.035),
    }),
    paper: new THREE.MeshStandardMaterial({
      color: '#e5d6b3',
      roughness: 1,
      bumpMap: relief('paper'),
      bumpScale: 0.00025,
    }),
    pageEdges: new THREE.MeshStandardMaterial({ map: edges, roughness: 1 }),
    charcoalCloth: new THREE.MeshStandardMaterial({
      color: '#3d423b',
      roughness: 0.96,
      bumpMap: relief('plaster'),
      bumpScale: 0.0003,
    }),
    folder: new THREE.MeshStandardMaterial({ color: '#b9a178', roughness: 1 }),
    red: new THREE.MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.85,
      side: THREE.DoubleSide,
    }),
    gold: new THREE.MeshStandardMaterial({ color: '#a98b50', metalness: 0.4, roughness: 0.55 }),
  };
  load('archival-paper.webp', materials.paper, 'map', true);
  load('notebook-cloth.webp', materials.red, 'map', true);
  load('saigon-cement-tile.webp', materials.tile, 'map', true);
  Object.defineProperty(materials, 'dispose', {
    value: () => {
      disposed = true;
      owned.forEach((t) => t.dispose());
    },
  });
  return materials;
}

export function labelTexture(title, subtitle = '') {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#eee3c9';
  ctx.fillRect(0, 0, 1024, 640);
  ctx.strokeStyle = '#6d1a23';
  ctx.lineWidth = 10;
  ctx.strokeRect(34, 34, 956, 572);
  ctx.fillStyle = '#231d17';
  ctx.textAlign = 'center';
  ctx.font = '700 82px "Noto Serif"';
  ctx.fillText(title, 512, 280, 890);
  ctx.fillStyle = '#30251e';
  ctx.font = '400 26px "Be Vietnam Pro"';
  ctx.fillText(subtitle, 512, 390, 870);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Desk props show the same content the reader opens, so what you see is what you click.
function wrap(ctx, text, x, y, width, lineHeight, maxLines = 99) {
  const words = String(text).split(/\s+/);
  let line = '',
    count = 0;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width && line) {
      ctx.fillText(line, x, y);
      y += lineHeight;
      line = word;
      if (++count >= maxLines) return y;
    } else line = test;
  }
  if (line) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}
function fibre(ctx, w, h, base) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  let seed = 11;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = random() > 0.5 ? '#5a462510' : '#ffffff14';
    ctx.fillRect(random() * w, random() * h, 1 + random() * 3, 1 + random() * 2);
  }
  const edge = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.35,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  );
  edge.addColorStop(0, '#0000');
  edge.addColorStop(1, '#6b4a1f33');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);
}
export function propTexture(kind, page = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 704;
  canvas.height = 1000;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  const draw = () => {
    const ctx = canvas.getContext('2d'),
      w = 704,
      h = 1000;
    if (kind === 'board') {
      fibre(ctx, w, h, '#e9e1cc');
      ctx.fillStyle = '#1d1a15';
      ctx.textAlign = 'center';
      ctx.font = '700 96px "Noto Serif"';
      ctx.fillText('DÂN-CHÚNG', w / 2, 118, 640);
      ctx.fillRect(30, 140, w - 60, 2);
      ctx.fillRect(30, 172, w - 60, 2);
      ctx.fillRect(30, 177, w - 60, 2);
      ctx.font = '700 15px "Be Vietnam Pro"';
      ctx.fillText(
        'MẶT TRẬN DÂN CHỦ ĐÔNG DƯƠNG  ✦  DÂN SINH · DÂN CHỦ · HÒA BÌNH',
        w / 2,
        163,
        640,
      );
      ctx.fillStyle = '#8c1f1c';
      ctx.fillRect(w / 2 - 120, 200, 240, 30);
      ctx.fillStyle = '#f3e8cf';
      ctx.font = '700 16px "Be Vietnam Pro"';
      ctx.fillText('BẢN TIN ĐANG BIÊN TẬP', w / 2, 221);
      ctx.fillStyle = '#1d1a15';
      ctx.font = '700 44px "Noto Serif"';
      wrap(ctx, page.title || 'Những điều người dân đang đòi hỏi', w / 2, 290, 620, 52, 2);
      ctx.fillRect(30, 380, w - 60, 1);
      for (let col = 0; col < 3; col++) {
        const x = 34 + col * 214;
        ctx.fillStyle = '#1d1a15';
        if (col) ctx.fillRect(x - 8, 400, 1, 560);
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = '#6c5c43';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, 405, 196, 60);
        ctx.setLineDash([]);
        ctx.fillStyle = '#1d1a1599';
        for (let line = 0; line < 26; line++)
          ctx.fillRect(x, 490 + line * 18, 196 - (line % 6 === 5 ? 60 : 0), 3);
      }
      return;
    }
    if (kind === 'proof') {
      fibre(ctx, w, h, '#ece4cf');
      ctx.fillStyle = '#26211a';
      ctx.textAlign = 'left';
      ctx.font = '700 40px "Noto Serif"';
      ctx.fillText('BẢN IN THỬ', 50, 90);
      ctx.font = '20px "Noto Serif"';
      ctx.fillText('Đối chiếu trước khi in', 50, 124);
      ctx.fillRect(50, 145, w - 100, 3);
      ctx.font = '400 23px "Noto Serif"';
      const end = wrap(ctx, page.text || '', 50, 195, w - 100, 36);
      ctx.fillStyle = '#26211a55';
      for (let line = 0; line < 14; line++)
        ctx.fillRect(50, end + 20 + line * 28, w - 100 - (line % 5 === 4 ? 180 : 0), 4);
      ctx.strokeStyle = '#a3261f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(540, 205, 110, 30, -0.08, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#a3261f';
      ctx.font = '700 26px "Noto Serif"';
      ctx.fillText('kiểm tra nguồn!', 440, 290);
      return;
    }
    // Manuscript: ruled paper with blue-ink italic, the same page the reader opens first.
    fibre(ctx, w, h, '#e8dcbc');
    ctx.strokeStyle = '#7d8fa655';
    ctx.lineWidth = 2;
    for (let y = 150; y < h - 40; y += 42) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w - 40, y);
      ctx.stroke();
    }
    ctx.strokeStyle = '#a3261f66';
    ctx.beginPath();
    ctx.moveTo(90, 40);
    ctx.lineTo(90, h - 30);
    ctx.stroke();
    ctx.fillStyle = '#2b2419';
    ctx.textAlign = 'left';
    ctx.font = '700 36px "Noto Serif"';
    wrap(ctx, page.title || '', 110, 110, w - 160, 44, 1);
    ctx.fillStyle = '#23305a';
    ctx.font = '27px "Noto Serif"';
    wrap(ctx, page.text || '', 110, 184, w - 160, 42, 17);
  };
  draw();
  document.fonts?.ready.then(() => {
    draw();
    texture.needsUpdate = true;
  });
  return texture;
}
// Old photo print: white border, sepia tone, image cropped to cover (no background keying).
export function photoPrintTexture(image) {
  const canvas = document.createElement('canvas');
  canvas.width = 744;
  canvas.height = 1008;
  const ctx = canvas.getContext('2d'),
    w = 744,
    h = 1008,
    pad = 44;
  fibre(ctx, w, h, '#efe7d4');
  const iw = w - pad * 2,
    ih = h - pad * 2 - 90,
    scale = Math.max(iw / image.width, ih / image.height);
  const sw = iw / scale,
    sh = ih / scale;
  ctx.save();
  ctx.filter = 'grayscale(1) sepia(.55) contrast(1.15) brightness(.95)';
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, pad, pad, iw, ih);
  ctx.restore();
  const fade = ctx.createRadialGradient(
    w / 2,
    pad + ih / 2,
    ih * 0.3,
    w / 2,
    pad + ih / 2,
    ih * 0.8,
  );
  fade.addColorStop(0, '#0000');
  fade.addColorStop(1, '#3b28124d');
  ctx.fillStyle = fade;
  ctx.fillRect(pad, pad, iw, ih);
  ctx.fillStyle = '#3a2f22';
  ctx.textAlign = 'center';
  ctx.font = '26px "Noto Serif"';
  ctx.fillText('Các số Dân Chúng · ảnh tham khảo', w / 2, h - pad - 30);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}
