<script>
  export let status
  console.error("Status:", status)
  export let error
  console.error("Error:", error)

  const formattedError = []

  const splitByLine =
    (error && error.stack && [...error.stack.split("at ")]) || null

  if (splitByLine && splitByLine.length !== 0) {
    splitByLine.forEach((line, i) => {
      const removedNewLine = line.replace(/\n/g, "")

      if (i === 0) {
        return
      }

      const splitBySlash = removedNewLine.split("\\")
      const getFileName = splitBySlash.splice(-1)[0]

      const lineOne = splitBySlash.join("/").split("(")

      if (lineOne.length > 1) {
        // prettier-ignore
        formattedError.push(`<p><span style="background: rgba(255, 255, 158, 0.7);">${lineOne[0]}</span><span>${lineOne[1]}</span><span>/</span><span style="background: rgba(255, 255, 158, 0.7);">${getFileName.split(")")[0]}</span></p>`)
        return
      }

      // prettier-ignore
      formattedError.push(`<p><span>${splitBySlash.join("/")}</span><span>/</span><span style="background: rgba(255, 255, 158, 0.7);">${getFileName.split(")")[0]}</span></p>`)
    })
  }

  const dev = process.env.NODE_ENV === "development"
</script>

<svelte:head>
  <title>{status}</title>
</svelte:head>

<section>
  <style>
    p {
      font-size: 14px;
      line-height: 1.75;
    }
  </style>
  <h1>{status}</h1>

  <p>
    <span
      style={error.message !== "Not found" &&
        "background: rgba(255, 255, 158, 0.7);"}
    >
      {error.message}
    </span>
  </p>

  {#if dev && error.stack}
    <pre>
      {@html formattedError.join("")}
    </pre>
  {/if}
</section>

<style>
  section {
    margin-top: var(--sp12);
    min-height: calc(100vh - var(--hh-nav-height) + 8px);
  }

  h1,
  p {
    margin: 0 auto;
  }

  h1 {
    font-size: 4em;
    font-weight: 700;
    margin: 0 0 0.5em 0;
  }

  p {
    margin: 1em auto;
    margin: 0;
  }

  pre {
    background: var(--white);
    box-shadow: none;
    padding: 0;
  }
</style>
