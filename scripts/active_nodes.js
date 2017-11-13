const request = require('request');
const nem = require('nem-sdk').default;
console.log(nem.model.nodes.defaultTestnet)
let host = true ? nem.model.nodes.defaultTestnet : nem.model.nodes.defaultMainnet
let nodeUrl = host + ':' + nem.model.nodes.defaultPort;
new Promise((resolve, reject) => {
  request(nodeUrl + '/node/peer-list/active', (err, res, body) => {
    !err && res.statusCode == 200 ? resolve(JSON.parse(body).data) : reject(err);
  });
})
.then(res => {
  res.forEach(node => {
    let ep = node.endpoint;
    console.log(ep.protocol + '://' + ep.host)
  })
})
