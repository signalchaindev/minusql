<script context="module">
  export async function preload({ params }) {
    return {
      id: params.slug,
    }
  }
</script>

<script>
  import TodoPage from '../../components/TodoPage.svelte'

  export let id
</script>

<TodoPage {id} />
