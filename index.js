#!/usr/bin/env node

const bip39 = require('bip39')
const EthereumTx = require('ethereumjs-tx')
const ethereumUtil = require('ethereumjs-util')
const ethereumUnits = require('ethereumjs-units')
const bitcoinjs = require('bitcoinjs-lib')
const prompt = require('prompt')
const yargs = require('yargs')
const qrcode = require('qrcode-terminal')

const decimalToHex = function (number) {
  if (typeof number === 'string') {
    number = parseInt(number)
  }

  if (number < 0) {
    return process.exit(1)
  }

  return ethereumUtil.addHexPrefix(number.toString(16))
}

const buildTx = function (mnemonic, argv) {
  mnemonic = mnemonic.trim()

  if (!bip39.validateMnemonic(mnemonic)) {
    console.warn('your mnenomic phrase could not been validated.')
    process.exit(1)
  }

  const bip32RootKey = bitcoinjs.HDNode.fromSeedBuffer(bip39.mnemonicToSeed(mnemonic))

  const child = bip32RootKey.derivePath(argv.path)

  const privateKey = child.keyPair.d.toBuffer()
  const senderAddress = ethereumUtil.toChecksumAddress(ethereumUtil.privateToAddress(privateKey).toString('hex'))

  if (senderAddress !== ethereumUtil.toChecksumAddress(argv.from)) {
    console.warn('your derivation path does not give the same address as you have specified.')
    console.warn('Your Address:', argv.from)
    console.warn('Derived Address:', senderAddress)
    process.exit(1)
  }

  console.log('')
  console.log('')
  console.log('Sender: ', senderAddress)
  console.log('Path: ' + argv.path)
  console.log('')

  const tx = new EthereumTx({
    value: decimalToHex(ethereumUnits.convert(argv.value, 'ether', 'wei')),
    nonce: decimalToHex(argv.nonce),
    gasPrice: decimalToHex(argv.gasPrice),
    gasLimit: decimalToHex(argv.gasLimit),
    data: argv.data.toString(16),
    to: argv.to
  }, 1)

  const fee = tx.getUpfrontCost()
  console.log('Minimal Account Balance:', ethereumUnits.convert(fee.toString(), 'wei', 'eth'), 'ETH')

  tx.sign(privateKey)

  console.log('')
  console.log(senderAddress, '==>', ethereumUnits.convert(parseInt(tx.value.toString('hex'), 16), 'wei', 'eth'), 'ETH ==>', ethereumUtil.toChecksumAddress(tx.to.toString('hex')))
  console.log('')
  console.log('')
  console.log('--- Signed Transaction ----')
  console.log(tx.serialize().toString('hex'))
  console.log('')
  console.log('')
  console.log('--- QRCode of Signed Transaction ----')
  console.log('')
  console.log('')
  qrcode.generate(tx.serialize().toString('hex'), { small: true })
}

var signTx = function (argv) {
  if (!argv.mnemonic) {
    prompt.start()
    prompt.get(['mnemonic'], (error, result) => {
      if (error) {
        console.warn(error)
        process.exit(1)
      }

      buildTx(result.mnemonic, argv)
    })
  } else {
    buildTx(argv.mnemonic, argv)
  }
}

yargs.usage('$0 <cmd> [args]')
    .command('createEthTx [from] [to] [value] [nonce] [gasPrice] [gasLimit] [data]', 'sign a transaction using your derivation path and mnenomic phrase', {
      path: { type: 'string', describe: 'BIP32/BIP44 compatible derivation path', default: "m/44'/60'/0'/0/0" },
      to: { type: 'string', describe: 'ETH Address to receive your funds' },
      from: { type: 'string', describe: 'ETH Address you\'re sending from' },
      value: { type: 'string', describe: 'Value to send in ETH' },
      nonce: { type: 'string' },
      gasPrice: { type: 'string' },
      gasLimit: { type: 'string' },
      data: { type: 'string', default: '0x' }
    }, signTx)
    .demandOption(['path'], 'A BIP32 or BIP44 compatible derivation path is necessary')
    .demandOption(['from'], 'ETH Address you\'re sending from. We need this to validate your path is correct')
    .demandOption(['to'], 'ETH Address that should receive your funds')
    .demandOption(['value'], 'How much ETH would you like to send?')
    .demandOption(['nonce'], 'The nonce is mandatory')
    .demandOption(['gasPrice'], 'Please provide the Gas Price in WEI')
    .demandOption(['gasLimit'], 'Please provide the Gas Limit in WEI')
    .help()
    .argv
