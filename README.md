# BIP39 Ethereum CLI Signer
A pure javascript ethereum signer, completely offline and usable from your command line. No build needed, just checkout and install the dependencies.

## Pre-Requisites

* BIP39 Wallet that uses a mnemonic phrase as seed
* Hardware that runs `node.js`

## How-To

1. Clone this repository
2. `npm install`
3. Copy to USB-Stick
4. Use on Offline-Computer
5. `node index.js` for help

## Examples
To sign a transaction:

```
node index.js createEthTx --from "0xf0D5c99463C6c69df86987A777f36d5748A13181" --to "0xc29F56Bf3f3978438dc714e83fdb57ea773ACa17" --nonce 0 --value 1 --gasPrice 21000000000 --gasLimit 21000
```

This will create a transaction for 1 ETH from `0xc2E87a289041fd0f04a954da6044ff8bb60927a4` to `0xc29F56Bf3f3978438dc714e83fdb57ea773ACa17`. You will then be asked to supply your mnemonic phrase using a prompt.

You'll get the transaction to copy as raw text, or a scannable QR-Code.

**Caution** : If you use `--mnemonic` to supply your phrase, be advised that your phrase can be recovered from your bash/shell history.