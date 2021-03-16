<script>
  // https://github.com/sveltejs/svelte/issues/3088#issuecomment-505785516
  import { onMount } from "svelte"

  let ref
  let portal

  onMount(() => {
    if (typeof window !== "undefined") {
      portal = document.createElement("div")
      portal.className = "portal"
      document.body.appendChild(portal)
      portal.appendChild(ref)
    }

    return () => {
      if (typeof window !== "undefined") document.body.removeChild(portal)
    }
  })
</script>

<div bind:this={ref}>
  <slot />
</div>
