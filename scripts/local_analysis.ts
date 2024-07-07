import fs from 'fs'
import { Chain } from '../src/types'
import { rpcUrls } from '../src/constants'

function getMaxInBigIntArrays(arr: bigint[]): bigint {
  return arr.reduce((m, e) => (e > m ? e : m), 0n)
}

async function analysis(localDir: string, topN = 10) {
  const chains = Object.keys(rpcUrls).map(
    (chainStr) => Chain[parseInt(chainStr) as Chain]
  )
  const totalGasUsed: bigint[] = []
  for (const chain of chains) {
    const filename = `${localDir}/${chain}.json`
    if (!fs.existsSync(filename)) {
      console.log(`no file found, skip ${chain}`)
      continue
    }
    const jsonData: Record<string, string> = JSON.parse(
      fs.readFileSync(filename, 'utf-8')
    )
    totalGasUsed.push(
      ...Object.values(jsonData).map((e) => BigInt(e))
    )
  }
  totalGasUsed.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)).reverse()

  // topN
  console.log(
    `txn: ${totalGasUsed.length}, top: ${totalGasUsed[0]}, top5: ${totalGasUsed[5]}, top10: ${totalGasUsed[10]}`
  )
}

analysis('./data')
