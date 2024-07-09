import { rangoAddressInZksync, rangoAddress } from './constants'
import {
  lifiAddress,
  lifiAddressInLinea,
  lifiAddressInMetis,
  lifiAddressInZksync,
  oneInchAddress
} from './constants'
import { Chain } from './types'
import { JsonRpcProvider, ethers } from 'ethers'
import { saveLogs } from './common_utils'

export function getRangoAddress(chain: Chain): string {
  if (chain == Chain.ZkSync) {
    rangoAddressInZksync
  }
  return rangoAddress
}

export function getLifiAddress(chain: Chain): string {
  if (chain === Chain.ZkSync) {
    return lifiAddressInZksync
  } else if (chain === Chain.Linea) {
    return lifiAddressInLinea
  } else if (chain === Chain.Metis) {
    return lifiAddressInMetis
  } else {
    return lifiAddress
  }
}

export function getOneInchAddress(chain: Chain): string {
  return oneInchAddress
}

export function getRangoContract(
  chain: Chain,
  provider: JsonRpcProvider
) {
  const rangoAddress = getRangoAddress(chain)

  const abis = [
    'event RangoBridgeInitiated(address indexed requestId,address bridgeToken,uint256 bridgeAmount,address receiver,uint destinationChainId, bool hasInterchainMessage,bool hasDestinationSwap,uint8 indexed bridgeId,uint16 indexed dAppTag)',
    'function facetAddresses() external view override returns (address[] memory facetAddresses_)'
  ]
  const rangoContract = new ethers.Contract(
    rangoAddress,
    abis,
    provider
  )
  return rangoContract
}

export function getLifiContract(
  chain: Chain,
  provider: JsonRpcProvider
) {
  const abis = [
    'event LiFiTransferStarted(tuple(bytes32 transactionId,string bridge,string integrator,address referrer,address sendingAssetId,address receiver,uint256 minAmount,uint256 destinationChainId,bool hasSourceSwaps,bool hasDestinationCall) bridgeData)'
  ]
  return new ethers.Contract(getLifiAddress(chain), abis, provider)
}

export function getOneInchContract(
  chain: Chain,
  provider: JsonRpcProvider
) {
  const abis = [
    'event Swapped(address sender,address srcToken,address dstToken,address dstReceiver,uint256 spentAmount,uint256 returnAmount)'
  ]
  return new ethers.Contract(getOneInchAddress(chain), abis, provider)
}

export async function analysisGasLimitOnEVMChain(
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
