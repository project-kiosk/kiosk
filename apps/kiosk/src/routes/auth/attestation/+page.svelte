<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/Form/Button.svelte";
  import PageHeader from "$lib/components/Page/PageHeader.svelte";
  import { browserSupportsWebAuthn, startRegistration } from "@simplewebauthn/browser";
  import type { RegistrationCredentialJSON } from "@simplewebauthn/typescript-types";
  import { onMount } from "svelte";

  let webAuthnSupported: boolean = true;
  let registered: boolean        = false;

  onMount( () => webAuthnSupported = browserSupportsWebAuthn() );

  async function init(): Promise<void> {
    const attestationResponse = await fetch( "/auth/attestation/generate" );
    let attestationData: RegistrationCredentialJSON;

    try {
      const options = await attestationResponse.json();

      // Require a resident key for this demo
      options.authenticatorSelection.residentKey        = "required";
      options.authenticatorSelection.requireResidentKey = true;
      options.extensions                                = { credProps: true };

      // hideAuthForm();

      attestationData = await startRegistration( options );
    } catch ( error ) {
      if ( error.name === "InvalidStateError" ) {
        console.error( "Error: Authenticator was probably already registered by user" );
      } else {
        console.error( error );
      }

      throw error;
    }

    const verificationResponse = await fetch( "/auth/attestation/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify( attestationData )
    } );

    const verificationJSON = await verificationResponse.json();

    if ( !( verificationJSON && verificationJSON.verified ) ) {
      console.error( `Oh no, something went wrong! Response:`, verificationJSON );
    }

    registered = true;

    return goto( "/" );
  }

  function skip(): Promise<void> {
    return goto( "/" );
  }
</script>

<PageHeader title="Add a passkey" />

{#if !webAuthnSupported}
  <span>Your internet browser does not support Passkeys :(</span>
{/if}

{#if !registered}
  <p class="mb-4 max-w-lg text-gray-500">
    To sign you in automatically and securely next time, create a passkey by
    clicking the button below.
  </p>
  <div class="flex items-center">
    <Button label="Create Passkey" on:click={init} />
    <Button label="Skip for now" class="button--subtle ml-4" on:click={skip} />
  </div>
{:else}
  <span>You're all set.</span>
{/if}
