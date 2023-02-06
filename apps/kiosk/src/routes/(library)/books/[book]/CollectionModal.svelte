<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Icon from "$lib/components/Icon.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { savable } from "$lib/savable";
  import { trpc } from "$lib/trpc/client";
  import type { Book, Collection } from "@prisma/client";

  export let open: boolean      = false;
  export let loading: boolean   = false;
  export let book: Book;
  let collections: Collection[] = [];

  async function loadCollections(): Promise<Collection[]> {
    loading = true;

    try {
      collections = await trpc().collections.list.query();
    } finally {
      loading = false;
    }
  }

  $: if ( open ) {
    loadCollections();
  }

  function addToCollection( { id }: Collection ) {
    return async () => {
      loading = true;

      try {
        await trpc().collections.toggleBook.mutate( savable( {
          collection: id,
          book: book.id
        } ) );
        await Promise.all( [
          loadCollections(),
          invalidateAll()
        ] );
      } finally {
        loading = false;
      }
    };
  }
</script>

<Modal bind:open={open}>
  <header slot="header" class="mb-4">
    <h2 class="font-bold">Collections</h2>
  </header>

  <ul class="w-96">
    {#each collections as collection}
      <li class="flex items-center justify-between p-2 rounded-md cursor-pointer bg:white hover:bg-gray-100 transition"
          on:click={addToCollection(collection)}>
        <Icon name={collection.icon} class="mr-2" />
        <span class="mr-auto">{collection.name}</span>
        <span class="ml-4">{JSON.stringify( collection._count.books )}</span>
      </li>
    {/each}
  </ul>
</Modal>
