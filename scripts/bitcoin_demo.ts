import {
  initEccLib,
  networks,
  Psbt,
  payments,
  Transaction,
  Network
} from 'bitcoinjs-lib'
import { HttpProvider } from 'web3'
import { ethers } from 'ethers'

import dotenv from 'dotenv'
dotenv.config()

import * as ecc from 'tiny-secp256k1'
import ECPairFactory from 'ecpair'
import { ECPairInterface } from 'ecpair'

// init ecc lib
const ECPair = ECPairFactory(ecc)
initEccLib(ecc)

async function fetchTx(
  provider: HttpProvider,
  txHash: string | Buffer
) {
  const { result: rawTransaction } = await provider.request({
    method: 'getrawtransaction',
    params: [txHash]
  })
  const tx = Transaction.fromHex(rawTransaction as string)
  return tx
}

function generateInputDataByLegacy() {
  // legacy p2pkh
  const utxos: { hash: string; txHex: string; index: number }[] = [
    {
      hash: 'dc860e1ba227a7c0797eee0fb6ae8bd185186e270e0a3f598e2dd495e78a6984',
      index: 0,
      txHex:
        '0200000000010112d6712ed349f7854008201e5885f32d37f70459d6736268fc01245e4c0fbb730100000000ffffffff0240420f00000000001976a91420cc2ff8cd745ff3157003b6ddddd841ea6c0e5188accdc8350000000000225120137455fdffc7e523320d61f1894b569a1c655deb514a3ffeb66f82f354af1ead0140d30f30947b395f3ab7c0b97c011339915eaefbebda0614d1174b17ec6427d5f393e4d4f45f2d3aa886154c85de00dc68aeed01c75c7c3cf64772a3632d10394100000000'
    },
    {
      hash: '41229f78e26f908149ba60bdd62709ab745234952b80ecb9b1b01226a4acf9a7',
      index: 0,
      txHex:
        '0200000000010104f51a4e4a5f0dcf2931afa3227403263801969f0df1b2cc31ca1670985ab24f0100000000ffffffff0240420f00000000001976a91420cc2ff8cd745ff3157003b6ddddd841ea6c0e5188acbc55540000000000225120137455fdffc7e523320d61f1894b569a1c655deb514a3ffeb66f82f354af1ead01409d5fd9ec1df2f8a073fabf15a8deb97c5a021ffa36a311c61f955bf7c92d2c309600896dadced2e56bb4b48b86ba5ee6ec6f3ca4ad5ef2370845951f35ee877800000000'
    }
  ]

  // generate inputs according to previous utxos
  const inputs = utxos.map((utxo) => {
    return {
      hash: utxo.hash,
      index: utxo.index,
      nonWitnessUtxo: Buffer.from(utxo.txHex, 'hex')
    }
  })
  return inputs
}

function generateInputDataByNestedSigWit(
  keyPair: ECPairInterface,
  network: Network
) {
  const payment = payments.p2sh({
    redeem: payments.p2wpkh({ pubkey: keyPair.publicKey, network }),
    network
  })
  // nested segwit p2sh-p2wpkh
  const utxo = {
    hash: '73bb0f4c5e2401fc686273d65904f7372df385581e20084085f749d32e71d612',
    index: 0,
    txHex:
      '02000000000101a7f9aca42612b0b1b9ec802b95345274ab0927d6bd60ba4981906fe2789f22410100000000ffffffff0240420f000000000017a9146d59e72b37dcbfbdd0955f68a742f39678f960de87040f450000000000225120137455fdffc7e523320d61f1894b569a1c655deb514a3ffeb66f82f354af1ead014041520ef950d57a610ca3cfed270651c7a9fb96da5678bd7dce5bbadac10e967bb26ee0597bb5eac26f7c2b4e8494a9568ec688fa4519b8f10e14b327abfd812500000000'
  }
  const tx = Transaction.fromHex(utxo.txHex)
  return [
    {
      hash: utxo.hash,
      index: utxo.index,
      witnessUtxo: {
        ...tx.outs[utxo.index]
      },
      redeemScript: payment.redeem!.output
    }
  ]
}

function generateInputDataByNativeSegWit() {
  // native segwit p2wpkh
  const utxo = {
    hash: 'cb41327c3d5273b245511e9bb2d7abda26a981c1794ff2ac38284c293dd510d2',
    index: 0,
    txHex:
      '0200000000010184698ae795d42d8e593f0a0e276e1885d18baeb60fee7e79c0a727a21b0e86dc0100000000ffffffff0240420f0000000000160014f96fad6c1f6a12f2c7ddc80e934aa9e58d7be660ab82260000000000225120137455fdffc7e523320d61f1894b569a1c655deb514a3ffeb66f82f354af1ead0140909d5cd86d5636e6fa9d5b96f81b3162e14ca9916f74c4a2cc3b8b91a7f3c29b867edda309bb5e635c8178a3cbfd978f1d949ab64cdb4de0f483eb86f7e86b8d00000000'
  }
  const tx = Transaction.fromHex(utxo.txHex)
  return [
    {
      hash: utxo.hash,
      index: utxo.index,
      witnessUtxo: {
        ...tx.outs[utxo.index]
      }
    }
  ]
}

async function main() {
  const network = networks.bitcoin
  const keyPair = ECPair.fromWIF(
    process.env.BITCOIN_WIF as string,
    network
  )
  // output: locked script
  // p2pkh 25
  // p2tr 34
  // p2wpkh 22
  //
  // input: unlocked script
  // p2pkh 149
  // p2tr 58
  // generate inputs according to previous utxos
  // const inputs = generateInputDataByNativeSegWit()
  // const inputs = generateInputDataByNestedSigWit(keyPair, network)
  const inputs = generateInputDataByLegacy()
  const txb = new Psbt({ network })
  txb
    .addInputs(inputs)
    .addOutput({
      address: '1DveSJgEWmUKWLPiZzA3CNnitpkJgAAxnV',
      value: 200
    })
    .addOutput({
      address:
        'bc1pzd69tl0lcljjxvsdv8ccjj6kngwx2h0t299rll4kd7p0x490r6ksd9v4jw',
      value: 200
    })

  // sign
  txb.signAllInputs(keyPair)
  txb.finalizeAllInputs()
  const tx = txb.extractTransaction(true)
  const numBytes = BigInt(tx.virtualSize())
  console.log(numBytes)
}

main()
