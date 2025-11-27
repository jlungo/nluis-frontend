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
type MeshParams = {
  fg: string;
  bg?: string | null;
  width?: number;
  spacing?: number;
};
type StripesParams = {
  fg: string;
  bg?: string | null;
  width?: number;
  spacing?: number;
  orientation?: 'horizontal' | 'vertical';
};
type CrossParams = {
  fg: string;
  bg?: string | null;
  width?: number;
  spacing?: number;
};
type CheckerboardParams = {
  fg: string;
  bg?: string | null;
  size?: number;
};
type CirclesParams = {
  fg: string;
  bg?: string | null;
  radius?: number;
  spacing?: number;
  strokeWidth?: number;
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

function drawMeshPattern(canvas: HTMLCanvasElement, p: MeshParams) {
  const ctx = canvas.getContext("2d")!;
  const spacing = Math.max(4, p.spacing ?? 12);
  const W = spacing * 2;
  canvas.width = W;
  canvas.height = W;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = Math.max(1, p.width ?? 1);
  // Draw vertical lines
  for (let x = 0; x <= W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, W);
    ctx.stroke();
  }
  // Draw horizontal lines
  for (let y = 0; y <= W; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
}

function drawStripesPattern(canvas: HTMLCanvasElement, p: StripesParams) {
  const ctx = canvas.getContext("2d")!;
  const spacing = Math.max(4, p.spacing ?? 8);
  const W = spacing * 2;
  canvas.width = W;
  canvas.height = W;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = Math.max(1, p.width ?? 2);
  if (p.orientation === 'horizontal') {
    for (let y = 0; y <= W; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
  } else {
    // vertical
    for (let x = 0; x <= W; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, W);
      ctx.stroke();
    }
  }
}

function drawCrossPattern(canvas: HTMLCanvasElement, p: CrossParams) {
  const ctx = canvas.getContext("2d")!;
  const spacing = Math.max(4, p.spacing ?? 12);
  const W = spacing * 2;
  canvas.width = W;
  canvas.height = W;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = Math.max(1, p.width ?? 1);
  const diag = W * 1.5;
  // Draw diagonal lines (45°)
  ctx.save();
  ctx.translate(W / 2, W / 2);
  ctx.rotate((45 * Math.PI) / 180);
  for (let x = -W; x <= W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, -diag);
    ctx.lineTo(x, diag);
    ctx.stroke();
  }
  ctx.restore();
  // Draw diagonal lines (135°)
  ctx.save();
  ctx.translate(W / 2, W / 2);
  ctx.rotate((135 * Math.PI) / 180);
  for (let x = -W; x <= W; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, -diag);
    ctx.lineTo(x, diag);
    ctx.stroke();
  }
  ctx.restore();
}

function drawCheckerboardPattern(canvas: HTMLCanvasElement, p: CheckerboardParams) {
  const ctx = canvas.getContext("2d")!;
  const size = Math.max(4, p.size ?? 8);
  const W = size * 2;
  canvas.width = W;
  canvas.height = W;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.fillStyle = p.fg;
  // Draw alternating squares
  ctx.fillRect(0, 0, size, size);
  ctx.fillRect(size, size, size, size);
}

