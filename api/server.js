import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import cors from 'cors'
import resolvers from './registerAPI'
import typeDefs from './typeDefs'

const app = express()
const port = 3001
const frontendUrl = 'http://localhost:5000'
const gqlServerEndpoint = 'http://localhost:3001'
const gqlServerPath = '__playground'

const corsOptions = {
  origin: [frontendUrl],
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
Frontend: ${frontendUrl}
Playground: ${gqlServerEndpoint}/${gqlServerPath}`

app.listen({ port }, err => {
  if (err) {
    console.error('🚨  UNABLE TO START: An error occurred on the sapper server')
    console.error(err.stack)
    process.exit(1)
  }
  console.log(startMsg)
})
