<script>
  import modifier from '../modifiers/modifiers.js'

  export let modifiers = null
  export let id = null

  const types = {
    id,
    modifiers,
  }
  const mods = modifier($$props, types, ['post_script'])
</script>

<p {...$mods}>
  <small>
    <slot />
  </small>
</p>
