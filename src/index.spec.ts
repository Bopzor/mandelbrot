import { expect } from 'chai';
import { Color, getColorFormProgression, normalize, toComponent } from './index';

const palette: Record<number, Color> = {
  0: [0, 0, 0],
  0.5: [0, 255, 0],
  1: [0, 0, 255],
};

describe('get color', () => {
  it('gives clearest color at each iteration', () => {
    expect(getColorFormProgression(0, palette)).to.eql([0, 0, 0]);
    expect(getColorFormProgression(0.25, palette)).to.eql([0, 128, 0]);
    expect(getColorFormProgression(0.5, palette)).to.eql([0, 255, 0]);
    expect(getColorFormProgression(1, palette)).to.eql([0, 0, 255]);
  });
});

describe('normalize', () => {
  it('', () => {
    expect(normalize({ value: 0.5, range: [0, 1] })).to.equal(0.5);
  });

  it('', () => {
    expect(normalize({ value: 0.2, range: [0, 0.4] })).to.equal(0.5);
  });

  it('', () => {
    expect(normalize({ value: 0.2, range: [0, 0.8] })).to.equal(0.25);
  });

  it('', () => {
    expect(normalize({ value: 0.6, range: [0.4, 0.8] })).to.be.closeTo(0.5, 0.000001);
  });
});

describe('toComponent', () => {
  it('', () => {
    expect(toComponent(0.5)).to.equal(128);
  });

  it('', () => {
    expect(toComponent(0)).to.equal(0);
  });

  it('', () => {
    expect(toComponent(1)).to.equal(255);
  });

  it('', () => {
    expect(toComponent(1, 0, 0)).to.equal(0);
  });

  it('', () => {
    expect(toComponent(1, 255, 0)).to.equal(0);
    expect(toComponent(0.5, 255, 0)).to.equal(128);
    expect(toComponent(0, 255, 0)).to.equal(255);
  });
});
