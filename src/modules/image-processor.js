/**
 * ===== IMAGE PROCESSING PIPELINE =====
 * Edge detection, mask generation, frequency/phase computation
 */

/**
 * Hash function untuk noise generation
 */
function hashN(x, y) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = ((n ^ (n >> 13)) * 1274126177) | 0;
  n = n ^ (n >> 16);
  return (n & 0x7fffffff) / 0x7fffffff;
}

/**
 * Smoothstep interpolation
 */
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Value noise untuk single octave
 */
function valueNoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = smoothstep(x - ix);
  const fy = smoothstep(y - iy);

  const n00 = hashN(ix, iy);
  const n10 = hashN(ix + 1, iy);
  const n01 = hashN(ix, iy + 1);
  const n11 = hashN(ix + 1, iy + 1);

  const nx0 = n00 * (1 - fx) + n10 * fx;
  const nx1 = n01 * (1 - fx) + n11 * fx;

  return nx0 * (1 - fy) + nx1 * fy;
}

/**
 * Compute edge map dari image data
 * @param {ImageData} imgData
 * @param {number} w - Width
 * @param {number} h - Height
 * @returns {Float32Array} Edge map
 */
export function computeEdgeMap(imgData, w, h) {
  const data = imgData.data;
  const edge = new Float32Array(w * h);

  const getGray = (x, y) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return 0;
    const i = (y * w + x) * 4;
    return (data[i] + data[i + 1] + data[i + 2]) / 3;
  };

  // Sobel operator
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const gx =
        -getGray(x - 1, y - 1) +
        getGray(x + 1, y - 1) -
        2 * getGray(x - 1, y) +
        2 * getGray(x + 1, y) -
        getGray(x - 1, y + 1) +
        getGray(x + 1, y + 1);

      const gy =
        -getGray(x - 1, y - 1) -
        2 * getGray(x, y - 1) -
        getGray(x + 1, y - 1) +
        getGray(x - 1, y + 1) +
        2 * getGray(x, y + 1) +
        getGray(x + 1, y + 1);

      edge[y * w + x] = Math.sqrt(gx * gx + gy * gy) / 1024;
    }
  }

  return edge;
}

/**
 * Dilate morphological operation
 */
function dilateMask(mask, rows, cols) {
  const newMask = mask.map((r) => [...r]);

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (mask[r][c]) continue;

      let hasNeighbor = false;
      for (let dr = -1; dr <= 1 && !hasNeighbor; dr++) {
        for (let dc = -1; dc <= 1 && !hasNeighbor; dc++) {
          if (mask[r + dr] && mask[r + dr][c + dc]) {
            hasNeighbor = true;
          }
        }
      }

      if (hasNeighbor) {
        newMask[r][c] = true;
      }
    }
  }

  return newMask;
}

/**
 * Erode morphological operation
 */
function erodeMask(mask, rows, cols) {
  const newMask = mask.map((r) => [...r]);

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (!mask[r][c]) continue;

      let allNeighbors = true;
      for (let dr = -1; dr <= 1 && allNeighbors; dr++) {
        for (let dc = -1; dc <= 1 && allNeighbors; dc++) {
          if (!mask[r + dr][c + dc]) {
            allNeighbors = false;
          }
        }
      }

      if (!allNeighbors) {
        newMask[r][c] = false;
      }
    }
  }

  return newMask;
}

/**
 * Compute foreground mask menggunakan edge dan salient map
 */
