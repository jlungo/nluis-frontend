import type { LandUseDto } from "@/queries/useSetupQuery";

type HatchParams = {
  fg: string;
  bg?: string | null;
  angle?: number;
  width?: number;
  spacing?: number;
};
type DotsParams = {
  fg: string;
  bg?: string | null;
  size?: number;
  spacing?: number;
};

function makeCanvas(w = 32, h = 32) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function drawHatchPattern(canvas: HTMLCanvasElement, p: HatchParams) {
  const ctx = canvas.getContext("2d")!;
  const step = Math.max(4, p.spacing ?? 8);
  const W = step * 2;
  canvas.width = W;
  canvas.height = W;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = Math.max(1, p.width ?? 1);
  const ang = ((p.angle ?? 45) * Math.PI) / 180;
  const diag = W * 1.5;
  ctx.translate(W / 2, W / 2);
  ctx.rotate(ang);
  for (let x = -W; x <= W; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, -diag);
    ctx.lineTo(x, diag);
    ctx.stroke();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function drawDotsPattern(canvas: HTMLCanvasElement, p: DotsParams) {
  const size = Math.max(2, p.size ?? 2);
  const spacing = Math.max(size * 2, p.spacing ?? 6);
  const W = spacing;
  canvas.width = W;
  canvas.height = W;
  const ctx = canvas.getContext("2d")!;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.fillStyle = p.fg;
  ctx.beginPath();
  ctx.arc(W / 2, W / 2, size, 0, Math.PI * 2);
  ctx.fill();
}

function drawImagePattern(
  canvas: HTMLCanvasElement,
  url: string,
  bg?: string | null,
  onReady?: () => void
) {
  const ctx = canvas.getContext("2d")!;
  const W = 64;
  canvas.width = W;
  canvas.height = W;
  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, W);
  }
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;
  img.onload = () => {
    ctx.drawImage(img, 0, 0, W, W);
    onReady?.();
  };
}

export function parseLandUseStyles(landUses: LandUseDto[], map?: mapboxgl.Map) {
  const solidColorByLU = new Map<number, string>();
  const patternByLU = new Map<
    number,
    { key: string; draw: (c: HTMLCanvasElement) => void }
  >();
  const badgeByLU = new Map<
    number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { text: string; textStyle?: any; box?: any }
  >();
  const asHex = (c?: string | null) =>
    typeof c === "string" && c.startsWith("#") ? c : undefined;

  for (const lu of landUses) {
    const s = lu.style;
    if (!s || !Array.isArray(s.layers)) {
      if (lu.color) solidColorByLU.set(lu.id, lu.color);
      continue;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const poly = s.layers.find((L: any) => L?.type === "polygon");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const badge = s.layers.find((L: any) => L?.type === "badge");
    if (badge?.text) {
      badgeByLU.set(lu.id, {
        text: String(badge.text),
        textStyle: badge.textStyle || {},
        box: badge.box || {},
      });
    }
    if (!poly || !poly.fill) {
      if (lu.color) solidColorByLU.set(lu.id, lu.color);
      continue;
    }
    const fill = poly.fill;
    if (fill.type === "solid" && asHex(fill.color)) {
      solidColorByLU.set(lu.id, fill.color);
      continue;
    }
    if (fill.type === "pattern") {
      if (fill.pattern === "hatch") {
        const p: HatchParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          angle: Number(fill.angle ?? 45),
          width: Number(fill.width ?? 1),
          spacing: Number(fill.spacing ?? 8),
        };
        const key = `hatch:${p.fg}:${p.bg || "none"}:${p.angle}:${p.width}:${
          p.spacing
        }`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => drawHatchPattern(canvas, p),
        });
      } else if (fill.pattern === "dots") {
        const p: DotsParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          size: Number(fill.size ?? 2),
          spacing: Number(fill.spacing ?? 6),
        };
        const key = `dots:${p.fg}:${p.bg || "none"}:${p.size}:${p.spacing}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => drawDotsPattern(canvas, p),
        });
      } else if (fill.pattern === "image" && typeof fill.url === "string") {
        const key = `img:${fill.url}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => drawImagePattern(canvas, fill.url, fill.bg),
        });
      }
    }
  }

  if (map) {
    for (const [, patt] of patternByLU.entries()) {
      const name = `lu-pattern-${patt.key}`;
      if (!map.hasImage(name)) {
        const canvas = makeCanvas(32, 32);
        patt.draw(canvas);
        createImageBitmap(canvas).then((imageBitmap) => {
          map.addImage(name, imageBitmap, { pixelRatio: 1 });
        });
      }
    }
  }

  return { solidColorByLU, patternByLU, badgeByLU };
}
