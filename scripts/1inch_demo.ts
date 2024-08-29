import { ethers, BigNumberish } from 'ethers'
import { rpcUrls, tokens } from '../src/constants'
import { Chain } from '../src/types'
import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const iface = new ethers.Interface([
  'function callOneInch(address fromToken, address toToken, uint256 fromTokenAmount, bytes calldata callData)'
])

const routerAddr = '0xb300000b72deaeb607a12d5f54773d1c19c7028d'

const apiBaseUrl = 'https://api.1inch.dev/swap/v6.0/'
async function requestFrom1Inch(
  method: string,
  swapParams: any,
  chainId: number
) {
  const config = {
    headers: {
      Authorization: `Bearer ${process.env.ONEINCH_API_KEY}`
    },
    params: swapParams
  }
  const res = await axios.get(
    `https://api.1inch.dev/swap/v6.0/${chainId}/${method}`,
    config
  )
  return res.data
}

interface SwapParam {
  src: string
  dst: string
  amount: string
  protocols?: string
  disableEstimate?: boolean
  allowPartialFill?: boolean
  includeProtocols?: boolean
  includeGas?: boolean
  slippage?: number // 1 for 1%
}

interface QuoteParam {
  src: string
  dst: string
  amount: string
  protocols?: string
  includeProtocols?: boolean
}

async function requestQuote(quoteParam: QuoteParam, chainId: number) {
  const quoteResp = await requestFrom1Inch(
    'quote',
    quoteParam,
    chainId
  )
  return quoteResp
}

async function requestSwap(
  swapParams: SwapParam,
  chainId: number,
  walletAddress: string
) {
  const swapResp = await requestFrom1Inch('swap', swapParams, chainId)
  const rawTx = swapResp.tx
  const data = iface.encodeFunctionData('callOneInch', [
    swapParams.src,
    swapParams.dst,
    swapParams.amount,
    rawTx.data
  ])
  const finalTx = {
    from: walletAddress,
    to: routerAddr,
    data,
    value: rawTx.value
  }
  return { finalTx, rawTx }
}

async function main() {
  const chainId = Chain.Ethereum
  const nativeToken = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
  const provider = new ethers.JsonRpcProvider(rpcUrls[chainId])
  const walletAddress = '0xbd11861d13cafa8ad6e143da7034f8a907cd47a8' // Your wallet address
  const swapParams = {
    src: nativeToken,
    dst: tokens[chainId].usdt,
    amount: ethers.parseEther('0.001').toString(),
    receiver: walletAddress,
    includeProtocols: true,
    from: routerAddr,
    origin: walletAddress,
    slippage: 1, // Maximum acceptable slippage percentage for the swap (e.g., 1 for 1%)
    includeGas: false,
    disableEstimate: true, // Set to true to disable estimation of swap details
    allowPartialFill: false // Set to true to allow partial filling of the swap order
  }
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    provider
  )

  // const { dstAmount, protocols } = await requestQuote(
  // swapParams,
  // chainId
  // )
  // console.log(JSON.stringify(protocols))
  const { finalTx, rawTx } = await requestSwap(
    swapParams,
    chainId,
    walletAddress
  )
  // console.log(await provider.estimateGas(rawTx))
  // console.log(await provider.estimateGas(finalTx))
  await (await wallet.sendTransaction(finalTx)).wait()
}

main()
