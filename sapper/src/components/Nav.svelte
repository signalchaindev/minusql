<script>
  export let nav
</script>

<header>
  <nav>
    <ul>
      {#each nav as n}
        <li>
          <a href={n.link}>{n.text}</a>
        </li>
      {/each}
    </ul>
  </nav>
</header>

<style>
  header {
    background: #eee;
    font-size: 16px;
    text-transform: uppercase;
  }

  a {
    display: inline-block;
    padding: 16px 12px;
    text-decoration: none;
  }

  a:hover {
    background: #fff;
  }

  ul {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
