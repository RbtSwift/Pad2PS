import type {ComboDefinition} from '../data/comboLibrary';
import type {ConsoleLayout, Ps2ButtonId} from '../data/ps2Mapping';

interface ExportCombosPngOptions {
  gameTitle: string;
  combos: ComboDefinition[];
  controllerName: string | null;
  layout?: ConsoleLayout;
  fileNameSuffix?: string;
}

const CANVAS_WIDTH = 1080;
const OUTER_PAD = 42;
const CARD_PAD_X = 36;
const BADGE_HEIGHT = 48;
const ARROW_WIDTH = 24;
const ROW_GAP = 14;
const COMBO_PADDING = 24;
const COMBO_GAP = 20;

function slugify(input: string): string {
  return (
    input
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'lista'
  );
}

function getActiveNeonTheme(): {hex: string; rgb: string} {
  if (typeof window === 'undefined') {
    return {hex: '#FF2E93', rgb: '255, 46, 147'};
  }
  const styles = window.getComputedStyle(document.documentElement);
  const hex = styles.getPropertyValue('--accent-color').trim() || '#FF2E93';
  const rgb = styles.getPropertyValue('--accent-rgb').trim() || '255, 46, 147';
  return {hex, rgb};
}

function getBadgeWidth(btnId: Ps2ButtonId): number {
  if (btnId === 'start' || btnId === 'select') {
    return 86;
  }
  if (btnId === 'l1' || btnId === 'l2' || btnId === 'l3' || btnId === 'r1' || btnId === 'r2' || btnId === 'r3') {
    return 54;
  }
  return 48;
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

function layoutSequenceRows(
  sequence: Ps2ButtonId[],
  maxRowWidth: number
): Ps2ButtonId[][] {
  const rows: Ps2ButtonId[][] = [];
  let currentRow: Ps2ButtonId[] = [];
  let currentWidth = 0;

  for (const btnId of sequence) {
    const bw = getBadgeWidth(btnId);
    const needed = currentRow.length === 0 ? bw : ARROW_WIDTH + bw;

    if (currentRow.length > 0 && currentWidth + needed > maxRowWidth) {
      rows.push(currentRow);
      currentRow = [btnId];
      currentWidth = bw;
    } else {
      currentRow.push(btnId);
      currentWidth += needed;
    }
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }
  return rows;
}

function drawButtonGlyph(
  ctx: CanvasRenderingContext2D,
  btnId: Ps2ButtonId,
  cx: number,
  cy: number,
  accentHex: string,
  layout: ConsoleLayout
) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (btnId) {
    case 'triangle': {
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx + 10.5, cy + 8.5);
      ctx.lineTo(cx - 10.5, cy + 8.5);
      ctx.closePath();
      ctx.stroke();
      break;
    }
    case 'circle': {
      ctx.strokeStyle = '#FB7185';
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(cx, cy, 9.5, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'cross': {
      ctx.strokeStyle = '#60A5FA';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 8);
      ctx.lineTo(cx + 8, cy + 8);
      ctx.moveTo(cx + 8, cy - 8);
      ctx.lineTo(cx - 8, cy + 8);
      ctx.stroke();
      break;
    }
    case 'square': {
      ctx.strokeStyle = '#F472B6';
      ctx.lineWidth = 2.6;
      drawRoundedRect(ctx, cx - 8.5, cy - 8.5, 17, 17, 2);
      ctx.stroke();
      break;
    }
    case 'up':
    case 'down':
    case 'left':
    case 'right': {
      ctx.strokeStyle = '#FAFAFA';
      ctx.fillStyle = 'rgba(250, 250, 250, 0.12)';
      ctx.lineWidth = 2.1;
      ctx.translate(cx, cy);
      const angle =
        btnId === 'up'
          ? 0
          : btnId === 'right'
            ? Math.PI / 2
            : btnId === 'down'
              ? Math.PI
              : -Math.PI / 2;
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(8.5, -0.5);
      ctx.lineTo(3.5, -0.5);
      ctx.lineTo(3.5, 10);
      ctx.lineTo(-3.5, 10);
      ctx.lineTo(-3.5, -0.5);
      ctx.lineTo(-8.5, -0.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'l1':
    case 'r1': {
      const label =
        layout === 'psp' ? (btnId === 'l1' ? 'L' : 'R') : btnId.toUpperCase();
      ctx.fillStyle = '#FAFAFA';
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, cx, cy + 1);
      break;
    }
    case 'l2':
    case 'r2':
    case 'l3':
    case 'r3':
    case 'ps': {
      ctx.fillStyle = accentHex;
      ctx.font = '700 16px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btnId.toUpperCase(), cx, cy + 1);
      break;
    }
    case 'start':
    case 'select': {
      ctx.fillStyle = '#FAFAFA';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(btnId.toUpperCase(), cx, cy + 1);
      break;
    }
  }

  ctx.restore();
}

function drawSeparatorArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  cy: number,
  accentRgb: string
) {
  ctx.save();
  ctx.strokeStyle = `rgba(${accentRgb}, 0.72)`;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const midX = x + ARROW_WIDTH / 2;
  ctx.beginPath();
  ctx.moveTo(midX - 5, cy);
  ctx.lineTo(midX + 5, cy);
  ctx.moveTo(midX + 1.5, cy - 3.5);
  ctx.lineTo(midX + 5, cy);
  ctx.lineTo(midX + 1.5, cy + 3.5);
  ctx.stroke();
  ctx.restore();
}

