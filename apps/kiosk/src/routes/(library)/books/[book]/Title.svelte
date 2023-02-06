<script lang="ts">
  import BookCover from "$lib/components/BookCover.svelte";
  import Button from "$lib/components/Form/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import StarRating from "$lib/components/StarRating.svelte";
  import { savable } from "$lib/savable";
  import { trpc } from "$lib/trpc/client";
  import type { Author, Book, Publisher } from "@prisma/client";
  import { createEventDispatcher } from "svelte";

  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };

  export let book: Book & { author: Author; publisher?: Publisher };
  export let showCover: boolean = false;

  let starsUpdating: boolean = false;

  const dispatch = createEventDispatcher<{ collection: never }>();

  async function updateStars( event: CustomEvent<{ value: number }> ) {
    const { value } = event.detail;
    starsUpdating   = true;

    try {
      await trpc().books.save.mutate( savable( {
        id: book.id,
        rating: value
      } as Partial<Book> ) );
    } finally {
      starsUpdating = true;
    }
  }

  function showCollectionModal(): void {
    dispatch( "collection" );
  }
</script>

<div class="{className} flex items-start justify-between md:flex-wrap">
  <BookCover {book}
             class="{showCover ? 'opacity-100' : 'opacity-0'} mr-8 md:hidden rounded-md shadow-lg xl:shadow-2xl"
             imageClasses="aspect-[50/81] max-h-48 xl:max-h-full" />

  <div class="flex flex-col">
    <h1 class="text-5xl font-bold">{book.title}</h1>
    <span class="mt-2 flex items-center text-xl">
      <span class="text-gray-300 hover:underline">by <a href="/authors/{book.author.id}">{book.author.name}</a></span>

      {#if book.publisher?.name}
        <span class="hidden md:inline">
          <span>&nbsp;&middot;&nbsp;</span>
          <span class="text-gray-600 dark:text-gray-400">published by {book.publisher.name}</span>
        </span>
      {/if}
    </span>

    <StarRating disabled={starsUpdating}
                class="mt-2 text-yellow-500 dark:text-yellow-600"
                value={book.rating}
                max="5"
                on:change={updateStars} />
  </div>

  <div class="pt-2 hidden xl:block">
    <Button label="Add to collection" class="button--small" on:click={showCollectionModal}>
      <span class="hidden xl:inline">Add to collection</span>
      <Icon name="library_add" class="xl:hidden" />
    </Button>
  </div>
</div>
