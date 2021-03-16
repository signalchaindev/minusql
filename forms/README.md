# Svelte Forms

Based on svelte-forms-lib

<https://github.com/tjinauyeung/svelte-forms-lib>

[WIP]

```js
const {
  // observables state
  form,
  errors, // candidate for removal
  touched, // candidate for removal
  state, // candidate for removal
  isValid, // candidate for removal
  isSubmitting,
  isValidating, // candidate for removal
  // handlers
  handleBlur, // candidate for removal
  handleChange,
  handleSubmit,
} = createForm({
  initialValues: {
    name: "",
    email: "",
  },
  onSubmit,
})
```
