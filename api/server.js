import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import cors from 'cors'
import resolvers from './registerAPI'
import typeDefs from './typeDefs'

const app = express()
const port = 3001
const sapperUrl = 'http://localhost:3000'
const svelteUrl = 'http://localhost:5000'
const gqlServerEndpoint = 'http://localhost:3001'
const gqlServerPath = '__playground'

const corsOptions = {
  origin: [sapperUrl, svelteUrl],
  credentials: true,
  methods: 'GET,POST,PUT,PATCH,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 200,
}

app.use(cors(corsOptions))

const graphQLServer = new ApolloServer({
  typeDefs,
  resolvers,
})

graphQLServer.applyMiddleware({
  app,
  path: `/${gqlServerPath}`,
  cors: corsOptions,
})

// Start app
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
const startMsg = `
🚀 API ready:
sapperUrl: ${sapperUrl}
svelteUrl: ${svelteUrl}
Playground: ${gqlServerEndpoint}/${gqlServerPath}`

app.listen({ port }, err => {
  if (err) {
    console.error('🚨  UNABLE TO START: An error occurred on the sapper server')
    console.error(err.stack)
    process.exit(1)
  }
  console.log(startMsg)
})
