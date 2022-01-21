export type Pixel = { x: number; y: number };
export type Point = { re: number; im: number };
export type Color = [number, number, number];

export type MandelbrotParams = {
  maxIter: number;
  width: number;
  height: number;
  zoom: number;
  startX: number;
  startY: number;
};

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

const drawMandelbrotSet = (
  set: (number | null)[],
  imageData: ImageData,
  ctx: CanvasRenderingContext2D
) => {
  const data = imageData.data;

  for (let i = 0; i < set.length; i++) {
    let color: Color = [0, 0, 0];
    const progression = set[i];

    if (progression) {
      color = getColorFormProgression(progression);
    }

    const idx = i * 4;

    data[idx] = color[0];
    data[idx + 1] = color[1];
    data[idx + 2] = color[2];
    data[idx + 3] = 255;
  }

  ctx.putImageData(imageData, 0, 0);
};

if (window.Worker) {
  const canvas = document.querySelector('canvas');

  if (canvas) {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext('2d');

    let imageData: ImageData;

    if (ctx) {
      imageData = ctx.createImageData(width, height);

      let maxIter = 50;
      let zoom = 175;
      let startX = 0.6;
      let startY = 0;

      let params = {
        width,
        height,
        maxIter,
        zoom,
        startX,
        startY,
      };

      const actions: { [key: KeyboardEvent['key']]: () => MandelbrotParams } = {
        ArrowRight: () => {
          params.startX = params.startX - 30 / params.zoom;
          return params;
        },
        ArrowLeft: () => {
          params.startX = params.startX + 30 / params.zoom;
          return params;
        },
        ArrowUp: () => {
          params.startY = params.startY + 30 / params.zoom;
          return params;
        },
        ArrowDown: () => {
          params.startY = params.startY - 30 / params.zoom;
          return params;
        },
        ' ': () => {
          params.zoom = params.zoom * 1.5;
          return params;
        },
        Alt: () => {
          params.zoom = params.zoom / 1.5;
          return params;
        },
        Control: () => {
          params.maxIter = params.maxIter + 25;
          return params;
        },
      };

      let worker = new Worker('worker.js');

      window.addEventListener('keydown', (event: KeyboardEvent) => {
        const action = actions[event.key];

        if (action) {
          if (worker) {
            worker.terminate();
          }

          params = action();

          worker = new Worker('worker.js');
          worker.postMessage(params);

          worker.onmessage = function (e) {
            const result = e.data;

            drawMandelbrotSet(result, imageData, ctx);
          };
        }
      });

      worker.postMessage(params);

      worker.onmessage = function (e) {
        const result = e.data;

        drawMandelbrotSet(result, imageData, ctx);
      };
    }
  }
} else {
  console.log("Your browser doesn't support web workers.");
}
