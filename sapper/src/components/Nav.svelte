<script>
  import { cache } from "svelte-minusql"

  export let nav
</script>

<header>
  <nav>
    <ul>
      {#if nav}
        {#each nav as n}
          <li>
            <a href={n.link} sapper:prefetch>{n.text}</a>
          </li>
        {/each}
      {/if}
    </ul>
  </nav>

  <p>{$cache?.testConnection || "Loading..."}</p>
</header>

<style>
  header {
    position: relative;
    background: #eee;
    font-size: 16px;
    text-transform: uppercase;
  }

  nav {
    display: flex;
    justify-content: center;
  }

  ul {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
  }

  a {
    display: inline-block;
    padding: 16px 12px;
    text-decoration: none;
  }

  a:hover {
    background: #fff;
  }

  p {
    position: absolute;
    top: 50%;
    right: 24px;
    transform: translateY(-50%);
  }
</style>
