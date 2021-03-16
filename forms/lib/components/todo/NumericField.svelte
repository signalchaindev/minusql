<script>
  import { getContext } from "svelte"
  import { FORM } from "./Form.svelte"
  import { formatFieldName } from "./uitls/formatFieldName.js"
  import { ErrorStore } from "../../stores/store_Errors.js"
  import modifier from "../modifiers/modifiers.js"
  import { isEmpty } from "../../utils/isEmpty.js"

  export let modifiers = null
  export let error = ""
  export let hideError = false
  export let name
  export let labelFor = name
  export let labelId = null
  export let id = null
  export let autocomplete = "on"
  export let maxlength = null
  export let minlength = null
  export let placeholder = ""
  export let readonly = null
  export let required = null
  export let spellcheck = true

  const hasErrorProp = Object.keys($$props).includes("error")
  const fieldKey = name && formatFieldName(name)

  const types = {
    error,
    hideError,
    name,
    labelFor,
    labelId,
    id,
    autocomplete,
    maxlength,
    minlength,
    placeholder,
    readonly,
    required,
    spellcheck,
    modifiers,
  }
  let mods = modifier($$props, types)
  $: mods = modifier($$props, types, [
    (error && "input-error") ||
      ($ErrorStore[fieldKey] && "input-error") ||
      null,
  ])

  const {
    class: classes,
    style,
    labelFor: labelForAttr,
    labelIdAttr,
    ...rest
  } = $mods

  const labelAttrs = {
    class: classes,
    style,
    for: labelForAttr,
    id: labelIdAttr,
  }

  const fieldAttrs = Object.fromEntries(
    Object.entries(rest).filter(attr => {
      return attr[0] !== "error" && attr[0] !== "hideError"
    }),
  )

  const { formData } = getContext(FORM)
  $: value = $formData[fieldKey] || ""

  // TODO: Add validation
  $: if (!value.match(/[0-9]*/g)) {
    const fieldError = "This field only accepts numbers"
    console.log("fieldError:", fieldError)
    // $ErrorStore.set(error)
  }

  function onChange() {
    // Only for use with inputs that aren't inside a form
    // Or maybe unnecessary altogether
  }
</script>

<label {...labelAttrs}>
  <span>{name}</span>

  <input
    type="text"
    on:change={onChange}
    {value}
    {...fieldAttrs}
    inputmode="numeric"
    pattern="[0-9]*"
  />

  {#if hasErrorProp && !isEmpty(error)}
    <small class={hideError ? "hide" : null} role="alert">{error}</small>
  {:else if $ErrorStore[fieldKey]}
    <small class={hideError ? "hide" : null} role="alert">
      {$ErrorStore[fieldKey]}
    </small>
  {/if}
</label>
<slot />
