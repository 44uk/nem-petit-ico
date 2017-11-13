const nem = require('nem-sdk').default;

Array.prototype.pick = function() {
  return this[Math.floor(Math.random() * this.length)];
}

function randNum(min, max) {
  return Math.floor(Math.random()*(max+1-min)+min);
}

let endpoints = [
  {host: 'http://bigalice2.nem.ninja', port: 7890},
  {host: 'http://88.208.3.82'  , port: 7890},
  {host: 'http://13.70.154.110', port: 7890},
  {host: 'http://192.3.61.243' , port: 7890},
  {host: 'http://23.228.67.85' , port: 7890},
  {host: 'http://50.3.87.123'  , port: 7890}
];

// faucet privKey
const FAUCET_KEY = '260206d683962350532408e8774fd14870a173b7fba17f6b504da3dbc5f1cc9f';
// TAWKJTUP4DWKLDKKS534TYP6G324CBNMXKBA4X7B

// addresses
let addrs = [
  'TCPICOKRY3IIVZ4VYNLXQ5D2UPGD2JYGBWDL6QUO',
  'TBPICOEANLNA7I4DCGJKZU6WJSYI4M5E6ZGYSFNX',
  'TAPICOFOHFIAH3WAYTK76UNTB7JTXXB333PVH255',
  'TBPICOUZLRASRAYA63LSNFA6PYQUEZMOAOYEL3TB',
  'TAPICOLXV7PZ3HIVM46CMYSQ67LY2JFJ4F7GQAU7',
  'TBPICOJPMT4CVRMFYXLIBHAS3VPSW2GLUMCTUBRT',
  'TCPICOETVB6V23IST62KMPTWQ2GPXZ5WIT3MFLY5',
  'TCPICO4LNCDTTA2VQ4DMRXTNSSFTGFZOSY5HXS3L',
  'TBPICOO34TP6LGH65F4TFC5Q7W4I4S7XW43I4LOG',
  'TCPICO6EVO6SWLRV23FWD5NAPM7RIFYX7CO5GNFZ',
  'TAPICOJ6UVU2NLVA6KI5XCK3OIZUL7HY33L4EYCJ',
  'TDPICOQERKH4B3GRHXCXBYUDGBK6Q42HUURXI6LO',
  'TAPICO6BY3BW5LPYVTXVIGADBYS6U7D4RN2WL6PO',
  'TAPICOPOBSISV3C2WXJ2JHNLMDKDH7NBKVGDPVJC',
  'TBPICOB643OUU6H57FAJKFGA6YKKDUB25Z6Q5IZB',
  'TCPICOWHL4EJB4BLBFRYHVUTG37GUHURFEXR6ZT7',
  'TDPICOKY6E2GFM7FTOBRY4UAVYBXSYBEBL34XW2O',
  'TCPICOJNHHWNPPVXIY3PRZKU3QAONKMESZ6FW4HO'
]

function send(addrs) {
  addrs.forEach(addr => {
    sendXem(addr, 10)
      .then(data => { console.log(data) })
      .catch(err => { console.error(err) })
  });
}

function sendXem(addr, amount) {
  let common = nem.model.objects.create('common')('', FAUCET_KEY);
  let transferTx = nem.model.objects.create('transferTransaction')(
    addr,
    amount,
    ''
  );
  let txEntity = nem.model.transactions.prepare('transferTransaction')(
    common,
    transferTx,
    nem.model.network.data.testnet.id
  );

  return (new Promise((resolve, _) => {
    setTimeout(() => { resolve('do'); }, randNum(1, 6) * 10000);
  }))
  .then((str) => {
    return nem.model.transactions.send(common, txEntity, endpoints.pick());
  })
  // return nem.model.transactions.send(common, txEntity, endpoints.pick());
}

send(addrs);
