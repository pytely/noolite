import { readFileSync } from 'fs'

function loadParams(fileName: string): any {
  const data: string = String(readFileSync(String(fileName),'utf8'))
  return JSON.parse(data)
}

var params = loadParams('./conf/params.json')

export { params }
