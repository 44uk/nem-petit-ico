const expect = require('chai').expect;
const helper = require('../lib/helper.js');

describe('Helper', () => {
  before(() => {
  });

  it('NEMTimestamp', () => {
    let nemesis = Date.UTC(2015, 2, 29, 0, 6, 25, 0);
    let timestamp = helper.NEMTimestamp(nemesis);
    expect(timestamp).eq(0);
  });
})
