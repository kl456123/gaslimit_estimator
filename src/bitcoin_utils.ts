import * as bitcoin from "bitcoinjs-lib";
import { Signer } from "bitcoinjs-lib";
import { ethers } from "ethers";
import ECPairFactory from "ecpair";
import * as ecc from "tiny-secp256k1";
import Web3 from "web3";
import { HttpProvider } from "web3";
import assert from "assert";

const ECPair = ECPairFactory(ecc);
bitcoin.initEccLib(ecc);

function toXOnly(pubkey: Buffer): Buffer {
  return pubkey.subarray(1, 33);
}

function tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
  return bitcoin.crypto.taggedHash(
    "TapTweak",
    Buffer.concat(h ? [pubKey, h] : [pubKey]),
  );
}

function tweakSigner(signer: Signer, opts: any = {}): Signer {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let privateKey: Uint8Array | undefined = signer.privateKey!;
  if (!privateKey) {
    throw new Error("Private key is required for tweaking signer!");
  }
  if (signer.publicKey[0] === 3) {
    privateKey = ecc.privateNegate(privateKey);
  }

  const tweakedPrivateKey = ecc.privateAdd(
    privateKey,
    tapTweakHash(toXOnly(signer.publicKey), opts.tweakHash),
  );
  if (!tweakedPrivateKey) {
    throw new Error("Invalid tweaked private key!");
  }

  return ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
    network: opts.network,
  });
}

async function rpcTest(provider: HttpProvider) {
  console.log(
    await provider.request({ method: "estimatesmartfee", params: [10] }),
  );
  // chain info
  const chaininfo = await provider.request({ method: "getblockchaininfo" });
  console.log(chaininfo);
}

async function fetchTx(provider: HttpProvider, txHash: string | Buffer) {
  const { result: rawTransaction } = await provider.request({
    method: "getrawtransaction",
    params: [txHash],
  });
  const tx = bitcoin.Transaction.fromHex(rawTransaction as string);
  return tx;
}

export async function estimateFeeTest(url: string) {
  const network = bitcoin.networks.bitcoin;
  const keypair = ECPair.makeRandom({network});
  const tweakedSigner = tweakSigner(keypair, { network });
  const p2pktr = bitcoin.payments.p2tr({
    pubkey: toXOnly(tweakedSigner.publicKey),
    network,
  });
  const provider = new HttpProvider(url);

  const txHash =
    "53c22e7e665a63050ad674246b790e56e70095eb7b5c753585095e798e0be2a1";
  const tx = await fetchTx(provider, txHash);
  const outputs: { script: Buffer; value: number }[] = [];
  tx.outs.forEach((output) => {
    outputs.push({ script: output.script, value: output.value });
  });
  const prevTx = await fetchTx(
    provider,
    tx.ins[0].hash.reverse().toString("hex"),
  );

  // build transfer transaction(PBST)
  const txb = new bitcoin.Psbt({ network });
  // add utxo
  txb.addInput({
    hash: tx.ins[0].hash,
    index: tx.ins[0].index,
    witnessUtxo: {
      value: prevTx.outs[tx.ins[0].index].value,
      script: p2pktr.output!,
    },
    tapInternalKey: toXOnly(keypair.publicKey),
  });
  txb.addOutputs(outputs);

  txb.signInput(0, tweakedSigner);
  txb.finalizeAllInputs();
  const expectedTx = txb.extractTransaction();
  // check virtual size is computed correctly
  assert(expectedTx.virtualSize() == tx.virtualSize());
  // https://github.com/bitcoinjs/bitcoinjs-lib/blob/2013f198c0d3586b8c18d9b1e28f2e6fa7711863/src/transaction.js#L151-L177
  return BigInt(expectedTx.virtualSize());
}