export function computeForegroundMask(
  edgeMap,
  imgData,
  w,
  h,
  cols,
  rows,
  sens
) {
  const threshold = sens / 100;
  const data = imgData.data;

  // Sample corner untuk background color
  let bgR = 0,
    bgG = 0,
    bgB = 0,
    bgCnt = 0;

  const sampleCorner = (startX, startY, endX, endY) => {
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const i = (y * w + x) * 4;
        bgR += data[i];
        bgG += data[i + 1];
        bgB += data[i + 2];
        bgCnt++;
      }
    }
  };

  const s = Math.ceil(Math.min(w, h) * 0.05);
  sampleCorner(0, 0, s, s);
  sampleCorner(w - s, 0, w, s);
  sampleCorner(0, h - s, s, h);
  sampleCorner(w - s, h - s, w, h);

  if (bgCnt > 0) {
    bgR /= bgCnt;
    bgG /= bgCnt;
    bgB /= bgCnt;
  }

  // Compute salient map
  const salientMap = new Float32Array(w * h);

  for (let i = 0; i < w * h; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    salientMap[i] =
      Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2) / 441.67;
  }

  // Initialize mask
  const cx = w / 2;
  const cy = h / 2;
  const maxDist = Math.hypot(cx, cy);
  const cellW = w / cols;
  const cellH = h / rows;

  let mask = Array(rows)
    .fill()
    .map(() => Array(cols).fill(false));

  // Compute cell scores
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = Math.floor(c * cellW);
      const sy = Math.floor(r * cellH);
      const ex = Math.min(Math.floor((c + 1) * cellW), w);
      const ey = Math.min(Math.floor((r + 1) * cellH), h);

      let edgeScore = 0,
        salientScore = 0,
        cnt = 0;

      for (let y = sy; y < ey; y++) {
        for (let x = sx; x < ex; x++) {
          edgeScore += edgeMap[y * w + x];
          salientScore += salientMap[y * w + x];
          cnt++;
        }
      }

      if (cnt > 0) {
        edgeScore /= cnt;
        salientScore /= cnt;
      }

      const centerDist = Math.hypot(
        c * cellW + cellW / 2 - cx,
        r * cellH + cellH / 2 - cy
      );
      const centerBias = 1 - centerDist / maxDist * 0.4;

      const score =
        edgeScore * 0.4 + salientScore * 0.4 + centerBias * 0.2;

      mask[r][c] = score > threshold;
    }
  }

  // Morphological operations
  for (let i = 0; i < 2; i++) {
    mask = dilateMask(mask, rows, cols);
  }
  mask = erodeMask(mask, rows, cols);

  // Fill holes
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (mask[r][c]) continue;

      let hasFg = false;
      for (let dr = -1; dr <= 1 && !hasFg; dr++) {
        for (let dc = -1; dc <= 1 && !hasFg; dc++) {
          if (mask[r + dr] && mask[r + dr][c + dc]) {
            hasFg = true;
          }
        }
      }

      if (hasFg) {
        mask[r][c] = true;
      }
    }
  }

  return mask;
}

/**
 * FIX: Compute local frequency & phase dengan NaN prevention
 */
export function computeLocalFreqPhase(imgData, w, h, cols, rows) {
  const cellW = w / cols;
  const cellH = h / rows;
  const freqGrid = Array(rows)
    .fill()
    .map(() => Array(cols).fill(0));
  const phaseGrid = Array(rows)
    .fill()
    .map(() => Array(cols).fill(0));
  const data = imgData.data;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = Math.floor(c * cellW);
      const sy = Math.floor(r * cellH);
      const ex = Math.min(Math.floor((c + 1) * cellW), w);
      const ey = Math.min(Math.floor((r + 1) * cellH), h);

      // Collect values
      const vals = [];
      for (let y = sy; y < ey; y++) {
        for (let x = sx; x < ex; x++) {
          const i = (y * w + x) * 4;
          vals.push((data[i] + data[i + 1] + data[i + 2]) / (3 * 255));
        }
      }

      if (vals.length < 2) {
        freqGrid[r][c] = 0.5;
        phaseGrid[r][c] = 0;
        continue;
      }

      // Compute frequency (variance)
      const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
      const variance = vals.reduce(
        (a, b) => a + (b - mean) ** 2,
        0
      ) / vals.length;
      freqGrid[r][c] = Math.min(0.95, variance * 1.5);

      // Compute phase (gradient direction)
      let dx = 0,
        dy = 0;
      for (let y = Math.max(1, sy); y < Math.min(ey, h - 1); y++) {
        for (let x = Math.max(1, sx); x < Math.min(ex, w - 1); x++) {
          const i = (y * w + x) * 4;
          const gv = (data[i] + data[i + 1] + data[i + 2]) / 3;

          // FIX: Boundary check untuk prevent array out of bounds
          const iR = (y * w + x + 1) * 4;
          const iD = ((y + 1) * w + x) * 4;

          if (iR >= 0 && iR < data.length - 3 && iD >= 0 && iD < data.length - 3) {
            const gR = (data[iR] + data[iR + 1] + data[iR + 2]) / 3;
            const gD = (data[iD] + data[iD + 1] + data[iD + 2]) / 3;
            dx += gR - gv;
            dy += gD - gv;
          }
        }
      }

      phaseGrid[r][c] = Math.atan2(dy, dx);
    }
  }

  return { freqGrid, phaseGrid };
}

/**
 * Apply color bleed effect
 */
export function applyColorBleed(grid, gridRows, gridCols) {
  if (!grid.length) return;

  const bleed = 0.15;

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      grid[r][c].bledR = grid[r][c].origR;
      grid[r][c].bledG = grid[r][c].origG;
      grid[r][c].bledB = grid[r][c].origB;
    }
  }

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;

          const nr = r + dr;
          const nc = c + dc;

          if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols) {
            if (!grid[nr][nc].isForeground) continue;

            grid[r][c].bledR += (grid[nr][nc].origR - grid[r][c].origR) * bleed;
            grid[r][c].bledG += (grid[nr][nc].origG - grid[r][c].origG) * bleed;
            grid[r][c].bledB += (grid[nr][nc].origB - grid[r][c].origB) * bleed;
          }
        }
      }
    }
  }
}

