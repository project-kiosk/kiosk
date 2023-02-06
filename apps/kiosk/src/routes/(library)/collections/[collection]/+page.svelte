<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Icon from "$lib/components/Icon.svelte";
  import IconPicker from "$lib/components/IconPicker.svelte";
  import Book from "$lib/components/Links/Book.svelte";
  import { savable } from "$lib/savable";
  import { trpc } from "$lib/trpc/client";
  import type { Collection } from "@prisma/client";
  import type { PageData } from "./$types";
  import Sorting from "./Sorting.svelte";

  export let data: PageData & { collection: Collection & { books: Book[] } };
  let iconPickerOpen: boolean = false;

  function updateSorting( event: CustomEvent<{ field: string }> ) {
    const { field } = event.detail;
    console.log( "Update sorting to", { field } );
  }

  async function updateCollectionIcon( event: CustomEvent<{ value: string }> ) {
    const icon = event.detail.value;

    await trpc().collections.save.mutate( savable( {
      id: data.collection.id,
      icon
    } ) );
    await invalidateAll();
  }
</script>

<article>
  <header class="mb-8 flex items-center justify-between">
    <IconPicker bind:open={iconPickerOpen} on:change={updateCollectionIcon}>
      <div slot="activator">
        <Icon name={data.collection.icon} weight={800} class="rounded-full bg-blue-500 text-white p-4" />
      </div>
    </IconPicker>

    <h1 class="ml-4 text-4xl font-bold">
      <span>{data.collection.name}</span>
    </h1>

    <div class="actions ml-auto">
      <Sorting on:change={updateSorting} />
    </div>
  </header>

  {#if data.collection.books.length > 0}
    <ul class="grid grid-cols-2 xl:grid-cols-6 md:grid-cols-4 gap-8">
      {#each data.collection.books as book}
        <li class="contents">
          <Book book={book} showAuthor />
        </li>
      {/each}
    </ul>
  {:else}
    <div class="empty-state flex flex-col justify-center items-center py-32">
      <h2 class="text-gray-500 text-xl">
        This collection doesn't contain any books yet.
      </h2>
      <p class="mt-2">To add books, click &raquo;Add to collection&laquo; on their detail pages.</p>
    </div>
  {/if}
</article>
