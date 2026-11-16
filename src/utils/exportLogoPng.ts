function getActiveNeonTheme(): {hex: string; rgb: string} {
  if (typeof window === 'undefined') {
    return {hex: '#FF2E93', rgb: '255, 46, 147'};
  }
  const styles = window.getComputedStyle(document.documentElement);
  const hex = styles.getPropertyValue('--accent-color').trim() || '#FF2E93';
  const rgb = styles.getPropertyValue('--accent-rgb').trim() || '255, 46, 147';
  return {hex, rgb};
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawControllerEmblem(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  accentHex: string,
  accentRgb: string,
  withOuterSquare = true
) {
  const scale = size / 32;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (withOuterSquare) {
    ctx.fillStyle = '#101015';
    ctx.strokeStyle = `rgba(${accentRgb}, 0.55)`;
    ctx.lineWidth = 1.2;
    drawRoundedRect(ctx, 1, 1, 30, 30, 7);
    ctx.fill();
    ctx.stroke();
  }

  // DualShock silhouette path
  ctx.save();
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 10;
  const padPath = new Path2D(
    'M8.8 10.2C6.4 10.2 4.8 12.1 4.4 14.8L3.4 20.6C3.1 22.6 4.4 24.2 6.1 24.2C7.6 24.2 8.7 22.8 9.6 20.8C10.2 19.4 10.9 19 11.9 19.6C12.8 20.2 14.1 20.5 16 20.5C17.9 20.5 19.2 20.2 20.1 19.6C21.1 19 21.8 19.4 22.4 20.8C23.3 22.8 24.4 24.2 25.9 24.2C27.6 24.2 28.9 22.6 28.6 20.6L27.6 14.8C27.2 12.1 25.6 10.2 23.2 10.2C21.6 10.2 20.6 11 19.5 11.2H12.5C11.4 11 10.4 10.2 8.8 10.2Z'
  );
  ctx.fillStyle = '#15151C';
  ctx.fill(padPath);
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 1.45;
  ctx.lineJoin = 'round';
  ctx.stroke(padPath);
  ctx.restore();

  // D-Pad cross
  ctx.strokeStyle = '#FAFAFA';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(8.1, 15.1);
  ctx.lineTo(10.9, 15.1);
  ctx.moveTo(9.5, 13.7);
  ctx.lineTo(9.5, 16.5);
  ctx.stroke();

  // PlayStation 4 action dots
  const dots: [number, number, string][] = [
    [22.5, 13.2, '#34D399'],
    [24.2, 14.9, '#FB7185'],
    [22.5, 16.6, '#60A5FA'],
    [20.8, 14.9, '#F472B6'],
  ];
  for (const [dx, dy, color] of dots) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(dx, dy, 1.0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Stylized center "2"
  ctx.fillStyle = '#FAFAFA';
  ctx.font = '900 8.5px "Orbitron", "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('2', 16, 15.5);

  ctx.restore();
}

async function triggerCanvasDownload(canvas: HTMLCanvasElement, filename: string): Promise<void> {
  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (blob) {
        URL.revokeObjectURL(url);
      }
      resolve();
    }, 'image/png');
  });
}

export async function exportLogoToPng(): Promise<void> {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => {});
  }

  const {hex: accentHex, rgb: accentRgb} = getActiveNeonTheme();
  const width = 1200;
  const height = 400;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Deep matte dark background + subtle grid
  ctx.fillStyle = '#09090B';
  drawRoundedRect(ctx, 0, 0, width, height, 36);
  ctx.fill();

  const radial = ctx.createRadialGradient(310, 200, 10, 310, 200, 460);
  radial.addColorStop(0, `rgba(${accentRgb}, 0.18)`);
  radial.addColorStop(0.6, `rgba(${accentRgb}, 0.04)`);
  radial.addColorStop(1, 'rgba(9, 9, 11, 0)');
  ctx.fillStyle = radial;
  drawRoundedRect(ctx, 0, 0, width, height, 36);
  ctx.fill();

  ctx.save();
  drawRoundedRect(ctx, 0, 0, width, height, 36);
  ctx.clip();
  ctx.strokeStyle = `rgba(${accentRgb}, 0.065)`;
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= width; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }
  for (let gy = 0; gy <= height; gy += 40) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }
  ctx.restore();

  // Glowing outer neon border
  ctx.save();
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 20;
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 3;
  drawRoundedRect(ctx, 14, 14, width - 28, height - 28, 28);
  ctx.stroke();
  ctx.restore();

  drawControllerEmblem(ctx, 96, 95, 210, accentHex, accentRgb, true);

  // Draw Wordmark "Pad2PS"
  const textX = 358;
  const textY = 204;
  ctx.font = '800 132px "Orbitron", "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';

  const padWidth = ctx.measureText('Pad').width;
  const twoWidth = ctx.measureText('2').width;

  ctx.fillStyle = '#FAFAFA';
  ctx.fillText('Pad', textX, textY);

  ctx.save();
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 28;
  ctx.fillStyle = accentHex;
  ctx.fillText('2', textX + padWidth + 4, textY);
  ctx.restore();

  ctx.fillStyle = '#FAFAFA';
  ctx.fillText('PS', textX + padWidth + twoWidth + 8, textY);

  await triggerCanvasDownload(canvas, 'pad2ps-logo.png');
}

export async function exportLogoIconToPng(): Promise<void> {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => {});
  }

  const {hex: accentHex, rgb: accentRgb} = getActiveNeonTheme();
  const size = 512;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // Deep square rounded backdrop
  ctx.fillStyle = '#09090B';
  drawRoundedRect(ctx, 0, 0, size, size, 108);
  ctx.fill();

  const radial = ctx.createRadialGradient(size / 2, size / 2, 16, size / 2, size / 2, 240);
  radial.addColorStop(0, `rgba(${accentRgb}, 0.22)`);
  radial.addColorStop(0.65, `rgba(${accentRgb}, 0.05)`);
  radial.addColorStop(1, 'rgba(9, 9, 11, 0)');
  ctx.fillStyle = radial;
  drawRoundedRect(ctx, 0, 0, size, size, 108);
  ctx.fill();

  // Outer glowing border
  ctx.save();
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 22;
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, 18, 18, size - 36, size - 36, 94);
  ctx.stroke();
  ctx.restore();

  // Centered controller emblem filling the 1:1 icon cleanly
  drawControllerEmblem(ctx, 26, 26, size - 52, accentHex, accentRgb, false);

  await triggerCanvasDownload(canvas, 'pad2ps-controle-icone.png');
}
