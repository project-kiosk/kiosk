<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Icon from "$lib/components/Icon.svelte";
  import Book from "$lib/components/Links/Book.svelte";
  import type { EntitySearchResult } from "$lib/knowledge-graph/client";
  import { savable } from "$lib/savable";
  import { trpc } from "$lib/trpc/client";
  import type { Author } from "@prisma/client";
  import type { PageData } from "./$types";

  export let data: PageData & { author: Author & { books: Book[] } };

  let authorInfoLoading: boolean = false;

  async function fetchAuthorInfo(): Promise<void> {
    authorInfoLoading = true;
    let suggestions: EntitySearchResult[];

    try {
      suggestions = await trpc().authors.fetchInfo.query( data.author.name );
    } finally {
      authorInfoLoading = false;
    }

    if ( suggestions.length < 1 ) {
      return;
    }

    suggestions.sort( ( a, b ) => b.resultScore - b.resultScore );
    const bestMatch = suggestions.shift();

    await trpc().authors.update.mutate( savable( {
      id: data.author.id,
      name: bestMatch.result.name || data.author.name,
      description: bestMatch.result.detailedDescription?.articleBody,
      wikipediaUrl: bestMatch.result.detailedDescription?.url,
      pictureUrl: bestMatch.result.image?.contentUrl
    } ) );

    await invalidateAll();
  }
</script>

<div class="flex max-w-6xl mx-auto w-full py-16 px-8">
  <article class="flex-grow">
    <header class="mb-8 flex items-center">
      <img src={data.author.pictureUrl}
           class="w-32 h-32 rounded-full bg-gray-200 mr-4 flex-shrink-0 object-cover"
           alt="Picture of {data.author.name}">
      <div class="flex flex-col">
        <h1 class="text-4xl font-bold">{data.author.name}</h1>

        {#if data.author.description}
          <p class="mt-4">
            <span>{data.author.description}</span>
            {#if data.author.wikipediaUrl}
              <a target="_blank"
                 href={data.author.wikipediaUrl}
                 rel="noopener noreferrer"
                 class="text-blue-500 underline">Wikipedia</a>
            {/if}
          </p>
        {:else}
          <div class="text-sm text-blue-500 flex items-center justify-start mt-1 cursor-pointer select-none"
               on:click={fetchAuthorInfo}>
            <div class="mr-1">
              {#if authorInfoLoading}
                <Icon name="sync" class="text-lg" />
              {:else}
                <Icon name="lightbulb" class="text-lg" />
              {/if}
            </div>

            <span class="text-blue-500 underline">
              It seems like there is no information available on this author yet.
              Search the web
            </span>
          </div>
        {/if}
      </div>
    </header>

    <section>
      <header class="mb-4">
        <h2 class="text-2xl">Works</h2>
      </header>

      <ul class="grid grid-cols-2 xl:grid-cols-6 md:grid-cols-4 gap-8">
        {#each data.author.books as book}
          <li class="contents">
            <Book book={book} />
          </li>
        {/each}
      </ul>
    </section>
  </article>
</div>
