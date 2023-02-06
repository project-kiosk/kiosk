<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Form/Button.svelte";
  import Field from "$lib/components/Form/Field.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { startAuthentication } from "@simplewebauthn/browser";
  import type {
    AuthenticationCredentialJSON,
    PublicKeyCredentialRequestOptionsJSON
  } from "@simplewebauthn/typescript-types";
  import { onMount } from "svelte";

  export let loading: boolean = false;
  export let emailAddress: string;
  export let action: string;

  let passKeyFailed = false;

  async function init(): Promise<void> {
    const assertionOptions  = await requestAssertion();
    const assertionResponse = await startAuthentication( assertionOptions, true );

    try {
      await verifyAssertion( assertionResponse );
    } catch ( error ) {
      const message = ( error as Error ).message;

      console.error( `Failed to verify assertion: ${ message }`, {
        assertionOptions,
        assertionResponse,
        error
      } );
      passKeyFailed = true;

      return;
    }

    return goto( "/", { invalidateAll: true } );
  }

  async function requestAssertion(): Promise<PublicKeyCredentialRequestOptionsJSON> {
    let assertionOptionsResponse;
    let assertionOptions;
    loading = true;

    try {
      assertionOptionsResponse = await fetch( "/auth/assertion/generate", {
        headers: { accept: "application/json" }
      } );

      assertionOptions = await assertionOptionsResponse.json();
    } catch ( error ) {
      const message = ( error as Error ).message;

      throw new Error( `Failed to generate assertion options: ${ message }` );
    } finally {
      loading = false;
    }

    return assertionOptions;
  }

  async function verifyAssertion( assertion: AuthenticationCredentialJSON ): Promise<void> {
    let verificationResponse: Response;

    try {
      verificationResponse = await fetch( "/auth/assertion/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify( assertion )
      } );
    } finally {
      loading = false;
    }

    const data: { verified: boolean } = await verificationResponse.json();

    if ( !data ) {
      throw new Error( "Verification failed: Unexpected payload: No verification data" );
    }

    if ( !data.verified ) {
      console.error( data );
      throw new Error( "Verification failed: Unexpected state" );
    }
  }

  onMount( () => init() );
</script>

<form method="POST" action={action}>
  {#if passKeyFailed}
    <div class="error max-w-lg mb-8 bg-red-500 text-white rounded py-2 px-4 shadow-md flex items-center">
      <Icon name="sentiment_dissatisfied" class="mr-4" />
      <span>
        Uh-oh, Something went wrong while signing you in. Try again or request a
        passcode while we fix things!
      </span>
    </div>
  {/if}

  <!-- svelte-ignore a11y-autofocus -->
  <Field bind:value={emailAddress}
         label="Email Address"
         class="max-w-lg"
         name="emailAddress"
         placeholder="jane@doe.com"
         autocomplete="email webauthn"
         disabled="{loading}"
         type="email"
         autofocus
         required />

  <input type="hidden" name="register" value={false}>

  <Button label="Continue" class="mt-8" disabled={loading} type="submit" />
</form>
