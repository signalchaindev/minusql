<script>
  import { gql } from "@signalchain/minusql"
  import { useMutation } from "@signalchain/svelte-minusql"
  import { ErrorStore } from "../stores/store_Errors.js"
  import {
    createForm,
    Form,
    Fieldset,
    Legend,
    Field,
  } from "@signalchain/svelte-forms"

  const context = createForm({
    initialValues: {
      addTodo: "",
    },
    onSubmit,
  })

  const { errors, isSubmitting, handleSubmit } = context

  const CREATE_TODO_MUTATION = gql`
    mutation CREATE_TODO_MUTATION($todo: String!) {
      createTodo(todo: $todo) {
        _id
        todo
        completed
      }
    }
  `

  async function onSubmit(value) {
    console.log("value:", value)
    if (value === "") {
      return
    }
    const [_, error] = await useMutation(CREATE_TODO_MUTATION, {
      variables: {
        todo: value.addTodo,
      },
      appendToCache: "getAllTodos",
    })
    if (error) {
      ErrorStore.set(error)
      $errors = $ErrorStore // eslint-disable-line
    }
  }
</script>

<div>
  <Form on:submit={handleSubmit} class="basic-form" {context}>
    <Fieldset disabled={$isSubmitting}>
      <Legend>Add Todo:</Legend>

      <div class="ct-input">
        <Field name="add todo" class="hide_label" />

        <button class="primary" type="submit">
          {#if $isSubmitting}
            loading...
          {:else}
            +
          {/if}
        </button>
      </div>
    </Fieldset>
  </Form>
</div>

<style>
  div :global(form) {
    max-width: 400px;
    margin: 24px auto;
  }

  .ct-input {
    display: flex;
  }

  .ct-input :global(label) {
    flex-grow: 1;
  }

  button {
    font-size: 24px;
    font-weight: bolder;
    height: 36px;
    width: 24px;
  }
</style>
