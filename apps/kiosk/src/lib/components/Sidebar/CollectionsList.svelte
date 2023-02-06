<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import HeaderNavLink from "$lib/components/HeaderNavLink.svelte";
  import AddCollectionForm from "$lib/components/Sidebar/AddCollectionForm.svelte";
  import type { Collection } from "@prisma/client";

  export let collections: Collection[] = [];
  let adding: boolean                  = false;

  function handleAdd() {
    adding = true;
  }

  async function handleAdded( event: CustomEvent<{ created: boolean }> ): Promise<void> {
    const { created } = event.detail;

    adding = false;

    if ( created ) {
      await invalidateAll();
    }
  }
</script>

<ul class="flex flex-col px-4 mt-4 md:my-8 space-y-4">
  <li class="mb-4 md:mb-1 pl-2 border-b md:border-none">
    <span class="hidden md:inline text-gray-600 text-sm font-bold">Collections</span>
  </li>

  {#each collections as collection}
    <HeaderNavLink
      to="/collections/{collection.id}"
      title={collection.name}
      icon={collection.icon} />
  {/each}

  {#if adding}
    <li class="mb-1 pl-2">
      <AddCollectionForm on:done={handleAdded} />
    </li>
  {/if}

  <HeaderNavLink title="New collection" icon="add" on:click={handleAdd} />
</ul>
