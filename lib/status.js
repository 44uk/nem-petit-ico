require('dotenv').config();
const _ = require('lodash');
const fs = require('fs-extra');
const helper = require('./helper.js');
const logger = helper.logger('status');
const println = helper.println;

const PKEY = process.env.TOKENSALE_PKEY;
const SINK = process.env.TOKENSALE_SINK || helper.privkey2addr(PKEY);
const MIN_XEM = process.env.TOKENSALE_MIN_XEM;
const SENDER = helper.privkey2addr(PKEY);
const MOSAIC_FQN = process.env.TOKENSALE_MOSAIC_FQN;

const MIN_TIME = Date.parse(process.env.TOKENSALE_MIN_TIME);
const MAX_TIME = Date.parse(process.env.TOKENSALE_MAX_TIME);
const MIN_NEMTIME = helper.NEMTimestamp(MIN_TIME);
const MAX_NEMTIME = helper.NEMTimestamp(MAX_TIME);

function pLoadBlacklist() {
  return fs.readFile('config/blacklist.txt').then(data => {
    return _.trim(data.toString()).split("\n");
  });
}

function pApplicantAddresses() {
  return helper.fetchTx('incoming')(SINK, MIN_TIME).then(res => {
    let transfers = res.map(data => {
      let tx = data.transaction;
      return tx.type === 4100 ? tx.otherTrans : tx;
    })
    .filter(tx => {
      return (
        tx.type === 257 && tx.recipient === SINK &&
        _.inRange(tx.timeStamp, MIN_NEMTIME, MAX_NEMTIME)
      );
    });

    let groups = _.groupBy(transfers, 'signer');
    let applicants = [];
    println('---- each applicant sums ----');
    Object.keys(groups).forEach(key => {
      let addr = helper.pubkey2addr(key);
      let sum = groups[key].reduce((n, t) => {
        if((t.version & 0x00ffffff) === 2) {
          nemxem = helper.getMosaic(t.mosaics, 'nem:xem');
          if(nemxem === null) { return n; }
          return n + nemxem.quantity;
        } else {
          return n + t.amount;
        }
      }, 0);
      applicants.push({address: addr, amount: sum});
      println(`${addr} => ${sum}`);
    });
    return Promise.resolve(applicants);
  });
}

function pSentMosaicAddresses() {
  return helper.fetchTx('outgoing')(SENDER, MIN_TIME).then(res => {
    let transfers = res.map(data => {
      let tx = data.transaction;
      return tx.type === 4100 ? tx.otherTrans : tx;
    }).filter(tx => {
      return (
        tx.type === 257 && tx.recipient !== SINK &&
        tx.timeStamp >= MIN_NEMTIME &&
        helper.getMosaic(tx.mosaics, MOSAIC_FQN)
      );
    });

    let groups = _.groupBy(transfers, 'recipient');
    let recipients = [];
    logger.info('---- each sent mosaic sums ----');
    Object.keys(groups).forEach(key => {
      let sum = groups[key].reduce((n, t) => {
        if((t.version & 0x00ffffff) === 2) {
          mo = helper.getMosaic(t.mosaics, MOSAIC_FQN);
          if(mo === null) { return n; }
          return n + mo.quantity;
        }
      }, 0);
      recipients.push({address: key, quantity: sum});
      logger.info(`${sum}(${MOSAIC_FQN}) => ${key}`);
    });
    return recipients;
  });
}

function pSendingMosaicAddresses() {
  return helper.fetchTx('unconfirmed')(SENDER, MIN_TIME).then(res => {
    let transfers = res.map(data => {
      let tx = data.transaction;
      return tx.type === 4100 ? tx.otherTrans : tx;
    }).filter(tx => {
      return (
        tx.type === 257 && tx.recipient !== SINK &&
        tx.timeStamp >= MIN_NEMTIME &&
        helper.getMosaic(tx.mosaics, MOSAIC_FQN)
      );
    });

    let groups = _.groupBy(transfers, 'recipient');
    let recipients = [];
    logger.info('---- each sending mosaic sums ----');
    Object.keys(groups).forEach(key => {
      let sum = groups[key].reduce((n, t) => {
        if((t.version & 0x00ffffff) === 2) {
          mo = helper.getMosaic(t.mosaics, MOSAIC_FQN);
          if(mo === null) { return n; }
          return n + mo.quantity;
        }
      }, 0);
      recipients.push({address: key, quantity: sum});
      logger.info(`${sum}(${MOSAIC_FQN}) => ${key}`);
    });
    return recipients;
  });
}

function mergeSent(a, b) {
  let groups = _.groupBy(_.concat(a, b), 'address');
  let sents = [];
  Object.keys(groups).forEach(key => {
    let sum = groups[key].reduce((n, r) => { return n + r.quantity; }, 0);
    sents.push({address: key, quantity: sum});
  });
  return sents;
}

function main() {
  Promise.all([
    pApplicantAddresses(),
    pSentMosaicAddresses(),
    pSendingMosaicAddresses(),
    pLoadBlacklist()
  ]).then(data => {
    let applicants = data[0];
    let sents = data[1];
    let sendings = data[2];
    let blacklist = data[3];

    println('---- Applicants ----');
    println(applicants.length === 0 ? '(None)' : applicants);
    println('---- Sents ----');
    println(sents.length === 0 ? '(None)' : sents);
    println('---- Sendings ----');
    println(sendings.length === 0 ? '(None)' : sendings);

    sents = mergeSent(sents, sendings)
    println('---- Merged Sents ----');
    println(sents.length === 0 ? '(None)' : sents);

    let candidates = applicants.map(a => {
      let sent = sents.find(el => el.address === a.address);
      let sentQuantity = sent ? sent.quantity : 0;

      let quantity = sentQuantity === 0 ? 1 : 0;
      return {address: a.address, quantity: quantity}
    })
    .filter(a => a.quantity > 0 )
    ;

    println('---- Candidates ----');
    println(candidates.length === 0 ? '(None)' : candidates);
  }).catch(err => {
    logger.error(err);
  });
};

if (require.main === module) {
  // logger.debug('Called directly.');
  main();
} else {
  // logger.debug('Required as a module.');
  module.exports = main;
}
