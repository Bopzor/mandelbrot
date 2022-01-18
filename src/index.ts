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

  zoom = 175;

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

const getRandomColor = (): Color => {
  const r = Math.round(Math.random() * 255);
  const g = Math.round(Math.random() * 255);
  const b = Math.round(Math.random() * 255);

  return [r, g, b];
};

const defaultPalette: Record<number, Color> = (() => {
  const palette: Record<number, Color> = {};

  for (let i = 0; i < 10; i++) {
    palette[i / 10] = getRandomColor();
  }

  return palette;
})();

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

  return min + Math.round(value * (max - min));
};

const interpolateColor = ([r1, g1, b1]: Color, [r2, g2, b2]: Color, progression = 0.5): Color => {
  // prettier-ignore
  return [
    toComponent(progression, r1, r2),
    toComponent(progression, g1, g2),
    toComponent(progression, b1, b2),
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

const mandelbrot = (maxIter = 10) => {
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const c = plan.pixelToPoint({ x: canvas.centerX(x), y: canvas.centerY(y) });

      let color: Color = [0, 0, 0];

      let zr = 0;
      let zi = 0;

      let zr2 = zr + zr;
      let zi2 = zi + zi;

      let iter;
      for (iter = 1; iter <= maxIter; iter++) {
        const re = zr;

        zr = zr2 - zi2 + c.re;
        zi = 2 * re * zi + c.im;

        zr2 = zr * zr;
        zi2 = zi * zi;

        if (zr2 + zi2 >= 4) {
          color = getColorFormProgression(iter / maxIter);
          break;
        }
      }

      canvas.draw({ x, y }, color);
    }
  }
};

let maxIter = 50;

const actions: { [key: KeyboardEvent['key']]: (() => void) | undefined } = {
  ArrowRight: () => (plan.x -= 30 / plan.zoom),
  ArrowLeft: () => (plan.x += 30 / plan.zoom),
  ArrowUp: () => (plan.y += 30 / plan.zoom),
  ArrowDown: () => (plan.y -= 30 / plan.zoom),
  ' ': () => (plan.zoom *= 1.5),
  Alt: () => (plan.zoom /= 1.5),
  Control: () => (maxIter += 25),
};

const main = () => {
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    actions[event.key]?.();

    mandelbrot(maxIter);
  });

  mandelbrot(maxIter);
};

main();
