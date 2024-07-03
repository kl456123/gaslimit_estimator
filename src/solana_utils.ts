import web3 from "@solana/web3.js";
import bs58 from "bs58";

import {
  Connection,
  Keypair,
  PublicKey,
  TransactionConfirmationStrategy,
  BlockheightBasedTransactionConfirmationStrategy,
} from "@solana/web3.js";

export async function estimateUnitLimitTest(rpcUrl: string) {
  const connection = new Connection(rpcUrl, "confirmed");
  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  const publicKey = new PublicKey(
    "GV7TjKvYMDxcwCQ3xNQ2LRYxDSKxBxH3oqFrEG71PwW4",
  );
  const instructions = [
    web3.SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey,
      lamports: web3.LAMPORTS_PER_SOL / 100,
    }),
  ];
  const messageV0 = new web3.TransactionMessage({
    payerKey: publicKey,
    recentBlockhash: blockhash,
    instructions,
  }).compileToV0Message();
  const transaction = new web3.VersionedTransaction(messageV0);

  const simulationResult = await connection.simulateTransaction(transaction, {
    replaceRecentBlockhash: true,
    sigVerify: false,
    commitment: "processed",
  });
  const multipler = 1.1;
  const estimatedUnitLimit = Math.floor(
    simulationResult.value.unitsConsumed! * multipler,
  );
  return BigInt(estimatedUnitLimit);
}
