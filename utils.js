const openpgp = require('openpgp');
const config = require('./config.json');
const passphrase = config.passphrase;

function getPrivateKey(path) {
  return `
-----BEGIN PGP PRIVATE KEY BLOCK-----

......
......
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
  })
}


module.export = {
  decryptFunction: decryptFunction
}
