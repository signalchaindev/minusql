import { writable } from "svelte/store"

function errorStore() {
  const initialState = {}
  let errors = {}
  const { subscribe, set, update } = writable(initialState)

  return {
    subscribe,

    set(error) {
      error?.name ? console.error(error.name) : console.error("ClientError")
      let errorCollector = error?.message ? error.message : error
      if (errorCollector.constructor === String) {
        if (
          errorCollector === "TypeError: Failed to fetch" ||
          /ECONNREFUSED/gi.test(errorCollector)
        ) {
          console.error(errorCollector)
          errorCollector = {
            alert: "The connection down at the moment! Please try again later.",
          }
        } else {
          console.error(`Error: ${error}`)
          errorCollector = {
            alert: `${errorCollector}`,
          }
        }
      }
      if (errorCollector.constructor === Object) {
        for (const val of Object.values(errorCollector)) {
          console.error(`Error: ${val}`)
        }
      } else {
        console.error(`Error: ${error}`)
      }
      errors = errorCollector
      return set(errors)
    },

    clearAlert() {
      update(() => {
        delete errors.alert
        return errors
      })
    },

    clearErrors() {
      return set(initialState)
    },
  }
}

export const ErrorStore = errorStore()
