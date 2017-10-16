const chai = require('chai')
const expect = chai.expect;

describe('demo', () => {
  before(() => {
    console.log('before');
  });

  it('expectation1', () => {
    expect(1).to.be.a('Number');
  });
})
