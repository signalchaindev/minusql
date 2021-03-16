<script>
  import { getContext } from "svelte"
  import { key } from "./key.js"
  import { formatFieldName } from "../utils/formatFieldName.js"

  const { form, errors, handleChange } = getContext(key)

  export let id
  export let name
  export let label
  export let checked = $form[name] || false
  // There is a difference between value and checked
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox#value
  export let value = null
  export let readonly = false

  const hasCustomCheckbox = $$slots && Object.keys($$slots).length > 0
  let rootClass
  $: rootClass = $errors[name]
    ? `checkbox-label ${$$props.class} input-error`
    : `checkbox-label ${$$props.class}`

  label = label || name
  name = formatFieldName(name)
  id = $$props.for || id || formatFieldName(name)
</script>

<label for={$$props.for || id} class={rootClass}>
  {#if hasCustomCheckbox}
    <button
      type="button"
      on:click={() => ($form[name] = !$form[name])}
      aria-hidden
      tabindex="-1"
    >
      <slot />
    </button>
    <input
      type="checkbox"
      on:change={handleChange}
      {checked}
      {id}
      {readonly}
      {name}
      {value}
      style="border: 0; clip: rect(0 0 0 0); height: 1px; width: 1px; margin: -1px; padding: 0; overflow: hidden; position: absolute; white-space: nowrap; word-wrap: normal;"
    />
  {:else}
    <input
      on:change={handleChange}
      type="checkbox"
      {id}
      {checked}
      {readonly}
      {name}
      {value}
    />
  {/if}

  <span>{label}</span>
</label>

{#if $errors[name]}
  <small>{$errors[name]}</small>
{/if}

<style>
  button {
    outline: none;
    background: none;
    border: none;
    line-height: 0;
    z-index: -1;
  }
</style>
