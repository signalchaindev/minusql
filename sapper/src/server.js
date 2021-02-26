import path from "path"
import fastify from "fastify"
import cors from "fastify-cors"
import cookieParser from "fastify-cookie"
import compress from "fastify-compress"
import helmet from "fastify-helmet"
import middie from "middie"
import sirv from "sirv"
import jwt from "jsonwebtoken"
import * as sapper from "@sapper/server"
import dotenv from "dotenv"

const envPath = path.join(process.cwd(), ".env")
dotenv.config({ path: envPath })

const app = fastify()
const dev = process.env.NODE_ENV === "development"
const port = parseInt(process.env.PORT) || 3000
const frontendUrl = process.env.FRONTEND_URL
const wwwFrontendUrl = process.env.WWW_FRONTEND_URL
const gqlServerEndpoint = process.env.GQL_SERVER_ENDPOINT_BASE
const gqlServerPath = process.env.GQL_SERVER_PATH
const sapperMiddleware = sapper.middleware({
  session(req) {
    const token = req?.cookies?.token
    const user = token ? jwt.verify(token, process.env.APP_SECRET) : null
    return { user }
  },
})

async function start() {
  try {
    await app.register(middie)
    app.register(cors, {
      origin: dev
        ? [frontendUrl, "http://localhost:3001", "http://localhost:3002"]
        : [frontendUrl, wwwFrontendUrl],
      credentials: true,
      methods: "GET,POST,PUT,PATCH,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 200,
    })
    app.register(cookieParser, {
      secret: "my-secret", // for cookies signature
      parseOptions: {}, // options for parsing cookies
    })
    app.register(compress)
    app.register(helmet, { contentSecurityPolicy: false })
    // app.register(helmet, {
    //   contentSecurityPolicy: {
    //     directives: {
    //       defaultSrc: ["'self'"],
    //       styleSrc: [
    //         "'self'",
    //         "'unsafe-inline'",
    //         "https://www.youtube-nocookie.com/",
    //       ],
    //       scriptSrc: [
    //         "'self'",
    //         "'unsafe-inline'",
    //         "https://www.youtube-nocookie.com/",
    //       ],
    //       frameSrc: ["https://www.youtube-nocookie.com/"],
    //     },
    //   },
    // })
    app.use(sirv("static", { dev }))

    app.route({
      method: ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"],
      url: "/*",
      handler: async (req, res) => {
        const next = err => {
          if (err) {
            throw err
          } else {
            res.status(404).send()
          }
        }

        req.originalUrl = req.url
        res.end = res.send.bind(res)
        res.setHeader = res.header.bind(res)
        sapperMiddleware(req, res, next)
        return res
      },
    })

    await app.listen(port)
    const startMsg = `\n🚀 Web client ready:\nFrontend: ${frontendUrl}\nPlayground: ${gqlServerEndpoint}/${gqlServerPath}\n`
    console.log(startMsg)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}
start()
