import * as sapper from "@sapper/app"
import { MinusQL } from "minusql"
import { setClient } from "svelte-minusql"

const endpoint = `${process.env.GQL_SERVER_ENDPOINT_BASE}/${process.env.GQL_SERVER_PATH}`
const client = new MinusQL({ uri: endpoint })
setClient(client)

sapper
  .start({
    target: document.body,
  })
  .then(() => {
    document.body.setAttribute("hydrated", "")
  })
