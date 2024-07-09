import { ethers } from 'ethers'
import { saveLogs } from '../src/common_utils'
import { Chain } from '../src/types'
import { rpcUrls, etherscanUrls } from '../src/constants'
import { getOneInchAddress } from '../src/evm_utils'
import axios from 'axios'

async function handleOneInchByRpc(
  rpcUrl: string,
  chain: Chain,
  recentBlockNumber = 100
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const toBlock = await provider.getBlockNumber()
  const oneInchAddress = getOneInchAddress(chain)
  // add one to make sure only `recentBlockNumber` blocks are processed in total
  const fromBlock = toBlock - recentBlockNumber + 1
  const totalTxHashes = []
  for (let i = fromBlock; i <= toBlock; ++i) {
    const block = (await provider.getBlock(i))!
    totalTxHashes.push(...block.transactions)
  }
  console.log(`collect ${totalTxHashes.length} txHashes in total`)

  const batchSize = 10
  const gasUseds: Record<string, bigint> = {}
  for (let i = 0; i < totalTxHashes.length; i += batchSize) {
    const currentBatch = totalTxHashes.slice(i, i + batchSize)
    const txReceipts = await Promise.all(
      currentBatch.map((txHash) =>
        provider.getTransactionReceipt(txHash)
      )
    )
    // filter our matched address from total receipts
    txReceipts
      .filter(
        (receipt) => receipt !== null && receipt.to === oneInchAddress
      )
      .forEach(
        (receipt, index) =>
          (gasUseds[currentBatch[index]] = receipt!.gasUsed)
      )
  }
  const filename = `./data/${Chain[chain]}.json`
  saveLogs(filename, gasUseds)
}

interface EtherscanTransactionResponse {
  blockNumber: string
  timeStamp: string
  hash: string
  nonce: string
  blockHash: string
  transactionIndex: string
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  isError: string
  txreceipt_status: string
  contractAddress: string
  cumulativeGasUsed: string
  gasUsed: string
  confirmations: string
  methodId: string
  functionName: string
}

async function handleOneInchByEtherscan(
  rpcUrl: string,
  chain: Chain,
  etherscanApiKey: string,
  recentBlockNumber = 100
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const endblock = await provider.getBlockNumber()
  const startblock = endblock - recentBlockNumber + 1
  const oneInchAddress = getOneInchAddress(chain)
  const etherscanUrl = etherscanUrls[chain]!
  // TODO(fetch total results by pagination)
  const res = await axios.get(etherscanUrl, {
    params: {
      module: 'account',
      action: 'txlist',
      address: oneInchAddress,
      startblock,
      endblock,
      page: 1,
      offset: 10,
      sort: 'asc',
      apikey: etherscanApiKey
    }
  })
  const networkName = Chain[chain]
  const { result }: { result: EtherscanTransactionResponse[] } =
    res.data
  const gasUseds: Record<string, bigint> = {}
  if (result.length > 0) {
    console.log(`retrive ${result.length} txs from ${networkName}`)
    result.forEach(
      (receipt) => (gasUseds[receipt.hash] = BigInt(receipt.gasUsed))
    )
    const filename = `./data/${networkName}.json`
    saveLogs(filename, gasUseds)
  } else {
    console.log(`get no any txs from ${networkName}`)
  }
}

const apiKeys = {
  [Chain.Optimism]: 'DAFYQIQZRSHHJAKI537DUG34I5EISE6TYR',
  [Chain.Ethereum]: '9K1972CHBWVUHDIHH925J8Q9F9369RK6IH',
  [Chain.Arbitrum]: '34DMWUNIFUBU89E9X6H7E8PGT1U6QVDJHV',
  [Chain.Base]: 'HSX9552HB65CH8AVDQ4Y45V9S9XTHPERNJ',
  [Chain.BSC]: '8VIU3SVRIUYRTP492AC8ZQGBVUDDV7MGV5'
}

async function main() {
  const chain = Chain.BSC
  const rpcUrl = rpcUrls[chain]!
  // await handleOneInchByRpc(rpcUrl, chain)
  const etherscanApiKey = apiKeys[chain]
  await handleOneInchByEtherscan(rpcUrl, chain, etherscanApiKey, 200)
}

main()
