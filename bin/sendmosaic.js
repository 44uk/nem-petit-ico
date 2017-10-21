require('dotenv').config();
const applicant = require('../lib/applicant.js');
const fs = require('fs-extra');
const helper = require('../lib/helper.js');
const logger = helper.logger('bin/sendmosaics');

const DRYRUN = process.env.MOSAICSALE_DRYRUN || 1;
const PKEY = process.env.MOSAICSALE_PKEY;
const SENDER = helper.privkey2addr(PKEY);
const MOSAIC_FQN = process.env.MOSAICSALE_MOSAIC_FQN;

const MIN_TIME = Date.parse(process.env.MOSAICSALE_MIN_TIME);
const MAX_TIME = Date.parse(process.env.MOSAICSALE_MAX_TIME);
const MIN_NEMTIME = helper.NEMTimestamp(MIN_TIME);
const MAX_NEMTIME = helper.NEMTimestamp(MAX_TIME);

const MESSAGE = process.env.MOSAICSALE_MESSAGE || '';

logger.info('# Settings');
logger.info(`DRYRUN = ${DRYRUN}`);
logger.info(`SENDER = ${SENDER}`);
logger.info(`MOSAIC_FQN = ${MOSAIC_FQN}`);
logger.info(`MIN_TIME = ${process.env.MOSAICSALE_MIN_TIME}`);
logger.info(`MAX_TIME = ${process.env.MOSAICSALE_MAX_TIME}`);

logger.info(`MESSAGE = ${MESSAGE}`);

function loadCandidates() {
  return fs.readFile('tmp/applicants.json')
  .then(JSON.parse)
  .then(data => { return data.candidates; })
  ;
}

function selectCandidates(applicants, sents) {
  return applicants.filter(a => {
    return !sents.find(el => el.address === a.address);
  })
}

function main() {
  let now = new Date().getTime();
  if(now < MIN_TIME) {
    logger.info('# before begin ICO');
    return;
  }
  logger.info('# start sending');

  Promise.all([
    loadCandidates(),
    applicant.fetchMosaicSentAll(SENDER, MIN_TIME, MOSAIC_FQN)
  ]).then(data => {
    let candidates = data[0];
    let sents = data[1];
    candidates = selectCandidates(candidates, sents);

    if(DRYRUN != 0) {
      logger.info(candidates);
      console.log(candidates);
      throw new Error(`Enabled DRYRUN! No transactions announced.`);
    }
    if(candidates.length === 0) {
      throw new Error(`No candidates!`);
    }
    return candidates;
  })
  .then(applicant.sendMosaics(MOSAIC_FQN, MESSAGE, PKEY))
  .then(res=> {
    logger.info(res);
    console.log(res);
  })
  .catch(err => {
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