export async function exportCombosToPng({
  gameTitle,
  combos,
  controllerName,
  layout = 'ps2',
  fileNameSuffix,
}: ExportCombosPngOptions): Promise<void> {
  if (typeof document === 'undefined' || combos.length === 0) {
    return;
  }

  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => {});
  }

  const {hex: accentHex, rgb: accentRgb} = getActiveNeonTheme();
  const innerCardWidth = CANVAS_WIDTH - OUTER_PAD * 2;
  const comboInnerWidth = innerCardWidth - CARD_PAD_X * 2 - COMBO_PADDING * 2;

  // Pre-calculate dynamic heights
  const headerHeight = controllerName ? 154 : 126;
  const footerHeight = 68;

  const measuredCombos = combos.map((combo) => {
    const rows = layoutSequenceRows(combo.sequence, comboInnerWidth);
    const titleBlockHeight = combo.subtitle ? 58 : 34;
    const sequenceHeight = rows.length * BADGE_HEIGHT + Math.max(0, rows.length - 1) * ROW_GAP;
    const boxHeight = COMBO_PADDING * 2 + titleBlockHeight + 14 + sequenceHeight;
    return {combo, rows, titleBlockHeight, boxHeight};
  });

  const bodyHeight =
    measuredCombos.reduce((sum, item) => sum + item.boxHeight, 0) +
    Math.max(0, measuredCombos.length - 1) * COMBO_GAP;

  const innerCardHeight = headerHeight + 24 + bodyHeight + 28 + footerHeight;
  const canvasHeight = OUTER_PAD * 2 + innerCardHeight;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  // 1. Deep Black Background + Subtle Geometric Grid + Radial Glow
  ctx.fillStyle = '#09090B';
  ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);

  const radial = ctx.createRadialGradient(
    CANVAS_WIDTH / 2,
    canvasHeight * 0.25,
    20,
    CANVAS_WIDTH / 2,
    canvasHeight * 0.35,
    CANVAS_WIDTH * 0.72
  );
  radial.addColorStop(0, `rgba(${accentRgb}, 0.14)`);
  radial.addColorStop(0.55, `rgba(${accentRgb}, 0.03)`);
  radial.addColorStop(1, 'rgba(9, 9, 11, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, CANVAS_WIDTH, canvasHeight);

  ctx.strokeStyle = `rgba(${accentRgb}, 0.065)`;
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= CANVAS_WIDTH; gx += 36) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, canvasHeight);
    ctx.stroke();
  }
  for (let gy = 0; gy <= canvasHeight; gy += 36) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(CANVAS_WIDTH, gy);
    ctx.stroke();
  }

  // 2. Inner Dark Card with Active Neon Glow Border
  ctx.save();
  ctx.shadowColor = accentHex;
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#121216';
  ctx.strokeStyle = accentHex;
  ctx.lineWidth = 2.2;
  drawRoundedRect(ctx, OUTER_PAD, OUTER_PAD, innerCardWidth, innerCardHeight, 22);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 3. Header Section
  const contentX = OUTER_PAD + CARD_PAD_X;
  let cursorY = OUTER_PAD + 38;

  ctx.fillStyle = accentHex;
  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('GUIA DE COMBOS & CÓDIGOS', contentX, cursorY);

  cursorY += 26;
  ctx.fillStyle = '#FAFAFA';
  ctx.font = '800 40px "Outfit", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(gameTitle, contentX, cursorY, innerCardWidth - CARD_PAD_X * 2);

  if (controllerName) {
    cursorY += 52;
    ctx.fillStyle = '#A1A1AA';
    ctx.font = '500 16px "JetBrains Mono", monospace';
    ctx.fillText(`Controle: ${controllerName}`, contentX, cursorY, innerCardWidth - CARD_PAD_X * 2);
  }

  const dividerY = OUTER_PAD + headerHeight;
  ctx.strokeStyle = `rgba(${accentRgb}, 0.24)`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(contentX, dividerY);
  ctx.lineTo(OUTER_PAD + innerCardWidth - CARD_PAD_X, dividerY);
  ctx.stroke();

  // 4. Body (Combo Cards)
  cursorY = dividerY + 24;
  const comboBoxWidth = innerCardWidth - CARD_PAD_X * 2;

  for (const item of measuredCombos) {
    const {combo, rows, titleBlockHeight, boxHeight} = item;

    ctx.fillStyle = '#0B0B0F';
    ctx.strokeStyle = `rgba(${accentRgb}, 0.28)`;
    ctx.lineWidth = 1.4;
    drawRoundedRect(ctx, contentX, cursorY, comboBoxWidth, boxHeight, 16);
    ctx.fill();
    ctx.stroke();

    const innerX = contentX + COMBO_PADDING;
    let innerY = cursorY + COMBO_PADDING;

    ctx.fillStyle = '#FAFAFA';
    ctx.font = '700 22px "Outfit", "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(combo.title, innerX, innerY, comboInnerWidth);

    if (combo.subtitle) {
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '400 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(combo.subtitle, innerX, innerY + 30, comboInnerWidth);
    }

    innerY += titleBlockHeight + 14;

    for (let rIdx = 0; rIdx < rows.length; rIdx++) {
      const row = rows[rIdx];
      let badgeX = innerX;
      const badgeY = innerY + rIdx * (BADGE_HEIGHT + ROW_GAP);

      for (let bIdx = 0; bIdx < row.length; bIdx++) {
        const btnId = row[bIdx];
        const bw = getBadgeWidth(btnId);

        ctx.fillStyle = '#15151C';
        ctx.strokeStyle = `rgba(${accentRgb}, 0.58)`;
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, badgeX, badgeY, bw, BADGE_HEIGHT, 10);
        ctx.fill();
        ctx.stroke();

        drawButtonGlyph(
          ctx,
          btnId,
          badgeX + bw / 2,
          badgeY + BADGE_HEIGHT / 2,
          accentHex,
          layout
        );

        badgeX += bw;
        if (bIdx < row.length - 1) {
          drawSeparatorArrow(ctx, badgeX, badgeY + BADGE_HEIGHT / 2, accentRgb);
          badgeX += ARROW_WIDTH;
        }
      }
    }

    cursorY += boxHeight + COMBO_GAP;
  }

  // 5. Footer Signature
  const footerLineY = OUTER_PAD + innerCardHeight - footerHeight;
  ctx.strokeStyle = `rgba(${accentRgb}, 0.18)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(contentX, footerLineY);
  ctx.lineTo(OUTER_PAD + innerCardWidth - CARD_PAD_X, footerLineY);
  ctx.stroke();

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    'Gerado com Pad2PS • pad2ps.vercel.app',
    CANVAS_WIDTH / 2,
    footerLineY + footerHeight / 2
  );

  // 6. Trigger PNG Download
  const slug = slugify(fileNameSuffix || gameTitle);
  const fileName = `pad2ps-combo-${slug}.png`;

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      const url = blob ? URL.createObjectURL(blob) : canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
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
