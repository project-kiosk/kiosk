<script lang="ts">
  import BookCover from "$lib/components/BookCover.svelte";
  import type { Author, Book } from "@prisma/client";

  export let book: Book | Book & { author: Author };
  export let showAuthor: boolean = false;
</script>

<a href="/books/{book.id}" class="contents">
  <article class="flex flex-col justify-between h-full">
    <header class="contents">
      <BookCover book={book}
                 class="mb-2 hover:scale-[1.02] transition-transform"
                 imageClasses="aspect-[50/81] object-cover shadow-lg" />
      <h3 class="mt-auto font-bold text-base text-black dark:text-gray-200">{book.title}</h3>
    </header>

    {#if showAuthor}
      <a href="/authors/{book.author.id}" title="Books by {book.author.name}">
        <span class="text-sm text-gray-700 dark:text-gray-400">{book.author.name}</span>
      </a>
    {/if}
  </article>
</a>
