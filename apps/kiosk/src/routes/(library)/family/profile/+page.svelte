<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Button from "$lib/components/Form/Button.svelte";
  import Field from "$lib/components/Form/Field.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import dayjs from "$lib/dayjs.js";
  import { savable } from "$lib/savable";
  import { trpc } from "$lib/trpc/client";
  import braveLogo from "@browser-logos/brave/brave.svg";
  import chromeLogo from "@browser-logos/chrome/chrome.svg";
  import chromiumLogo from "@browser-logos/chromium/chromium.svg";
  import edgeLogo from "@browser-logos/edge/edge.svg";
  import firefoxLogo from "@browser-logos/firefox/firefox.svg";
  import safariMobileLogo from "@browser-logos/safari-ios/safari-ios.svg";
  import safariLogo from "@browser-logos/safari/safari.png";
  import silkLogo from "@browser-logos/silk/silk.png";
  import webkitLogo from "@browser-logos/webkit/webkit.svg";
  import yandexLogo from "@browser-logos/yandex/yandex.png";
  import type { Authenticator, User } from "@prisma/client";
  import Gravatar from "svelte-gravatar";
  import type { PageData } from "./$types";
  import ProfileSection from "./ProfileSection.svelte";

  export let data: PageData & { user: User & { authenticators: Authenticator[] } };

  let loading: boolean            = false;
  let updatedName: string         = data.user.name || "";
  let updatedEmailAddress: string = data.user.email;

  async function updateName() {
    loading = true;

    try {
      await trpc().users.updateCurrent.mutate( savable( { name: updatedName } ) );
      await invalidateAll();
    } finally {
      loading = false;
    }
  }

  async function updateEmailAddress() {
    loading = true;

    try {
      await trpc().users.updateCurrent.mutate( savable( { email: updatedEmailAddress } ) );
      await invalidateAll();
    } finally {
      loading = false;
    }
  }

  function removeAuthenticator( authenticator: Authenticator ) {
    return async () => {
      loading = true;

      try {
        await trpc().users.removeAuthenticator.mutate( authenticator.id );
        await invalidateAll();
      } finally {
        loading = false;
      }
    };
  }

  function icon( authenticator: Authenticator ) {
    switch ( authenticator.agent?.toLowerCase() ) {
      case "kindle":
      case "silk":
        return silkLogo;
      case "mobile safari":
        return safariMobileLogo;
      case "safari":
        return safariLogo;
      case "chrome":
        return chromeLogo;
      case "chromium":
        return chromiumLogo;
      case "edge":
        return edgeLogo;
      case "yandex":
        return yandexLogo;
      case "brave":
        return braveLogo;
      case "firefox":
        return firefoxLogo;

      default:
        return webkitLogo;
    }
  }
</script>

<article>
  <header class="flex flex-col items-center justify-center">
    <Gravatar size={200} email={data.user.email} class="rounded-full overflow-hidden" />
    <h1 class="text-4xl font-bold mt-8 ml-4 flex items-center">
      {data.user.name}
    </h1>
  </header>

  <ProfileSection title="About you">
    <p slot="help">
      This is your profile information.
    </p>

    <Field bind:value={updatedName}
           autocomplete="name"
           label="Name"
           name="name"
           type="text"
           appendIcon="face" />

    <Button label="Update" disabled={updatedName === data.user.name} on:click={updateName} />
  </ProfileSection>

  <ProfileSection title="Your Email Address">
    <p slot="help">
      The email address you used to create the account.<br>
      We use this information to sign you in securely, and help you get access
      to your account in case you lose access to all registered authenticators.
    </p>

    <Field label="Email Address"
           name="emailAddress"
           bind:value={updatedEmailAddress}
           type="email"
           appendIcon="email" />

    <p class="text-sm text-gray-500 mt-2 mb-4">
      We will send a confirmation email to the new address.
    </p>

    <Button label="Update" disabled={updatedEmailAddress === data.user.email} on:click={updateEmailAddress} />
  </ProfileSection>

  <ProfileSection title="Your Passkeys">
    <p slot="help">
      These are the passkeys you have previously registered.<br>
      Passkeys give you a simple and secure way to sign in without passwords
      by relying on methods like Face ID or Touch ID on Apple devices, or
      Hello on Windows to identify you when you sign in to supporting websites
      and apps.
    </p>

    <ul class="divide-y divide-gray-200 dark:divide-gray-800 mt-8 md:-mt-2">
      {#each data.user.authenticators as authenticator}
        <li class="flex items-center py-2">
          <img class="w-8" src={icon( authenticator )} alt="Logo of the browser used to set up the authenticator">

          <div class="lg:contents flex flex-col">
            <strong class="ml-2 font-bold">{authenticator.handle}</strong>
            <time class="ml-2 text-gray-500" datetime="{authenticator.updatedAt.toISOString()}">
              last used {dayjs( authenticator.updatedAt ).fromNow()}
            </time>
          </div>

          {#if data.user.authenticators.length > 1}
            <Button subtle small class="ml-auto leading-none"
                    on:click={removeAuthenticator(authenticator)}
                    disabled={loading}>
              <Icon name="delete_forever" class="text-2xl" />
            </Button>
          {/if}
        </li>
      {/each}
    </ul>
  </ProfileSection>

  <div class="block md:hidden mt-8">
    <Button class="w-full">
      <div class="mx-auto flex items-center">
        <Icon name="logout" class="mr-2" />
        <span>Sign out</span>
      </div>
    </Button>
  </div>
</article>
