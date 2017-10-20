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
      .reply(200, { data: [
        {
          meta: {
            hash: { data: "79e56ebcc7bf067aaeeba71e6563d7309cece6664b7b7f046712668aefa05439" },
          },
          transaction: {
            timeStamp: 86400 - 386 + 1,
            amount: 1000000,
            type: 257,
            version: -1744830463,
            signer: "08d5d8f415dd5facbc45ede9e5c97ab514c3d999ebe5d387552fdbf360cd21be"
          }
        },
        {
          meta: {
            hash: { data: "79e56ebcc7bf067aaeeba71e6563d7309cece6664b7b7f046712668aefa05439" },
          },
          transaction: {
            timeStamp: 86400 - 386,
            amount: 1000000,
            type: 257,
            version: -1744830463,
            signer: "08d5d8f415dd5facbc45ede9e5c97ab514c3d999ebe5d387552fdbf360cd21be"
          }
        },
        {
          meta: {
            innerHash: {},
            id: 135806,
            id: 999999,
            hash: { data: "79e56ebcc7bf067aaeeba71e6563d7309cece6664b7b7f046712668aefa05439" },
            height: 1160571
          },
          transaction: {
            timeStamp: 0,
            amount: 1000000,
            signature: "f913fb6f7dbb263e6720cc791887d2a3a5fa0b81f31239cecfa0cc677205e41eb698b601915bc7cc0a6bbb3d9099b5e862f276681a859a12a70313a815f02609",
            fee: 50000,
            recipient: "TBX7B37ZRLNISNIY7ZMLS7DWSMHW2T5733LOUP5P",
            type: 257,
            deadline: 3600,
            message: {},
            version: -1744830463,
            signer: "08d5d8f415dd5facbc45ede9e5c97ab514c3d999ebe5d387552fdbf360cd21be"
          }
        }
      ]})
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
      .reply(200, { data: [
        {
          meta: {
            innerHash: {},
            id: 135820,
            hash: { data: "17b7a1efcb4c89dfaa77ac689e56e6d7bca7532675bf1369c90211222db960ed" },
            height: 1161152
          },
          transaction: {
            timeStamp: 0,
            amount: 1000000,
            signature: "5d55988c3320b85e2ac3e78cc878c1936ab9bab39298cac3536c0126b7bc5cd0b07a647aff9cdf1e48f9acf576638331a178798f42c1ade21d561fe7deb13b0f",
            fee: 50000,
            recipient: "TAWKJTUP4DWKLDKKS534TYP6G324CBNMXKBA4X7B",
            mosaics: [
              { quantity: 1, mosaicId: { namespaceId: "y4uk", name: "gift" } }
            ],
            type: 257,
            deadline: 80408961,
            message: {},
            version: -1744830462,
            signer: "cc63b4dcdec745417043c3fa0992ec3a1695461a26d90264744648abbd5caa0d"
          }
        },
        // {
        //   meta: {
        //     hash: { data: "17b7a1efcb4c89dfaa77ac689e56e6d7bca7532675bf1369c90211222db960ed" }
        //   },
        //   transaction: {
        //     timeStamp: 86400 - 386 - 80000,
        //     amount: 1000000,
        //     signature: "5d55988c3320b85e2ac3e78cc878c1936ab9bab39298cac3536c0126b7bc5cd0b07a647aff9cdf1e48f9acf576638331a178798f42c1ade21d561fe7deb13b0f",
        //     fee: 50000,
        //     recipient: "TAWKJTUP4DWKLDKKS534TYP6G324CBNMXKBA4X7B",
        //     mosaics: [
        //       { quantity: 1, mosaicId: { namespaceId: "y4uk", name: "gift" } }
        //     ],
        //     type: 257,
        //     deadline: 80408961,
        //     message: {},
        //     version: -1744830462,
        //     signer: "cc63b4dcdec745417043c3fa0992ec3a1695461a26d90264744648abbd5caa0d"
        //   }
        // }
      ]})
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
      .reply(200, {
        data: [
          {
            meta: {
              innerHash: {},
              id: 135820,
              hash: { data: "17b7a1efcb4c89dfaa77ac689e56e6d7bca7532675bf1369c90211222db960ed" },
              height: 1161152
            },
            transaction: {
              timeStamp: 0,
              amount: 1000000,
              signature: "5d55988c3320b85e2ac3e78cc878c1936ab9bab39298cac3536c0126b7bc5cd0b07a647aff9cdf1e48f9acf576638331a178798f42c1ade21d561fe7deb13b0f",
              fee: 50000,
              recipient: "TAWKJTUP4DWKLDKKS534TYP6G324CBNMXKBA4X7B",
              mosaics: [
                { quantity: 1, mosaicId: { namespaceId: "y4uk", name: "gift" } }
              ],
              type: 257,
              deadline: 80408961,
              message: {},
              version: -1744830462,
              signer: "cc63b4dcdec745417043c3fa0992ec3a1695461a26d90264744648abbd5caa0d"
            }
          }
        ]
      })
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
