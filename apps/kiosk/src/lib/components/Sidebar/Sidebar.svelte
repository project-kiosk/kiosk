<script lang="ts">
  import Field from "$lib/components/Form/Field.svelte";
  import HeaderNavLink from "$lib/components/HeaderNavLink.svelte";
  import AccountPromotionBanner from "$lib/components/Sidebar/AccountPromotionBanner.svelte";
  import AddBookButton from "$lib/components/Sidebar/AddBookButton.svelte";
  import CollectionsList from "$lib/components/Sidebar/CollectionsList.svelte";
  import CurrentUser from "$lib/components/Sidebar/CurrentUser.svelte";
  import Logo from "$lib/components/Sidebar/Logo.svelte";
  import type { Collection } from "@prisma/client";
  import { createEventDispatcher } from "svelte";

  let className: string = "";
  // noinspection ReservedWordAsName
  export { className as class };

  export let collections: Collection[];

  export let isAuthenticated: boolean;
  export let userName: string;
  export let userEmail: string;

  let searchTerm: string = "";

  const dispatch = createEventDispatcher<{ upload: never }>();

  function openUploadModal(): void {
    dispatch( "upload" );
  }
</script>

<nav class="{className} md:min-w-[16rem] border-r dark:border-r-gray-700">
  <div class="flex flex-col h-screen sticky top-0 bg-gradient-to-b md:bg-gradient-to-br from-gray-50 dark:from-black via-gray-100 dark:via-gray-900 to-gray-200 dark:to-gray-800">

    <!-- Logo -->
    <Logo />

    <div class="flex flex-col h-full max-h-full overflow-y-scroll">
      <!-- Search bar -->
      <div class="hidden md:contents">
        <Field class="mx-4" placeholder="Search" type="search" bind:value={searchTerm} />
      </div>

      <!-- Main navigation -->
      <ul class="flex flex-col px-4 md:mt-8 space-y-4">
        <li class="mb-4 md:mb-1 pl-2 border-b md:border-none">
          <span class="hidden md:inline text-gray-600 text-sm font-bold">Library</span>
        </li>

        <HeaderNavLink to="/authors" title="Authors" icon="person" />
        <HeaderNavLink to="/books" title="Books" icon="book" />
        <HeaderNavLink to="/publishers" title="Publishers" icon="domain" />
      </ul>

      <!-- User collections -->
      {#if isAuthenticated}
        <CollectionsList collections={collections} />
      {/if}

      <!-- Navigation actions area -->
      {#if isAuthenticated}
        <AddBookButton on:click={openUploadModal} />
      {:else}
        <AccountPromotionBanner />
      {/if}
    </div>

    <!-- User account area -->
    <div class="flex items-center px-4 py-6">
      {#if isAuthenticated}
        <CurrentUser email={userEmail} name={userName} />
      {/if}
    </div>
  </div>
</nav>
