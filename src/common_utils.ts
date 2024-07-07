import fs from 'fs'

export function saveLogs(
  filename: string,
  data: Record<string, bigint>
) {
  let jsonData: Record<string, bigint> = {}
  if (fs.existsSync(filename)) {
    jsonData = JSON.parse(fs.readFileSync(filename, 'utf-8'))
  }
  // append to saved files
  Object.assign(jsonData, data)
  fs.writeFileSync(
    filename,
    JSON.stringify(
      jsonData,
      (_, v) => (typeof v === 'bigint' ? v.toString() : v),
      2
    )
  )
}
