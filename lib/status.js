require('dotenv').config();
const _ = require('lodash');
const fs = require('fs-extra');
const helper = require('./helper.js');
const logger = helper.logger('status');
const println = helper.println;

const SINK = process.env.TOKENSALE_SINK;
const MOSAIC_FQN = process.env.TOKENSALE_MOSAIC_FQN;
const MIN_XEM = process.env.TOKENSALE_MIN_XEM;

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
    println('---- each address sums ----');
    Object.keys(groups).forEach(key => {
      let addr = helper.pubkey2addr(key);
      let sum = groups[key].reduce((n, t) => {
        // TODO: support mainnet
        // if(t.version & 0xffffff >= 2) {
        if(t.version == -1744830462) {
          nemxem = helper.getMosaic(t.mosaics, 'nem.xem');
          if(nemxem === null) {
            return n;
          } else {
            return n + nemxem.quantity * 1000000;
          }
        } else {
          return n + t.amount;
        }
      }, 0);
      if(sum >= MIN_XEM) { applicants.push(addr); }
      println(`${addr} => ${sum}`);
    });
    return Promise.resolve(applicants);
  });
}

function pSentMosaicAddresses() {
  return helper.fetchTx('outgoing')(SINK, MIN_TIME).then(res => {
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
  return helper.fetchTx('unconfirmed')(SINK, MIN_TIME).then(res => {
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
  Promise.all([
    pLoadBlacklist(),
    pApplicantAddresses(),
    pSentMosaicAddresses(),
    pSendingMosaicAddresses()
  ]).then(data => {
    let blacklistAddrs = data[0];
    let applicantAddrs = data[1];
    let sentAddrs = data[2];
    let sendingAddrs = data[3];

    println('---- Applicant Addresses ----');
    println(applicantAddrs.length === 0 ? '(None)' : applicantAddrs);
    println('---- Sent Addresses ----');
    println(sentAddrs.length === 0 ? '(None)' : sentAddrs);
    println('---- Sending Addresses ----');
    println(sendingAddrs.length === 0 ? '(None)' : sendingAddrs);

    let candidateAddrs = _.difference(
      applicantAddrs,
      _.concat(sentAddrs, sendingAddrs, blacklistAddrs)
    );
    println('---- Candidate Addresses ----');
    println(candidateAddrs.length === 0 ? '(None)' : candidateAddrs);

    let blacklistedAddrs = _.intersection(
      applicantAddrs,
      blacklistAddrs
    );
    println('---- Blacklisted Addresses ----');
    println(blacklistedAddrs.length === 0 ? '(None)' : blacklistedAddrs);
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
