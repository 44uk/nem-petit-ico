require('dotenv').config();
const applicant = require('../lib/applicant.js');
const fs = require('fs-extra');
const helper = require('../lib/helper.js');
const logger = helper.logger('bin/applicants');
const markets = require('../lib/markets.js').addresses;

const PKEY = process.env.MOSAICSALE_PKEY;
const SINK = process.env.MOSAICSALE_SINK || helper.privkey2addr(PKEY);
const SENDER = helper.privkey2addr(PKEY);
const MOSAIC_FQN = process.env.MOSAICSALE_MOSAIC_FQN;

const MIN_TIME = Date.parse(process.env.MOSAICSALE_MIN_TIME);
const MAX_TIME = Date.parse(process.env.MOSAICSALE_MAX_TIME);
const MIN_NEMTIME = helper.NEMTimestamp(MIN_TIME);
const MAX_NEMTIME = helper.NEMTimestamp(MAX_TIME);

const MIN_XEM = process.env.MOSAICSALE_MIN_XEM;

logger.info('# Settings');
logger.info(`SINK = ${SINK}`);
logger.info(`SENDER = ${SENDER}`);
logger.info(`MOSAIC_FQN = ${MOSAIC_FQN}`);
logger.info(`MIN_TIME = ${process.env.MOSAICSALE_MIN_TIME}`);
logger.info(`MAX_TIME = ${process.env.MOSAICSALE_MAX_TIME}`);

logger.info(`MIN_XEM = ${MIN_XEM}`);

function selectCandidates(applicants, sents) {
  return applicants.map(a => {
    let sent = sents.find(el => el.address === a.address);
    let sentQuantity = sent ? sent.quantity : 0;

    // --------
    let quantity = (
      a.amount >= MIN_XEM &&
      sentQuantity === 0
    ) ?  1 : 0;
    // --------

    return {address: a.address, quantity: quantity}
  })
  .filter(a => {
    if(markets.includes(a.address)) {
      logger.warn(`${a.address} is Market Address! Rejected.`)
    }
    return a.quantity > 0 && ! markets.includes(a.address)
  })
  ;
}

function main() {
  let now = new Date().getTime();
  if(now < MIN_TIME) {
    logger.info('# before begin ICO');
    return;
  }
  logger.info('# start checking');

  Promise.all([
    applicant.fetchXemReceives(SINK, MIN_TIME, MAX_TIME),
    applicant.fetchMosaicSentAll(SENDER, MIN_TIME, MOSAIC_FQN)
  ]).then(data => {
    let receives = data[0];
    let sents = data[1];
    let candidates = selectCandidates(receives, sents);
    return {
      candidates: candidates,
      receives: receives,
      sents: sents
    };
  }).then(data => {
    let json = JSON.stringify(data, null, 4);
    console.log(json);
    fs.writeFile('tmp/applicants.json', json);
  }).catch(err => {
    logger.error(err);
  })
  ;
}

if (require.main === module) {
  logger.debug('Called directly.');
  main();
} else {
  logger.debug('Required as a module.');
  module.exports = main;
}
