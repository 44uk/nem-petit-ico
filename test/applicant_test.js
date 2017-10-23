const expect = require('chai').expect;
const timekeeper = require('timekeeper');
const described = require('../lib/applicant.js');
const nock = require('nock');

describe('Applicant', () => {
  before(() => {
    // nemesis time
    // timekeeper.travel(Date.UTC(2015, 2, 29, 0, 6, 25, 0));
    timekeeper.travel(Date.UTC(2015, 2, 30, 0, 0, 00, 0));
  });

  describe('fetchXemReceives', () => {
    let addr = 'TBX7B37ZRLNISNIY7ZMLS7DWSMHW2T5733LOUP5P';

    const scope = nock('http://bigalice2.nem.ninja:7890')
      .get(`/account/transfers/incoming?address=${addr}`)
      .reply(200, require('./fixtures/incoming_applicants.json'))
    ;

    it('return a tx, summary received 2 xem', () => {
      return described.fetchXemReceives(
        addr,
        Date.parse('2015-03-29T00:06:25Z'),
        Date.parse('2015-03-29T23:59:59Z')
      ).then(results => {
        expect(results).to.be.an('array');
        expect(results).to.have.lengthOf(1);
        expect(results[0].address).to.equal('TCEEX2E3PYIHK3PB2LONEVOH7ETTFHWOTCZLZXPP')
        expect(results[0].amount).to.equal(2000000)
      })
      ;
    });
  });

  describe('fetchMosaicSent', () => {
    let addr = 'TBX7B37ZRLNISNIY7ZMLS7DWSMHW2T5733LOUP5P';
    let mosaicFqn = 'y4uk:gift';

    const scope = nock('http://bigalice2.nem.ninja:7890')
      .get(`/account/transfers/outgoing?address=${addr}`)
      .reply(200, require('./fixtures/outgoing_applicants.json'))
    ;

    it('return a tx, sent a mosaic', () => {
      return described.fetchMosaicSents(
        addr,
        Date.parse('2015-03-29T00:06:25Z'),
        mosaicFqn
      ).then(results => {
        expect(results).to.be.an('array');
        expect(results).to.have.lengthOf(1);
        expect(results[0].address).to.equal('TAWKJTUP4DWKLDKKS534TYP6G324CBNMXKBA4X7B')
        expect(results[0].quantity).to.equal(1)
      })
      ;
    });
  });

  describe('fetchMosaicSending', () => {
    let addr = 'TBX7B37ZRLNISNIY7ZMLS7DWSMHW2T5733LOUP5P';
    let mosaicFqn = 'y4uk:gift';

    const scope = nock('http://bigalice2.nem.ninja:7890')
      .get(`/account/unconfirmedTransactions?address=${addr}`)
      .reply(200, require('./fixtures/unconfirmed_applicants.json'))
    ;

    it('return a tx, sent a mosaic', () => {
      return described.fetchMosaicSendings(
        addr,
        Date.parse('2015-03-29T00:06:25Z'),
        mosaicFqn
      ).then(results => {
        expect(results).to.be.an('array');
        expect(results).to.have.lengthOf(1);
        expect(results[0].address).to.equal('TAWKJTUP4DWKLDKKS534TYP6G324CBNMXKBA4X7B')
        expect(results[0].quantity).to.equal(1)
      })
      ;
    });
  });
})
