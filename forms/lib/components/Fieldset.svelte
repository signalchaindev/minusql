<script>
  // fieldset elements docs:
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset
  export let disabled
  export let id = null
  export let form = null
  export let name = null
</script>

<fieldset {id} {form} {name} {disabled} aria-busy={disabled} {...$$restProps}>
  <slot />
</fieldset>
