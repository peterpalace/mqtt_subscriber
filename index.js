const mqtt = require('mqtt');
const utils = require('./utils');
const config = require('./config.json');


let client = mqtt.connect(config.broker.host, {
  username: config.broker.username,
  password: config.broker.password,
  rejectUnauthorized: false
});

client.on('connect', function () {
  client.subscribe(config.broker.topic);
});

const openpgp = require('openpgp');
const passphrase = config.passphrase;

function getPrivateKey(path) {
  return `
-----BEGIN PGP PRIVATE KEY BLOCK-----

.............
.............
.............
-----END PGP PRIVATE KEY BLOCK-----
`
}

const privkey = getPrivateKey(config.privateKeyPath);

const decryptFunction = async (encrypted) => {
  const privKeyObj = (await openpgp.key.readArmored(privkey)).keys[0];
  await privKeyObj.decrypt(passphrase);
  const options = {
    message: await openpgp.message.readArmored(encrypted),    // parse armored message
    privateKeys: [privKeyObj]                                 // for decryption
  }

  openpgp.decrypt(options).then(plaintext => {
    console.log(plaintext.data);
    return plaintext.data
  }).catch(() => {
    console.log("Impossible to decrypt the message");
  })
}

client.on('message', function (topic, message) {
 let msg = decryptFunction(message);
  console.log(msg);
})
