<script>
  import { setContext } from "svelte"
  import { key } from "./key.js"

  export let context
  export let method = "POST"

  const {
    form,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleReset,
  } = context

  setContext(key, {
    form,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleReset,
  })
</script>

<form on:submit={handleSubmit} {method} {...$$restProps}>
  <slot />
</form>
