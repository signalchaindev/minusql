<script>
  import { getContext } from "svelte"
  import { key } from "./key.js"
  import { formatFieldName } from "../utils/formatFieldName.js"

  const { form, errors, handleChange } = getContext(key)

  export let id
  export let name
  export let label
  export let autocomplete = "on"
  export let maxlength = null
  export let minlength = null
  export let placeholder = ""
  export let readonly = false
  export let required = false
  export let spellcheck = true
  export let rows = null
  export let columns = null

  let rootClass
  $: rootClass = $errors[name]
    ? `field-label ${$$props.class} input-error`
    : `field-label ${$$props.class}`

  label = label || name
  name = formatFieldName(name)
  id = $$props.for || id || formatFieldName(name)
</script>

<label for={$$props.for || id} class={rootClass}>
  <span>{label}</span>

  <textarea
    on:keyup={handleChange}
    on:blur={handleChange}
    {id}
    {name}
    value={$form[name]}
    {autocomplete}
    {maxlength}
    {minlength}
    {placeholder}
    {readonly}
    {required}
    {spellcheck}
    {rows}
    {columns}
  />
</label>

{#if $errors[name]}
  <small>{$errors[name]}</small>
{/if}
