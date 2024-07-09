import web3 from '@solana/web3.js'
import bs58 from 'bs58'

import {
  Connection,
  Keypair,
  PublicKey,
  TransactionConfirmationStrategy,
  BlockheightBasedTransactionConfirmationStrategy
} from '@solana/web3.js'
import { Chain } from './types'
import { saveLogs } from './common_utils'

export async function estimateUnitLimitTest(rpcUrl: string) {
  const connection = new Connection(rpcUrl, 'confirmed')
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash('confirmed')
  const publicKey = new PublicKey(
    'GV7TjKvYMDxcwCQ3xNQ2LRYxDSKxBxH3oqFrEG71PwW4'
  )
  const instructions = [
    web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey,
      lamports: web3.LAMPORTS_PER_SOL / 100
    })
  ]
  const messageV0 = new web3.TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: blockhash,
    instructions
  }).compileToV0Message()
  const transaction = new web3.VersionedTransaction(messageV0)

  const simulationResult = await connection.simulateTransaction(
    transaction,
    {
      replaceRecentBlockhash: true,
      sigVerify: false,
      commitment: 'processed'
    }
  )
  const multipler = 1.1
  const estimatedUnitLimit = Math.floor(
    simulationResult.value.unitsConsumed! * multipler
  )
  return BigInt(estimatedUnitLimit)
}

export async function analysisGasLimitOnSolana(
  rpcUrl: string,
  limit = 50
) {
  const connection = new Connection(rpcUrl, 'confirmed')
  // jupiter
  const programPubKey = new PublicKey(
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
  )
  // TODO
  const txs = (
    await connection.getConfirmedSignaturesForAddress2(
      programPubKey,
      { limit }
    )
  ).map((tx) => tx.signature)
  const parsedTxs = (
    await connection.getParsedTransactions(txs)
  ).filter((tx) => tx !== null && tx.meta !== null)
  const gasUseds: Record<string, bigint> = {}
  parsedTxs.forEach(
    (tx) =>
      (gasUseds[tx!.transaction.signatures[0]] = BigInt(
        tx!.meta!.computeUnitsConsumed!
      ))
  )
  // save recent data of gasUseds
  const filename = `./data/${Chain[Chain.Solana]}.json`
  saveLogs(filename, gasUseds)
}
