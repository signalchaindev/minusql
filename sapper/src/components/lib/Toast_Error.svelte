<script>
  import { onDestroy } from "svelte"
  import { ErrorStore } from "../../stores/store_Errors.js"
  import Portal from "./Portal.svelte"

  let status = "CLOSED"
  let errorToast
  let closeTimeOut
  let clearMsgTimeOut

  $: if ($ErrorStore && $ErrorStore.alert) openErrAlert()

  onDestroy(() => {
    status = "CLOSED"
    ErrorStore.clearErrors()
    clearTimeout(closeTimeOut)
    clearTimeout(clearMsgTimeOut)
  })

  function openErrAlert() {
    status = "OPEN"
    clearTimeout(closeTimeOut)
    clearTimeout(clearMsgTimeOut)

    // Set a timeout to close it and clear the errors
    closeTimeOut = setTimeout(() => {
      status = "CLOSED"
    }, 10000)

    clearMsgTimeOut = setTimeout(() => {
      ErrorStore.clearAlert()
    }, 10300)
  }

  function closeErrAlert() {
    status = "CLOSED"
    clearTimeout(closeTimeOut)
    clearTimeout(clearMsgTimeOut)
    clearMsgTimeOut = setTimeout(() => {
      ErrorStore.clearAlert()
    }, 300)
  }
</script>

<Portal>
  <div
    bind:this={errorToast}
    on:click={closeErrAlert}
    class={status === "CLOSED" ? "error_toast" : "error_toast error_toast_open"}
    role="alert"
  >
    {$ErrorStore && $ErrorStore.alert}
  </div>
</Portal>

<style lang="scss">
  .error_toast {
    --error_toast_top: 0px;
    position: fixed;
    top: -100px;
    left: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--red100);
    border-radius: var(--rad3);
    box-shadow: var(--el1);
    color: var(--red800);
    height: 40px;
    width: 70vw;
    transform: translate3d(-50%, var(--error_toast_top), 0);
    transition: all 300ms ease;
    z-index: 100;
  }

  .error_toast_open {
    --error_toast_top: 125px;
  }
</style>
