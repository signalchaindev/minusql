import fs from 'fs'
import path from 'path'
import randomWords from 'random-words'
import { mkdir } from './utils/mkdir.js'
import { rimraf } from './utils/rimraf.js'

export function addBenchMarkFiles(numServices) {
  const benchmarkFilesDir = path.join(process.cwd(), 'src', 'benchmark')

  if (fs.existsSync(benchmarkFilesDir)) {
    rimraf(benchmarkFilesDir)
  }

  if (!fs.existsSync(benchmarkFilesDir)) {
    mkdir(benchmarkFilesDir)
  }

  makeService(benchmarkFilesDir, numServices)
}

function makeService(root, numServices) {
  for (let i = 1; i <= numServices; i++) {
    const random = randomWords(3).join('')

    let collector = []
    let serviceName = ''
    let query = []
    let mutation = []
    let sdl = []

    for (let j = 1; j <= 5; j++) {
      serviceName = random

      const q = {
        fileName: `${random}${j}Query.js`,
        func: `export async function ${random}${j}Query() {\n\treturn "success"\n}\n`,
      }
      query.push(q)

      const m = {
        fileName: `${random}${j}Mutation.js`,
        func: `export async function ${random}${j}Mutation() {\n\treturn "success"\n}\n`,
      }
      mutation.push(m)

      const s = {
        query: `\t${random}${j}Query: String${j !== 5 ? '\n' : ''}`,
        mutation: `\t${random}${j}Mutation: String${j !== 5 ? '\n' : ''}`,
      }
      sdl.push(s)
    }
    collector.push({ serviceName, query, mutation, sdl })

    for (const { serviceName, query, mutation } of collector) {
      const queryPath = path.join(root, serviceName, 'query')
      const mutationPath = path.join(root, serviceName, 'mutation')
      const sdlPath = path.join(root, serviceName, 'schema.graphql')
      mkdir(queryPath)
      mkdir(mutationPath)

      for (const { fileName, func } of query) {
        fs.writeFileSync(path.join(queryPath, fileName), func)
      }

      for (const { fileName, func } of mutation) {
        fs.writeFileSync(path.join(mutationPath, fileName), func)
      }

      let queryCollector = ''
      let mutationCollector = ''

      let i = 1
      for (const { query, mutation } of sdl) {
        queryCollector = queryCollector + query
        mutationCollector = mutationCollector + mutation

        if (i === sdl.length) {
          const sdlContents = `type Query {\n${queryCollector}\n}\n\ntype Mutation {\n${mutationCollector}\n}\n`
          fs.writeFileSync(sdlPath, sdlContents)
        }
        i++
      }
    }

    // reset schema
    collector = []
    serviceName = ''
    query = []
    mutation = []
    sdl = []
  }
}
