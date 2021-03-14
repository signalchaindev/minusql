// @ts-ignore
import { getContext, setContext } from "svelte"

const CLIENT = typeof Symbol !== "undefined" ? Symbol("client") : "@@client"

export function setClient(client): void {
  setContext(CLIENT, client)
}

function getClient() {
  const client = getContext(CLIENT)
  if (!client) throw new Error("Client has not been set")
  return client
}

export const client = getClient()