/**
 * Main grid generation pipeline
 */
export function generateGrid(
  ctxSrc,
  srcCanvas,
  img,
  alphabetSet,
  gridSize,
  objSensValue,
  updateProgress
) {
  if (!img) return { success: false };

  const srcW = srcCanvas.width;
  const srcH = srcCanvas.height;

  if (srcW < 1 || srcH < 1) return { success: false };

  ctxSrc.drawImage(img, 0, 0, srcW, srcH);

  let imgData;
  try {
    imgData = ctxSrc.getImageData(0, 0, srcW, srcH);
  } catch (e) {
    return { success: false, error: 'Gagal baca gambar' };
  }

  const aspect = srcW / srcH;
  let cols = Math.min(gridSize, 90);
  let rows = Math.floor(cols / aspect);
  rows = Math.max(8, Math.min(120, rows));

  updateProgress(0.15);

  const edgeMap = computeEdgeMap(imgData, srcW, srcH);
  updateProgress(0.35);

  const foregroundMask = computeForegroundMask(
    edgeMap,
    imgData,
    srcW,
    srcH,
    cols,
    rows,
    objSensValue
  );
  updateProgress(0.55);

  const { freqGrid, phaseGrid } = computeLocalFreqPhase(
    imgData,
    srcW,
    srcH,
    cols,
    rows
  );
  updateProgress(0.75);

  const cellW = srcW / cols;
  const cellH = srcH / rows;
  const mainChars = alphabetSet.split('');
  const rampChars =
    '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"\'^. ';

  if (!mainChars.length) mainChars.push('A');

  const newGrid = [];

  for (let r = 0; r < rows; r++) {
    newGrid[r] = [];

    for (let c = 0; c < cols; c++) {
      const sx = Math.floor(c * cellW);
      const sy = Math.floor(r * cellH);
      const ex = Math.min(Math.floor((c + 1) * cellW), srcW);
      const ey = Math.min(Math.floor((r + 1) * cellH), srcH);

      let rS = 0,
        gS = 0,
        bS = 0,
        cnt = 0;

      for (let y = sy; y < ey; y++) {
        for (let x = sx; x < ex; x++) {
          const i = (y * srcW + x) * 4;
          rS += imgData.data[i];
          gS += imgData.data[i + 1];
          bS += imgData.data[i + 2];
          cnt++;
        }
      }

      const avgR = cnt ? rS / cnt : 0;
      const avgG = cnt ? gS / cnt : 0;
      const avgB = cnt ? bS / cnt : 0;
      const brightness = cnt ? (rS + gS + bS) / (3 * 255 * cnt) : 0;
      const isFg = foregroundMask[r][c];

      let edgeStr = 0;
      for (let y = sy; y < ey; y++) {
        for (let x = sx; x < ex; x++) {
          edgeStr += edgeMap[y * srcW + x];
        }
      }
      edgeStr = cnt ? edgeStr / cnt : 0;

      newGrid[r][c] = {
        brightness,
        isForeground: isFg,
        origR: avgR,
        origG: avgG,
        origB: avgB,
        bledR: avgR,
        bledG: avgG,
        bledB: avgB,
        freq: freqGrid[r][c],
        phase: phaseGrid[r][c],
        edgeStr,
        gradAngle: phaseGrid[r][c],
        x: c * cellW,
        y: r * cellH,
        w: cellW,
        h: cellH,
        char: ' ',
        isEdgeCell: false,
        phaseOffset: Math.random() * Math.PI * 2
      };
    }
  }

  // Contrast stretching dengan FIX pembagian nol
  let minB = 1,
    maxB = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newGrid[r][c].isForeground) {
        if (newGrid[r][c].brightness < minB) {
          minB = newGrid[r][c].brightness;
        }
        if (newGrid[r][c].brightness > maxB) {
          maxB = newGrid[r][c].brightness;
        }
      }
    }
  }

  // FIX: Cek maxB > minB agar tidak NaN/Infinity
  if (maxB > minB) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newGrid[r][c].isForeground) {
          newGrid[r][c].brightness =
            (newGrid[r][c].brightness - minB) / (maxB - minB);
        }
      }
    }
  }

  // Character assignment
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = newGrid[r][c];

      if (!cell.isForeground) continue;

      const isEdge = cell.edgeStr > 0.2;
      const charSet = isEdge ? mainChars : rampChars.split('');
      let ci = Math.floor(cell.brightness * (charSet.length - 1));
      ci = Math.max(0, Math.min(charSet.length - 1, ci));

      cell.char = charSet[ci];
      cell.isEdgeCell = isEdge;
    }
  }

  applyColorBleed(newGrid, rows, cols);
  updateProgress(1);

  return {
    success: true,
    grid: newGrid,
    gridCols: cols,
    gridRows: rows,
    foregroundMask
  };
}
