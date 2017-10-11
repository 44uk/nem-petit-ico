require('dotenv').config();
const _ = require('lodash');
const fs = require('fs-extra');
const helper = require('./helper.js');
const logger = helper.logger('tokensale');

const DRYRUN = process.env.TOKENSALE_DRYRUN || 1;
const PKEY = process.env.TOKENSALE_PKEY;
const SINK = process.env.TOKENSALE_SINK || helper.privkey2addr(PKEY);
const MIN_XEM = process.env.TOKENSALE_MIN_XEM;
const SENDER = helper.privkey2addr(PKEY);
const MOSAIC_FQN = process.env.TOKENSALE_MOSAIC_FQN;

const MIN_TIME = Date.parse(process.env.TOKENSALE_MIN_TIME);
const MAX_TIME = Date.parse(process.env.TOKENSALE_MAX_TIME);
const MIN_NEMTIME = helper.NEMTimestamp(MIN_TIME);
const MAX_NEMTIME = helper.NEMTimestamp(MAX_TIME);

logger.info('---- Settings ----');
logger.info(`DRYRUN = ${DRYRUN}`);
logger.info(`SINK = ${SINK}`);
logger.info(`MIN_XEM = ${MIN_XEM }`);
logger.info(`SENDER = ${SENDER}`);
logger.info(`MOSAIC_FQN = ${MOSAIC_FQN}`);
logger.info(`MIN_TIME = ${process.env.TOKENSALE_MIN_TIME}`);
logger.info(`MAX_TIME = ${process.env.TOKENSALE_MAX_TIME}`);

function pLoadMessages() {
  return fs.readFile('config/tokensale.txt');
}

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
    logger.debug('---- each address sums ----');
    Object.keys(groups).forEach(key => {
      let addr = helper.pubkey2addr(key);
      let sum = groups[key].reduce((n, t) => {
        if((t.version & 0x00ffffff) === 2) {
          nemxem = helper.getMosaic(t.mosaics, 'nem.xem');
          if(nemxem === null) { return n; }
          return n + nemxem.quantity;
        } else {
          return n + t.amount;
        }
      }, 0);
      if(sum >= MIN_XEM) { applicants.push(addr); }
      logger.debug(`${addr} => ${sum}`);
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
        helper.getMosaic(tx.mosaics, MOSAIC_FQN) &&
        _.inRange(tx.timeStamp, MIN_NEMTIME, MAX_NEMTIME)
      );
    });
    addrs = transfers.map(t => { return t.recipient; });
    return _.uniq(addrs);

    // return Promise.all(_.uniq(addrs).map(addr => {
    //   return helper.searchOwnedMosaic(addr, MOSAIC_FQN).then(mo => {
    //     if(mo && mo.quantity > 1) {
    //       console.error(`${addr} => ${mo.quantity} too many mosaics!`);
    //     }
    //     return (mo && mo.quantity === 1) ? addr : null;
    //   });
    // }));
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
        helper.getMosaic(tx.mosaics, MOSAIC_FQN) &&
        _.inRange(tx.timeStamp, MIN_NEMTIME, MAX_NEMTIME)
      );
    });
    let addrs = transfers.map(t => { return t.recipient; });
    return _.uniq(addrs);
  });
}

function main() {
  let now = new Date().getTime();
  if(! _.inRange(now, MIN_TIME, MAX_TIME)) {
    logger.info('out of period.');
    return;
  }
  logger.info('start checking.');

  Promise.all([
    pLoadBlacklist(),
    pApplicantAddresses(),
    pSentMosaicAddresses(),
    pSendingMosaicAddresses(),
    pLoadMessages()
  ]).then(data => {
    let blacklistAddrs = data[0];
    let applicantAddrs = data[1];
    let sentAddrs = data[2];
    let sendingAddrs = data[3];
    let message = data[4];

    logger.debug('---- Applicant Addresses ----');
    logger.debug(applicantAddrs);
    logger.debug('---- Sent Addresses ----');
    logger.debug(sentAddrs);
    logger.debug('---- Sending Addresses ----');
    logger.debug(sendingAddrs);

    let candidateAddrs = _.difference(
      applicantAddrs,
      _.concat(sentAddrs, sendingAddrs, blacklistAddrs)
    );
    logger.debug('---- Candidate Addresses ----');
    logger.debug(candidateAddrs);

    if(candidateAddrs.length === 0) {
      logger.info('No candidates.');
      return [];
    }

    logger.info('Start to send mosaic to candidate addresses.');
    if(DRYRUN == 0) {
      return Promise.all(candidateAddrs.map(addr => {
        logger.info(`Mosaic sent: ${MOSAIC_FQN} => ${addr}`);
        return helper.sendMosaic(addr, MOSAIC_FQN, message, PKEY);
      }));
    } else {
      logger.info('Dryrun! No transaction is announced.');
      return candidateAddrs;
    }
  }).then(data => {
    logger.info('Finish announcing transactions.');
    logger.debug(data);
  }).catch(err => {
    logger.error(err);
  });
};

if (require.main === module) {
  logger.debug('Called directly.');
  main();
} else {
  logger.debug('Required as a module.');
  module.exports = main;
}
