<script lang="ts">
  import { deserialize } from "$app/forms";
  import { invalidateAll } from "$app/navigation";
  import Button from "$lib/components/Form/Button.svelte";
  // noinspection TypeScriptCheckImport
  import type { PassCodeChangeEvent } from "$lib/components/PassCode/PassCodeInput.svelte.ts";
  import PassCodeInput from "$lib/components/PassCode/PassCodeInput.svelte";
  import { createEventDispatcher } from "svelte";

  export let loading: boolean = false;
  export let emailAddress: string;
  export let action: string;
  export let requestCodeAction: string;

  let form: HTMLFormElement;
  let error: string | undefined;
  let info: string | undefined;

  const dispatch = createEventDispatcher<{ done: { requestPassKey: boolean } }>();

  async function verifyPassCode( event: PassCodeChangeEvent ): Promise<void> {
    const { passCode } = event.detail;
    loading            = true;

    try {
      const body = new FormData();
      body.append( "emailAddress", emailAddress as string );
      body.append( "passCode", passCode );

      const response = await fetch( form.action, { method: "POST", body } );
      const result   = deserialize( await response.text() );

      if ( result.type === "error" ) {
        error = result.error.message;

        return;
      }

      let requestPassKey: boolean = false;

      if ( result.type === "success" ) {
        requestPassKey = result.data.requestPassKey;
      }

      error = undefined;
      await invalidateAll();

      dispatch( "done", { requestPassKey } );
    } catch ( error ) {
      console.error( error );

      return;
    } finally {
      loading = false;
    }
  }

  async function requestPassCode(): Promise<void> {
    loading = true;

    try {
      const body = new FormData();
      body.append( "emailAddress", emailAddress as string );

      const response = await fetch( requestCodeAction, { method: "POST", body } );
      const result   = deserialize( await response.text() );

      // TODO: Show hint
      info = "A new pass code has been sent.";
    } catch ( error ) {
      console.error( error );

      // TODO: Show error
    } finally {
      loading = false;
    }
  }
</script>

<form method="POST" action={action} class="flex flex-col max-w-md" bind:this={form}>
  <p class="block mb-8">
    Please enter the passcode that was sent to "{emailAddress}"!
  </p>

  {#if error}
    <span class="block p-2 mb-8 bg-red-500 text-white rounded">{error}</span>
  {:else if info}
    <span class="block p-2 mb-8 bg-green-500 text-white rounded">{info}</span>
  {/if}

  <PassCodeInput on:input={verifyPassCode} disabled={loading} />

  <button type="button" class="underline mr-auto mt-8" on:click={requestPassCode}>
    Send new code
  </button>
</form>
