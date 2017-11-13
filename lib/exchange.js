const _ = require('lodash');
const helper = require('./helper.js');
const logger = helper.logger('exchange');

function filterIncomingTransfer(mosaicFqn) {
  return function(txes) {
    return txes.map(data => {
      let _tx = data.transaction;
      let tx = _tx.type === 4100 ? _tx.otherTrans : _tx;
      tx['_type'] = _tx.type;
      tx['_hash'] = data.meta.hash.data;
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
    let groups = _.groupBy(txes, 'signer');
    let applicants = [];
    logger.debug('# each address summary');
    Object.keys(groups).forEach(key => {
      let addr = helper.pubkey2addr(key);
      let sum = groups[key].reduce((n, t) => {
        if((t.version & 0x00ffffff) === 2) {
          mosaic = helper.getMosaic(t.mosaics, mosaicFqn);
          if(mosaic === null) { return n; }
          return n + mosaic.quantity;
        } else {
          return n;
        }
      }, 0);
      applicants.push({address: addr, quantity: sum});
      logger.debug(`${addr} => ${sum}(${mosaicFqn})`);
    });
    return applicants;
  }
}

function filterOutgoingTransfer(txes) {
  return txes.map(data => {
    let _tx = data.transaction;
    let tx = _tx.type === 4100 ? _tx.otherTrans : _tx;
    tx['_type'] = _tx.type;
    tx['_hash'] = data.meta.hash.data;
    return tx;
  })
  .filter(tx => {
    return (
      tx.type === 257 &&
      tx.message.payload && tx.message.type === 2
    );
  });
}

function decodeMessage(pkey) {
  return function(txes) {
    return Promise.all(txes.map(tx => {
      return helper.addr2pubkey(tx.recipient).then(pubkey => {
        tx.message = helper.decryptMessage(pkey, pubkey, tx.message);
        return { address: tx.recipient, message: tx.message.decoded };
      });
    }));
  }
}

function fetchMosaicReceives(sink, minTime, maxTime, mosaicFqn) {
  return helper.fetchTx('incoming')(sink, minTime, maxTime)
    .then(filterIncomingTransfer(mosaicFqn))
    .then(sumMosaicQuantity(mosaicFqn))
    .then(txes => {
      logger.info('# mosaic Receives');
      logger.info(txes);
      return txes;
    })
  ;
}

function fetchMessageSents(sender, minTime, pkey) {
  return helper.fetchTx('outgoing')(sender, minTime)
    .then(filterOutgoingTransfer)
    .then(decodeMessage(pkey))
    .then(txes => {
      logger.info('# message Sents');
      logger.info(txes);
      return txes;
    })
  ;
}

function fetchMessageSendings(sender, minTime, pkey) {
  return helper.fetchTx('unconfirmed')(sender, minTime)
    .then(filterOutgoingTransfer)
    .then(decodeMessage(pkey))
    .then(txes => {
      logger.info('# message Sending');
      logger.info(txes);
      return txes;
    })
  ;
}

function fetchMessageSentAll(sender, minTime, pkey) {
  return Promise.all([
    fetchMessageSents(sender, minTime, pkey),
    fetchMessageSendings(sender, minTime, pkey)
  ])
  .then(data => mergeSents(data[0], data[1]));
}

function sendMessages(pkey) {
  return function(candidates) {
    return Promise.all(candidates.map(c => {
      logger.info(`${c.message} => ${c.address}`);
      // return helper.sendMessage(c.address, c.message, pkey);
      return `${message} => ${c.address}`;
    }));
  }
}

function mergeSents(a, b) {
  return _.concat(a, b);
}

module.exports = {
  fetchMosaicReceives,
  fetchMessageSents,
  fetchMessageSendings,
  fetchMessageSentAll,
  sendMessages
};
