<script>
  export let todo
  $: console.log('todo:', todo)
</script>

<li id={todo.id}>
  <label for="todo_{todo.id}">
    <input id="todo_{todo.id}" type="checkbox" checked={todo.completed} />
  </label>

  <span>{todo.todo}</span>
</li>

<style>
  li {
    display: flex;
    align-items: center;
    line-height: 0px;
  }

  li + li {
    margin-top: 8px;
  }

  label {
    display: block;
  }

  input {
    margin: 0px;
  }

  span {
    margin-left: 8px;
  }
</style>
