<script>
  import Nav from '../components/Nav.svelte'
  export let segment
  if (segment) {
    // noop
  }
</script>

<Nav />

<main>
  <slot />
</main>
