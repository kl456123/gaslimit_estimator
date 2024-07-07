import { ethers } from 'ethers'
import { estimateUnitLimitTest } from '../src/solana_utils'
import { estimateFeeTest } from '../src/bitcoin_utils'
import { Chain } from '../src/types'
import { rpcUrls } from '../src/constants'
import {
  getRangoContract,
  getLifiContract,
  getOneInchContract
} from '../src/evm_utils'
import { saveLogs } from '../src/common_utils'

async function analysisGasLimitOnChain(
  rpcUrl: string,
  chain: Chain,
  recentBlockNumber = 2000
) {
  const provider = new ethers.JsonRpcProvider(rpcUrl)
  const toBlock = await provider.getBlockNumber()
  const gasUseds: Record<string, bigint> = {}

  const events = []
  // rango
  const rangoContract = getRangoContract(chain, provider)
  events.push(
    ...(await rangoContract.queryFilter(
      'RangoBridgeInitiated',
      toBlock - recentBlockNumber,
      toBlock
    ))
  )
  // lifi
  const lifiContract = getLifiContract(chain, provider)
  events.push(
    ...(await lifiContract.queryFilter(
      'LiFiTransferStarted',
      toBlock - recentBlockNumber,
      toBlock
    ))
  )
  // 1inch
  // TODO(fix bug of 1inch event abi)
  // const oneInchContract = getOneInchContract(chain, provider)
  // events.push(
  // ...(await oneInchContract.queryFilter(
  // 'Swapped',
  // toBlock - recentBlockNumber,
  // toBlock
  // ))
  // )
  console.log(`process ${events.length} amount of events in total`)

  for (const event of events) {
    const txReceipt = (await provider.getTransactionReceipt(
      event.transactionHash
    ))!
    gasUseds[txReceipt.hash] = txReceipt.gasUsed
  }
  // save recent data of gasUseds
  const filename = `./data/${Chain[chain]}.json`
  saveLogs(filename, gasUseds)
}

async function analysisGasLimitOnMultiChains() {
  for (const chainStr of Object.keys(rpcUrls)) {
    const chain = parseInt(chainStr) as Chain
    const rpcUrl = rpcUrls[chain]!
    console.log(`processing ${Chain[chain]}[${rpcUrl}]`)
    switch (chain) {
      case Chain.Solana: {
        await estimateUnitLimitTest(rpcUrl)
        break
      }
      case Chain.BTC: {
        // tx bytes instead of consumed resource
        await estimateFeeTest(rpcUrl)
        break
      }
      default: {
        try {
          await analysisGasLimitOnChain(rpcUrl, chain, 500)
        } catch (e) {
          console.log(`fail to process ${e}`)
        }
      }
    }
  }
}

async function main() {
  await analysisGasLimitOnMultiChains()
}

main()
