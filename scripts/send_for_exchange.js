const nem = require('nem-sdk').default;
const endpoint = nem.model.objects.create('endpoint')(
  nem.model.nodes.defaultTestnet,
  nem.model.nodes.defaultPort
);

const ep = nem.model.objects.create('endpoint');

let endpoints = [
  ep('http://13.70.154.110', 7890),
  ep('http://23.228.67.85', 7890),
  ep('http://45.77.47.227', 7890),
  ep('http://50.3.87.123', 7890),
  ep('http://54.249.97.126', 7890),
  ep('http://88.208.3.82', 7890),
  ep('http://104.128.226.60', 7890),
  ep('http://150.95.145.157', 7890),
  ep('http://188.68.50.161', 7890),
  ep('http://192.3.61.243', 7890)
];

Array.prototype.pick = function() {
  return this[Math.floor(Math.random() * this.length)];
}

let pkeys = [
  // '995ad5d43dbb5c4a4546095212ab3b2b84281cb28d9146ded14ff34be8b1d59a',
  // '1ec63da4be7e95d89cbf14b83e35580d13bd2e6ca01b5862fbd004f2410fbe67',
  // '57bcfd966909d69192d3d40d99881653924cefb81128b787b3f5352686e155f1',
  // '7055a1de809c60fdb3eacccbecdabff88622171a4ca01d9a75198156189d3346',
  // 'd0783aedce1bc861501367b9b63e61bceed92cb9cce51750cc3fed39be574b4e',
  // '9f36d2744f6bcf619bd4c563802ec77b0f0353df76e5009d52cb02b66a2f0d3f',
  // '81b3e2c18cdd5f9c63f575117cbaa7539c53b6f4c9087edf6aec56c65cbfc45a',
  // 'cf00090da44169453896e0b4b69ead6c981b847e7a1c41539d1bf9b35784ff3b',
  // 'cdd16158f2ab84c8fc022a8dd122c646d7941e2e85ea4bf0cf25973be3552fff',
  // 'e24ed462480ea6b23e0bfc89c94e35186a6c3cd21ec78610c6a6db2ad7c6b6c7',
  // '8b29f329f60e3a302fbb4e1088cb98e5d2690009a1d2b73ad9b314196a241625',
  // '9deec1ec3f9668000ac25d89d3a159b2882714dabdbc6a7cbb50b04c2f989db2',
  // '84aacd85094f347d4626ccaa8226f70e97061b64f0c9d9bb40a7e2a51e689b67',
  // 'ad8d7b1f46a9b560d988a6d547e5c4170a03390821fde7dd93f2f73d8b15e2a6',
  // 'f977a3b9348502dc14f026dfc6ddbf45086f91db0d4b2c62c1417447517e9cbf',
  // '6b02728039afc26c9bf9a9d85095826d57403035a508cf8ee1a16ea250b84b37',
  // '13537301f1e5cf4dfd6acf5d2cf50c200a06fa2d5c290e9dba4808c83d8abf44',
  // 'b8817f05c2bac7dbcb238d548ef68f8026b03cc0394914c1c2049fcd0779f182',
  // 'c5a3fcf1c638de02ada8874a2b9a3dea9ff279c59fc1e25e4fd15d1d9ddbf069',
  // 'f83419693e1c70cf23e43d048aae67de0d943cb470d6df60a6d7a3c714dc45ff',
  // 'c517801668be954ed7778a0e28b3f1e9656176f9f3915dd677d5975e52dc9845',
  // '5e899257ce8546e6b048802a0bc8e025ced5a36e9446ccffa0c3e13bb1a8e6a1',
  // 'e8acde96bd502bc6075438feb863574c09991bad69b284980b44b4e9899a03cc'
]

const SINK = 'TAWKJTUP4DWKLDKKS534TYP6G324CBNMXKBA4X7B';

function send(keys) {
  keys.forEach(key => { sendMosaic(key) });
}

function sendMosaic(key) {
  let common = nem.model.objects.create('common')('', key);
  let transferTx = nem.model.objects.create('transferTransaction')(
    SINK,
    1,
    ''
  );

  let mosaicAttachment = nem.model.objects.create('mosaicAttachment')(
    'y4uk',
    'gift',
    1
  );
  transferTx.mosaics.push(mosaicAttachment);

  nem.com.requests.namespace.mosaicDefinitions(endpoint, mosaicAttachment.mosaicId.namespaceId).then(function(res) {
    let neededDefinition = nem.utils.helpers.searchMosaicDefinitionArray(res.data, ["gift"]);
    let fullMosaicName = nem.utils.format.mosaicIdToName(mosaicAttachment.mosaicId);
    let moDefMetaDataPair = nem.model.objects.get('mosaicDefinitionMetaDataPair');
    moDefMetaDataPair[fullMosaicName] = {};
    moDefMetaDataPair[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName];

    console.log(neededDefinition)

    txEntity = nem.model.transactions.prepare('mosaicTransferTransaction')(
      common,
      transferTx,
      moDefMetaDataPair,
      nem.model.network.data.testnet.id
    );
    return false; // nem.model.transactions.send(common, txEntity, endpoints.pick());
  })
  .then(data => { console.log(data) })
  .catch(err => { console.error(err) })
}

send(pkeys);
