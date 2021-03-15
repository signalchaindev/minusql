<script>
  import { onDestroy } from "svelte"
  import { SuccessStore } from "../../stores/store_Success.js"
  import Portal from "./Portal.svelte"

  let status = "CLOSED"
  let successToast
  let closeTimeOut
  let clearMsgTimeOut

  $: if ($SuccessStore && $SuccessStore.alert) openSuccessAlert()

  onDestroy(() => {
    status = "CLOSED"
    SuccessStore.clear()
    clearTimeout(closeTimeOut)
    clearTimeout(clearMsgTimeOut)
  })

  function openSuccessAlert() {
    status = "OPEN"
    clearTimeout(closeTimeOut)
    clearTimeout(clearMsgTimeOut)

    // Set a timeout to close it and clear the errors
    closeTimeOut = setTimeout(() => {
      status = "CLOSED"
    }, 10000)

    clearMsgTimeOut = setTimeout(() => {
      SuccessStore.clear()
    }, 10300)
  }

  function closeSuccessAlert() {
    status = "CLOSED"
    clearTimeout(closeTimeOut)
    clearTimeout(clearMsgTimeOut)
    clearMsgTimeOut = setTimeout(() => {
      SuccessStore.clear()
    }, 300)
  }
</script>

<Portal>
  <div
    bind:this={successToast}
    on:click={closeSuccessAlert}
    class={status === "CLOSED"
      ? "success_toast"
      : "success_toast success_toast_open"}
    role="alert"
  >
    {$SuccessStore && $SuccessStore.alert}
  </div>
</Portal>

<style lang="scss">
  .success_toast {
    --success_toast_top: 0px;
    position: fixed;
    top: -100px;
    left: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: var(--green100);
    border-radius: var(--rad3);
    box-shadow: var(--el1);
    color: var(--green800);
    height: 40px;
    width: 70vw;
    transform: translate3d(-50%, var(--success_toast_top), 0);
    transition: all 300ms ease;
    z-index: 100;
  }

  .success_toast_open {
    --success_toast_top: 125px;
  }
</style>