function drawCirclesPattern(canvas: HTMLCanvasElement, p: CirclesParams) {
  const ctx = canvas.getContext("2d")!;
  const spacing = Math.max(8, p.spacing ?? 16);
  const radius = Math.max(2, p.radius ?? 4);
  const W = spacing;
  canvas.width = W;
  canvas.height = W;
  if (p.bg) {
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, W);
  }
  ctx.strokeStyle = p.fg;
  ctx.lineWidth = Math.max(1, p.strokeWidth ?? 1);
  ctx.beginPath();
  ctx.arc(W / 2, W / 2, radius, 0, Math.PI * 2);
  ctx.stroke();
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
      // No style JSON → fall back to legacy solid color if present
      const legacyColor = asHex(lu.color);
      if (legacyColor) {
        solidColorByLU.set(lu.id, legacyColor);
        // Also create a solid-color pattern so everything can be driven via fill-pattern
        const key = `solid:${legacyColor}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            canvas.width = 8;
            canvas.height = 8;
            ctx.fillStyle = legacyColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          },
        });
      }
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
      // No polygon fill style → fall back to legacy color
      const legacyColor2 = asHex(lu.color);
      if (legacyColor2) {
        solidColorByLU.set(lu.id, legacyColor2);
        const key = `solid:${legacyColor2}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            canvas.width = 8;
            canvas.height = 8;
            ctx.fillStyle = legacyColor2;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          },
        });
      }
      continue;
    }
    const fill = poly.fill;
    // Pure solid fill from style JSON → solid color + auto-generated solid pattern
    if (fill.type === "solid" && asHex(fill.color)) {
      const solid = fill.color;
      solidColorByLU.set(lu.id, solid);

      const key = `solid:${solid}`;
      patternByLU.set(lu.id, {
        key,
        draw: (canvas) => {
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          canvas.width = 8;
          canvas.height = 8;
          ctx.fillStyle = solid;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        },
      });
      continue;
    }
    // Pattern fill: register pattern + background color
    if (fill.type === "pattern") {
      const bgColor = asHex(fill.bg) || asHex(lu.color) || "#ffffff";
      solidColorByLU.set(lu.id, bgColor);

      // Simple solid-color pattern: sprite is just a flat color
      if (fill.pattern === "solid") {
        const solid = asHex(fill.fg || fill.color || bgColor) || bgColor;
        const key = `solid:${solid}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => {
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            canvas.width = 8;
            canvas.height = 8;
            ctx.fillStyle = solid;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          },
        });
      } else if (fill.pattern === "hatch") {
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
      } else if (fill.pattern === "mesh") {
        const p: MeshParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          width: Number(fill.width ?? 1),
          spacing: Number(fill.spacing ?? 12),
        };
        const key = `mesh:${p.fg}:${p.bg || "none"}:${p.width}:${p.spacing}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => drawMeshPattern(canvas, p),
        });
      } else if (fill.pattern === "vertical-stripes" || fill.pattern === "horizontal-stripes") {
        const p: StripesParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          width: Number(fill.width ?? 2),
          spacing: Number(fill.spacing ?? 8),
          orientation: fill.pattern === "horizontal-stripes" ? "horizontal" : "vertical",
        };
        const key = `stripes:${p.orientation}:${p.fg}:${p.bg || "none"}:${p.width}:${p.spacing}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => drawStripesPattern(canvas, p),
        });
      } else if (fill.pattern === "cross") {
        const p: CrossParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          width: Number(fill.width ?? 1),
          spacing: Number(fill.spacing ?? 12),
        };
        const key = `cross:${p.fg}:${p.bg || "none"}:${p.width}:${p.spacing}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => drawCrossPattern(canvas, p),
        });
      } else if (fill.pattern === "checkerboard") {
        const p: CheckerboardParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          size: Number(fill.size ?? 8),
        };
        const key = `checkerboard:${p.fg}:${p.bg || "none"}:${p.size}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => drawCheckerboardPattern(canvas, p),
        });
      } else if (fill.pattern === "circles") {
        const p: CirclesParams = {
          fg: fill.fg || "#000",
          bg: fill.bg || null,
          radius: Number(fill.radius ?? 4),
          spacing: Number(fill.spacing ?? 16),
          strokeWidth: Number(fill.strokeWidth ?? 1),
        };
        const key = `circles:${p.fg}:${p.bg || "none"}:${p.radius}:${p.spacing}:${p.strokeWidth}`;
        patternByLU.set(lu.id, {
          key,
          draw: (canvas) => drawCirclesPattern(canvas, p),
        });
      }
    }
  }

  if (map) {
    const promises: Promise<void>[] = [];
    for (const [, patt] of patternByLU.entries()) {
      const name = `lu-pattern-${patt.key}`;
      if (!map.hasImage(name)) {
        const canvas = makeCanvas(32, 32);
        patt.draw(canvas);
        const promise = createImageBitmap(canvas).then((imageBitmap) => {
          if (!map.hasImage(name)) {
            map.addImage(name, imageBitmap, { pixelRatio: 1 });
          }
        }).catch((err) => {
          console.error(`Failed to create pattern ${name}:`, err);
        });
        promises.push(promise);
      }
    }
    // Wait for all patterns to load
    if (promises.length > 0) {
      Promise.all(promises);
    }
  }

  return { solidColorByLU, patternByLU, badgeByLU };
}
