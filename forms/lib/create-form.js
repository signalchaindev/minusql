import { writable } from "svelte/store"
import { util } from "./util.js"

const IS_TOUCHED = true

function isCheckbox(element) {
  return element.getAttribute && element.getAttribute("type") === "checkbox"
}

export function createForm(config) {
  const initialValues = config.initialValues || {}

  const onSubmit = config.onSubmit

  const getInitial = {
    values: () => util.cloneDeep(initialValues),
    errors: () => util.assignDeep({}, ""),
    touched: () => util.assignDeep(initialValues, !IS_TOUCHED),
  }

  const form = writable(getInitial.values())
  const errors = writable(getInitial.errors())
  const touched = writable(getInitial.touched())

  const isSubmitting = writable(false)
  const isValidating = writable(false)

  function handleChange(event) {
    const element = event.target
    const field = element.name || element.id
    const value = isCheckbox(element) ? element.checked : element.value
    updateTouched(field, true)
    return updateField(field, value)
  }

  function handleSubmit(event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    isSubmitting.set(true)

    return util.subscribeOnce(form).then(values => {
      if (typeof validateFunction === "function") {
        isValidating.set(true)

        return Promise.resolve()
          .then(error => {
            if (util.isEmpty(error)) {
              clearErrorsAndSubmit(values)
            } else {
              errors.set(error)
              isSubmitting.set(false)
            }
          })
          .finally(() => isValidating.set(false))
      }

      clearErrorsAndSubmit(values)
    })
  }

  function handleReset() {
    form.set(getInitial.values())
    errors.set(getInitial.errors())
    touched.set(getInitial.touched())
  }

  function clearErrorsAndSubmit(values) {
    return Promise.resolve()
      .then(() => errors.set(getInitial.errors()))
      .then(() => onSubmit(values, form, errors))
      .finally(() => isSubmitting.set(false))
  }

  /**
   * Handler to imperatively update the value of a form field
   */
  function updateField(field, value) {
    util.update(form, field, value)
  }

  /**
   * Handler to imperatively update the touched value of a form field
   */
  function updateTouched(field, value) {
    util.update(touched, field, value)
  }

  return {
    form,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleReset,
  }
}
