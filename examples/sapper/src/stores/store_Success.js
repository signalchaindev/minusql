import { writable } from "svelte/store"

function successStore() {
  const initialState = ""
  const { subscribe, set, update } = writable(initialState)

  return {
    subscribe,
    set: success => {
      update(() => {
        return success
      })
    },
    clear: () => set(initialState),
  }
}

export const SuccessStore = successStore()
