import { expect } from 'chai';
import { getColorFormIter } from './index';

describe('get color', () => {
  let maxIter = 50;

  it('gives clearest color at each iteration', () => {
    expect(getColorFormIter(1, maxIter)).to.eql([0, 10, 0]);
    expect(getColorFormIter(25, maxIter)).to.eql([0, 255, 0]);
    expect(getColorFormIter(50, maxIter)).to.eql([0, 0, 255]);
  });
});
