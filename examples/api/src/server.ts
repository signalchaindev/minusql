import path from "path"
import fastify from "fastify"
import cors from "fastify-cors"
import cookieParser from "fastify-cookie"
import compress from "fastify-compress"
import helmet from "fastify-helmet"
import mercurius from "mercurius"
import mongoose from "@signalchain/mongoose"
import jwt from "jsonwebtoken"
import kleur from "kleur"
import dotenv from "dotenv"
import { resolvers } from "@tempo/resolvers.js"
import { typeDefs } from "@tempo/typeDefs.js"
import scalars from "./scalars" // .ts

const envPath = path.join(process.cwd(), ".env")
dotenv.config({ path: envPath })

mongoose
  .connect(<string>process.env.DATABASE_URI, {
    useCreateIndex: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log(kleur.green("Database connected\n")))
  .catch(err => console.error(kleur.red(`\n\nMongoose Error: \n${err}\n\n`)))

const app = fastify()
const dev: boolean = process.env.NODE_ENV === "development"
const port: number = parseInt(<string>process.env.PORT) || 3001
const frontendUrl: string = <string>process.env.FRONTEND_URL
const wwwFrontendUrl: string = <string>process.env.WWW_FRONTEND_URL
const gqlServerEndpoint: string = <string>process.env.GQL_SERVER_ENDPOINT_BASE
const gqlServerPath: string = <string>process.env.GQL_SERVER_PATH

async function start() {
  try {
    app.register(cors, {
      origin: dev
        ? [frontendUrl, "http://localhost:3001", "http://localhost:3002"]
        : [frontendUrl, wwwFrontendUrl],
      credentials: true,
      methods: "GET,POST,PUT,PATCH,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 200,
    })
    app.register(cookieParser)
    app.register(compress)
    app.register(helmet, { contentSecurityPolicy: dev ? false : undefined })
    app.register(mercurius, {
      graphiql: dev && "playground",
      routes: true,
      path: `/${gqlServerPath}`,
      jit: 1,
      schema: typeDefs,
      resolvers: {
        ...resolvers,
        ...scalars,
      },
      context(req, res) {
        const token = req?.cookies?.token
        const user = token
          ? jwt.verify(token, <string>process.env.APP_SECRET)
          : null
        return { req, res, user }
      },
    })

    await app.listen(port)
    const startMsg = `\n🚀 API ready:\nFrontend: ${frontendUrl}\nPlayground: ${gqlServerEndpoint}/${gqlServerPath}`
    console.log(startMsg)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
start()
