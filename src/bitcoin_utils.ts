import * as bitcoin from 'bitcoinjs-lib'
import { Signer } from 'bitcoinjs-lib'
import { ethers } from 'ethers'
import ECPairFactory from 'ecpair'
import * as ecc from 'tiny-secp256k1'
import Web3 from 'web3'
import { HttpProvider } from 'web3'
import assert from 'assert'

const ECPair = ECPairFactory(ecc)
bitcoin.initEccLib(ecc)

function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33)
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return bitcoin.crypto.taggedHash(
    'TapTweak',
    Buffer.concat(h ? [pubKey, h] : [pubKey])
  )
}

function tweakSigner(signer: Signer, opts: any = {}): Signer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey: Uint8Array | undefined = signer.privateKey!
  if (!privateKey) {
    throw new Error('Private key is required for tweaking signer!')
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey)
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash)
  )
  if (!tweakedPrivateKey) {
    throw new Error('Invalid tweaked private key!')
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network
  })
}

async function rpcTest(provider: HttpProvider) {
  console.log(
    await provider.request({
      method: 'estimatesmartfee',
      params: [10]
    })
  )
  // chain info
  const chaininfo = await provider.request({
    method: 'getblockchaininfo'
  })
  console.log(chaininfo)
}

async function fetchTx(
  provider: HttpProvider,
  txHash: string | Buffer
) {
  const { result: rawTransaction } = await provider.request({
    method: 'getrawtransaction',
    params: [txHash]
  })
  const tx = bitcoin.Transaction.fromHex(rawTransaction as string)
  return tx
}

export async function estimateFeeTest(url: string, numInputs = 2) {
  const network = bitcoin.networks.bitcoin
  const keypair = ECPair.makeRandom({ network })
  const tweakedSigner = tweakSigner(keypair, { network })
  const p2pktr = bitcoin.payments.p2tr({
    pubkey: toXOnly(tweakedSigner.publicKey),
    network
  })

  const provider = new HttpProvider(url)

  // generate mock utxos
  const utxos: { hash: string; value: number; index: number }[] = []
  for (let i = 0; i < numInputs; ++i) {
    const hash = ethers.hexlify(ethers.randomBytes(32)).slice(2)
    const value = Math.round(Math.random() * 1e7)
    const index = 0
    utxos.push({ hash, value, index })
  }
  // generate inputs according to previous utxos
  const inputs = utxos.map((utxo) => {
    return {
      hash: utxo.hash,
      index: utxo.index,
      witnessUtxo: {
        value: utxo.value,
        script: p2pktr.output!
      },
      tapInternalKey: toXOnly(keypair.publicKey)
    }
  })

  const totalValue = utxos.reduce((acc, cur) => (acc += cur.value), 0)
  const outputs: { script: Buffer; value: number }[] = []
  const bridgedAmount = 1
  // bridge btc to other chains by binance bridge
  const p2pkh = bitcoin.payments.p2pkh({
    address: '1DveSJgEWmUKWLPiZzA3CNnitpkJgAAxnV',
    network
  })
  outputs.push({ script: p2pkh.output!, value: bridgedAmount })
  outputs.push({
    script: p2pktr.output!,
    value: totalValue - bridgedAmount
  })

  // build transfer transaction(PBST)
  const txb = new bitcoin.Psbt({ network })
  // add utxo
  const expectedTx = txb
    .addInputs(inputs)
    .addOutputs(outputs)
    .signAllInputs(tweakedSigner)
    .finalizeAllInputs()
    .extractTransaction(true)
  // check virtual size is computed correctly
  // https://github.com/bitcoinjs/bitcoinjs-lib/blob/2013f198c0d3586b8c18d9b1e28f2e6fa7711863/src/transaction.js#L151-L177
  const numBytes = BigInt(expectedTx.virtualSize())
  console.log(numBytes)
  return numBytes
}
