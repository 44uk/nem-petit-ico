const _ = require('lodash');
const helper = require('./helper.js');
const logger = helper.logger('lib/applicant');

function filterIncomingTransfer(txes) {
  return txes.map(data => {
    let _tx = data.transaction;
    let tx = _tx.type === 4100 ? _tx.otherTrans : _tx;
    tx['_type'] = _tx.type;
    tx['_hash'] = data.meta.hash.data;
    return tx;
  })
  .filter(tx => { return (tx.type === 257); });
}

function sumXemAmount(txes) {
  let groups = _.groupBy(txes, 'signer');
  let applicants = [];
  logger.debug('# each address summary');
  Object.keys(groups).forEach(key => {
    let addr = helper.pubkey2addr(key);
    let sum = groups[key].reduce((n, t) => {
      if((t.version & 0x00ffffff) === 2) {
        nemxem = helper.getMosaic(t.mosaics, 'nem:xem');
        if(nemxem === null) { return n; }
        let mult = t.amount / 1000000;
        return n + nemxem.quantity * mult;
      } else {
        return n + t.amount;
      }
    }, 0);
    applicants.push({address: addr, amount: sum});
    logger.debug(`${addr} => ${sum}`);
  });
  return applicants;
}

function filterOutgoingTransfer(mosaicFqn) {
  return function(txes) {
    return txes.map(data => {
      let _tx = data.transaction;
      let tx = _tx.type === 4100 ? _tx.otherTrans : _tx;
      tx['_type'] = _tx.type;
      if(data.meta.hash) { tx['_hash'] = data.meta.hash.data; }
      return tx;
    })
    .filter(tx => {
      return (
        tx.type === 257 &&
        helper.getMosaic(tx.mosaics, mosaicFqn)
      );
    });
  }
}

function sumMosaicQuantity(mosaicFqn) {
  return function(txes) {
    let groups = _.groupBy(txes, 'recipient');
    let recipients = [];
    logger.debug(`# each sent mosaic(${mosaicFqn}) summary`);
    Object.keys(groups).forEach(key => {
      let sum = groups[key].reduce((n, tx) => {
        mo = helper.getMosaic(tx.mosaics, mosaicFqn);
        if(mo && (tx.version & 0x00ffffff) === 2) {
          return n + mo.quantity;
        } else {
          return n;
        }
      }, 0);
      recipients.push({address: key, quantity: sum});
      logger.debug(`${sum}(${mosaicFqn}) => ${key}`);
    });
    return recipients;
  }
}

function mergeSents(a, b) {
  let groups = _.groupBy(_.concat(a, b), 'address');
  let sents = [];
  Object.keys(groups).forEach(key => {
    let sum = groups[key].reduce((n, r) => { return n + r.quantity; }, 0);
    sents.push({address: key, quantity: sum});
  });
  return sents;
}

function fetchXemReceives(sink, minTime, maxTime) {
  return helper.fetchTx('incoming')(sink, minTime, maxTime)
    .then(filterIncomingTransfer)
    .then(sumXemAmount)
    .then(txes => {
      logger.info('# xem Receives');
      logger.info(txes);
      return txes;
    })
  ;
}

function fetchMosaicSents(sender, minTime, mosaicFqn) {
  return helper.fetchTx('outgoing')(sender, minTime)
    .then(filterOutgoingTransfer(mosaicFqn))
    .then(sumMosaicQuantity(mosaicFqn))
    .then(txes => {
      logger.info('# mosaic Sents');
      logger.info(txes);
      return txes;
    })
  ;
}

function fetchMosaicSendings(sender, minTime, mosaicFqn) {
  return helper.fetchTx('unconfirmed')(sender, minTime)
    .then(filterOutgoingTransfer(mosaicFqn))
    .then(sumMosaicQuantity(mosaicFqn))
    .then(txes => {
      logger.info('# mosaic Sendings');
      logger.info(txes);
      return txes;
    })
  ;
}

function fetchMosaicSentAll(sender, minTime, mosaicFqn) {
  return Promise.all([
    fetchMosaicSents(sender, minTime, mosaicFqn),
    fetchMosaicSendings(sender, minTime, mosaicFqn)
  ])
  .then(data => {
    return mergeSents(data[0], data[1]);
  });
}

function sendMosaics(mosaicFqn, message = '', pkey, msigPub = null) {
  return function(candidates) {
    return Promise.all(candidates.map(c => {
      logger.info(`${c.quantity}(${mosaicFqn}) => ${c.address}`);
      return helper.sendMosaic(c.address, mosaicFqn, c.quantity, message, pkey, msigPub);
    }));
  }
}

module.exports = {
  fetchXemReceives,
  fetchMosaicSents,
  fetchMosaicSendings,
  fetchMosaicSentAll,
  sendMosaics
};
