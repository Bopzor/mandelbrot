import { MandelbrotParams, Pixel, Point } from 'index';

const pixelToPoint = ({ x, y }: Pixel, startX: number, startY: number, zoom: number): Point => {
  // prettier-ignore
  return {
    re: x / zoom - startX,
    im: y / zoom - startY,
  };
};

const mandelbrot = ({ maxIter, height, width, zoom, startX, startY }: MandelbrotParams) => {
  const result: (number | null)[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let progression = null;

      const centeredX = x - width / 2;
      const centeredY = y - height / 2;
      const c = pixelToPoint({ x: centeredX, y: centeredY }, startX, startY, zoom);

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
          progression = iter / maxIter;
          break;
        }
      }

      result.push(progression);
    }
  }

  return result;
};

onmessage = function (e) {
  const result = mandelbrot(e.data);

  postMessage(result);
};
