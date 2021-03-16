<script>
  export let level = "3"
</script>

<legend {...$$restProps}>
  {#if level === "2"}
    <h2>
      <slot />
    </h2>
  {:else if level === "3"}
    <h3>
      <slot />
    </h3>
  {:else if level === "4"}
    <h4>
      <slot />
    </h4>
  {:else}
    <slot />
  {/if}
</legend>
