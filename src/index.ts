type ComplexNumber = [number, number];
type Pixel = [number, number];
type Point = [number, number];
type Color = [number, number, number];

class Canvas {
  width = 0;
  height = 0;
  ctx: CanvasRenderingContext2D | null = null;

  currentPixel: Pixel = [0, 0];
  zoom = 200;

  constructor() {
    const canvas = document.querySelector('canvas');

    if (canvas) {
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = canvas.getContext('2d');
    }
  }

  pixelToPoint([x, y]: Pixel): Point {
    return [this.translateX(x, 2 / 3) / this.zoom, this.translateY(y) / this.zoom];
  }

  draw([x, y]: Pixel, color: Color) {
    this.ctx!.fillStyle = this.getColorFromComponents(color);
    this.ctx!.fillRect(x, y, 1, 1);
  }

  private getColorFromComponents([r, g, b]: Color) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  private translateX(x: number, distance = 1 / 2) {
    return x - this.width * distance;
  }

  private translateY(y: number, distance = 1 / 2) {
    return y - this.height * distance;
  }
}

const canvas = new Canvas();

const mandelbrot = ([za, zb]: ComplexNumber, [ca, cb]: ComplexNumber): ComplexNumber => {
  const r: number = Math.pow(za, 2) - Math.pow(zb, 2) + ca;
  const i: number = 2 * za * zb + cb;

  return [r, i];
};

export const getColorFormIter = (iter: number, maxIter: number): Color => {
  const coef = iter / maxIter;

  let r = 0;
  let g = 0;
  let b = 0;

  // if (coef < 0.5) {
  //   g = Math.floor(coef * 2 * 255);
  // } else {
  //   g = 255 - Math.floor((coef - 0.5) * 2 * 255);
  //   b = Math.floor((coef - 0.5) * 2 * 255);
  // }

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

const main = (maxIter = 10) => {
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      const c = canvas.pixelToPoint([x, y]);

      let z: ComplexNumber = [0, 0];

      let color: Color = [0, 0, 0];

      for (let iter = 1; iter <= maxIter; iter++) {
        const [za, zb] = mandelbrot(z, c);

        if (Math.pow(za, 2) + Math.pow(zb, 2) >= 4) {
          color = getColorFormIter(iter, maxIter);
          break;
        }

        z = [za, zb];
      }

      canvas.draw([x, y], color);
    }
  }
};

main(250);
