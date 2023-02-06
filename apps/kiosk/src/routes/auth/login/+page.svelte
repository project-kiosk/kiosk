<script lang="ts">
  import { goto } from "$app/navigation";
  import AccountCheckStep from "$lib/components/Auth/AccountCheckStep.svelte";
  import PassCodeAuthStep from "$lib/components/Auth/PassCodeAuthStep.svelte";
  import RegisterStep from "$lib/components/Auth/RegisterStep.svelte";
  import PageHeader from "$lib/components/Page/PageHeader.svelte";
  import type { User } from "@prisma/client";
  import type { ActionData } from "./$types";

  export let form: ActionData & {
    user: User | null;
    email: string;
    missing: boolean;
  };

  let loading                = false;
  let emailAddress: string | undefined;
  let exists: boolean | null = null;
  let user: User | null      = null;

  $: {
    user         = form ? form.user : user;
    emailAddress = form ? form.email : emailAddress;
    exists       = form ? form.missing !== true : null;
  }

  function finish( requestPassKey: boolean ): Promise<void> {
    const route = requestPassKey ? "/auth/attestation" : "/";

    return goto( route, { invalidateAll: true } );
  }
</script>

<svelte:head>
  <title>Account • Kiosk</title>
</svelte:head>

<PageHeader title="Sign in or create account" />

{#if exists === null}
  <AccountCheckStep
    action="?/requestPassCode"
    emailAddress={emailAddress}
    bind:loading={loading}
  />
{:else if exists === false}
  <RegisterStep
    action="?/requestPassCode"
    emailAddress={emailAddress}
    bind:loading={loading}
  />
{:else}
  <PassCodeAuthStep
    action="?/verifyPassCode"
    requestCodeAction="?/requestPassCode"
    emailAddress={emailAddress}
    bind:loading={loading}
    on:done={finish}
  />
{/if}
