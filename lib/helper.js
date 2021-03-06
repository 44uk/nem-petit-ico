require('dotenv').config();
const nem = require('nem-sdk').default;
const log4js = require('log4js');
log4js.configure({
  appenders: {
    stdout: { type: 'stderr' },
    file: { type: 'file', filename: `log/${process.env.NODE_ENV || 'development'}.log` }
  },
  categories: {
    default: { appenders: ['stdout', 'file'], level: 'error' }
  }
});

const NETWORK = process.env.NEM_NETWORK === 'mainnet' ?
  nem.model.network.data.mainnet.id :
  nem.model.network.data.testnet.id
;

const ENDPOINT = nem.model.objects.create('endpoint')(
  process.env.NEM_NODE || nem.model.nodes.defaultTestnet,
  process.env.NEM_PORT || nem.model.nodes.defaultPort
);

let NEM_EPOCH = Date.UTC(2015, 2, 29, 0, 6, 25, 0);

function println(val) {
  if (val instanceof Array) {
    val.forEach(el => { println(el); })
  } else {
    console.log(val);
  }
}

function logger(tag = 'default') {
  let logger = log4js.getLogger(tag);
  logger.level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';
  return logger;
}

function NEMTimestamp(timestamp) {
  if(timestamp == null) { return null; }
  return ~~((timestamp - NEM_EPOCH) / 1000);
}

function getMosaic(mosaics, fqn) {
  let splitedFqn = splitNsAndMo(fqn);
  let ns = splitedFqn[0];
  let mo = splitedFqn[1];
  if(! mosaics) { return null; }
  let mosaic = null;
  let len = Object.keys(mosaics).length;
  for(let i = 0; i < len; i++) {
    let id = mosaics[i].mosaicId;
    if(id.namespaceId === ns && id.name === mo) {
      mosaic = mosaics[i];
    }
  }
  return mosaic;
}

function fetchTx(dir) {
  return (address, minTimestamp, maxTimestamp) => {
    let stack = [];
    let now = nem.utils.helpers.createNEMTimeStamp();
    let minNemTimestamp = minTimestamp >= 0 ? NEMTimestamp(minTimestamp) : now;
    let maxNemTimestamp = maxTimestamp >= 0 ? NEMTimestamp(maxTimestamp) : now;

    function fetch_inner(dir, address, id) {
      return nem.com.requests.account.transactions[dir](ENDPOINT, address, null, id).then(res => {
        let txes = res.data;
        let last = txes[txes.length-1];
        let isTerminal = txes.length < 25;
        txes = txes.filter(tx => {
          return (
            minNemTimestamp <= tx.transaction.timeStamp &&
            tx.transaction.timeStamp <= maxNemTimestamp
          )
        });
        stack = stack.concat(txes);
        if(! isTerminal && last && minNemTimestamp < last.transaction.timeStamp) {
          return fetch_inner(dir, address, last.meta.id);
        } else {
          return stack;
        }
      })
    }
    return fetch_inner(dir, address);
  };
}

function findOwnedMosaic(address, fqn) {
  return nem.com.requests.account.mosaics.owned(ENDPOINT, address).then(res => {
    return findMoAttachment(res.data, fqn);
  });
}

function findMoAttachment(attachments, fqn) {
  let splitedFqn = splitNsAndMo(fqn);
  let ns = splitedFqn[0];
  let mo = splitedFqn[1];
  for(let k = 0; k < attachments.length; k++) {
    let moId = attachments[k].mosaicId;
    if(moId.namespaceId == ns && moId.name == mo){ return attachments[k]; }
  }
}

function splitNsAndMo(fqn){
  return fqn.split(':');
}

function sendMosaic(address, fqn, quantity, msg = '', pkey, msigPub = null) {
  let splitedFqn = splitNsAndMo(fqn);
  let ns = splitedFqn[0];
  let mo = splitedFqn[1];
  let moAttachment = nem.model.objects.create('mosaicAttachment')(ns, mo, quantity);
  let common = nem.model.objects.create('common')('', pkey);
  let transferTx = nem.model.objects.create('transferTransaction')(address, 1, msg);
  transferTx.mosaics.push(moAttachment);
  if(msigPub) {
    transferTx.isMultisig = true;
    transferTx.multisigAccount = {publicKey: msigPub};
  }
  return nem.com.requests.namespace.mosaicDefinitions(ENDPOINT, moAttachment.mosaicId.namespaceId).then((res) => {
    let neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(res.data, [mo]);
    fullMosaicName = nem.utils.format.mosaicIdToName(moAttachment.mosaicId);
    if(undefined === neededDefinition[fullMosaicName]) {
      throw new Error(`Mosaic ${fqn} not found!`);
    }
    let moDefMetaDataPair = nem.model.objects.get('mosaicDefinitionMetaDataPair');
    moDefMetaDataPair[fullMosaicName] = {};
    moDefMetaDataPair[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName];
    let txEntity = nem.model.transactions.prepare('mosaicTransferTransaction')(
      common,
      transferTx,
      moDefMetaDataPair,
      NETWORK
    );
    return nem.model.transactions.send(common, txEntity, ENDPOINT);
  });
}

function sendMessage(address, message, pkey, msigPub = null) {
  let common = nem.model.objects.create('common')('', pkey);
  let transferTx = nem.model.objects.create('transferTransaction')(
    address,
    0,
    message
  );
  if(msigPub) {
    transferTx.isMultisig = true;
    transferTx.multisigAccount = {publicKey: msigPub};
  }
  return nem.com.requests.account.data(ENDPOINT, address).then(data => {
    transferTx.messageType = 2;
    transferTx.recipientPublicKey = data.account.publicKey;
    let txEntity = nem.model.transactions.prepare('transferTransaction')(
      common,
      transferTx,
      NETWORK
    );
    return nem.model.transactions.send(common, txEntity, ENDPOINT);
  });
}

function privkey2addr(privkey, network = NETWORK) {
  let kp = nem.crypto.keyPair.create(privkey);
  return pubkey2addr(kp.publicKey.toString(), network);
}

function pubkey2addr(pubkey, network = NETWORK) {
  return nem.model.address.toAddress(pubkey, network);
}

function addr2pubkey(address) {
  return nem.com.requests.account.data(ENDPOINT, address).then(data => {
    return data.account.publicKey;
  })
}

function decryptMessage(pkey, pubkey, message) {
  if(message.type === 1) { return message; }
  let decrypted = nem.crypto.helpers.decode(pkey, pubkey, message.payload);
  let decoded = nem.utils.format.hexToUtf8(decrypted);
  return {type: 1, payload: decrypted, decoded: decoded};
}

module.exports = {
  decryptMessage,
  getMosaic,
  NEMTimestamp,
  fetchTx,
  findOwnedMosaic,
  sendMosaic,
  sendMessage,
  addr2pubkey,
  pubkey2addr,
  privkey2addr,
  logger,
  println
};
