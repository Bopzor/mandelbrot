type Pixel = { x: number; y: number };
type Point = { re: number; im: number };
export type Color = [number, number, number];

class Canvas {
  width = 0;
  height = 0;
  ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    const canvas = document.querySelector('canvas');

    if (canvas) {
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = canvas.getContext('2d');
    }
  }

  draw({ x, y }: Pixel, color: Color) {
    this.ctx!.fillStyle = this.getColorFromComponents(color);
    this.ctx!.fillRect(x, y, 1, 1);
  }

  private getColorFromComponents([r, g, b]: Color) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  centerX(x: number) {
    return x - this.width / 2;
  }

  centerY(y: number) {
    return y - this.height / 2;
  }
}

class Plan {
  x = 0.6;
  y = 0;

  zoom = 200;

  pixelToPoint({ x, y }: Pixel): Point {
    // prettier-ignore
    return {
      re: x / this.zoom - this.x,
      im: y / this.zoom - this.y,
    };
  }
}

const canvas = new Canvas();
const plan = new Plan();

const defaultPalette: Record<number, Color> = {
  0: [255, 0, 0],
  0.5: [0, 255, 0],
  1: [0, 0, 255],
};

export const normalize = ({ value, range }: { value: number; range: [number, number] }) => {
  if (range[1] - range[0] === 0) {
    return 0;
  }

  return (value - range[0]) / (range[1] - range[0]);
};

export const toComponent = (value: number, min = 0, max = 255): number => {
  if (min > max) {
    return min - Math.floor(value * (min - max));
  }

  return Math.round(value * (max - min));
};

const interpolateColor = ([r1, g1, b1]: Color, [r2, g2, b2]: Color, value = 0.5): Color => {
  // prettier-ignore
  return [
    toComponent(value, r1, r2),
    toComponent(value, g1, g2),
    toComponent(value, b1, b2),
  ];
};

export const getColorFormProgression = (progression: number, palette = defaultPalette): Color => {
  const ranges: number[] = Object.keys(palette).map(Number).sort();

  const idx = ranges.findIndex((range) => progression <= range);
  const startIdx = idx - 1 < 0 ? ranges.length - 1 : idx - 1;
  const endIdx = idx < 0 ? 0 : idx;

  const startColor = palette[ranges[startIdx]];
  const endColor = palette[ranges[endIdx]];

  const value = normalize({ value: progression, range: [ranges[startIdx], ranges[endIdx]] });

  return interpolateColor(startColor, endColor, value);
};

export const getColorFormIter = (iter: number, maxIter: number): Color => {
  const coef = iter / maxIter;

  let r = 0;
  let g = 0;
  let b = 0;

  if (coef < 1 / 3) {
    g = Math.floor(coef * 3 * 255);
  } else if (coef < 2 / 3) {
    g = 255 - Math.floor((coef - 1 / 3) * 3 * 255);
    b = Math.floor((coef - 1 / 3) * 3 * 255);
  } else {
    b = 255 - Math.floor((coef - 2 / 3) * 3 * 255);
    r = Math.floor((coef - 2 / 3) * 3 * 255);
  }

  return [r, g, b];
};

const mandelbrot = (maxIter = 10) => {
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const c = plan.pixelToPoint({ x: canvas.centerX(x), y: canvas.centerY(y) });

      let z: Point = { re: 0, im: 0 };

      let color: Color = [0, 0, 0];

      for (let iter = 1; iter <= maxIter; iter++) {
        const zr: number = z.re * z.re - z.im * z.im + c.re;
        const zi: number = 2 * z.re * z.im + c.im;

        if (zr * zr + zi * zi >= 4) {
          color = getColorFormProgression(iter / maxIter);
          break;
        }

        z = { re: zr, im: zi };
      }

      canvas.draw({ x, y }, color);
    }
  }
};

const actions: { [key: KeyboardEvent['key']]: (() => void) | undefined } = {
  ArrowRight: () => (plan.x -= 30 / plan.zoom),
  ArrowLeft: () => (plan.x += 30 / plan.zoom),
  ArrowUp: () => (plan.y += 30 / plan.zoom),
  ArrowDown: () => (plan.y -= 30 / plan.zoom),
  ' ': () => (plan.zoom *= 1.5),
  Alt: () => (plan.zoom /= 1.5),
};

const main = (maxIter = 10) => {
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    actions[event.key]?.();

    mandelbrot(maxIter);
  });

  mandelbrot(maxIter);
};

main(50);
