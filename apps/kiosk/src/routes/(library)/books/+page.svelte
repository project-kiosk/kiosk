<script lang="ts">
  import Field from "$lib/components/Form/Field.svelte";
  import Book from "$lib/components/Links/Book.svelte";
  import type { PageData } from "./$types";

  export let data: PageData & { books: Book[] };

  let searchTerm: string = "";
</script>

<article>
  <header class="pb-8 flex items-center justify-between">
    <h1 class="text-4xl font-bold">Books</h1>

    <div class="actions">
      <Field placeholder="Search" type="search" appendIcon="search" bind:value={searchTerm} />
    </div>
  </header>

  <ul class="grid grid-cols-2 xl:grid-cols-6 md:grid-cols-4 gap-8">
    {#each data.books as book}
      <li class="contents">
        <Book book={book} showAuthor />
      </li>
    {/each}
  </ul>
</article>
