<script lang="ts">
  import type { Author, Book, Publisher } from "@prisma/client";

  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };

  export let book: Book & { author: Author; publisher?: Publisher };
</script>

<nav class={className}>
  <a href="/books/similar?id={book.id}">Similar books</a>
  <a href="/authors/{book.author.id}">Other books by {book.author.name}</a>

  {#if book.publisher}
    <a href="/publishers/{book.publisher.id}">Other books by {book.publisher.name}</a>
  {/if}
</nav>

<style lang="postcss">
    nav {
        @apply opacity-60 hover:opacity-100 transition;
    }

    a {
        @apply underline underline-offset-8 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-gray-100 transition;
    }
</style>
