<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Icon from "$lib/components/Icon.svelte";
  import { default as AuthorLink } from "$lib/components/Links/Author.svelte";
  import Book from "$lib/components/Links/Book.svelte";
  import type { Result } from "$lib/knowledge-graph/adapter/adapter";
  import { savable } from "$lib/savable";
  import { trpc } from "$lib/trpc/client";
  import type { Author, Publisher } from "@prisma/client";
  import type { PageData } from "./$types";

  export let data: PageData & {
    publisher: Publisher & { books: Book[] };
    authors: Author[];
  };

  let publisherInfoLoading: boolean = false;

  async function fetchPublisherInfo(): Promise<void> {
    publisherInfoLoading = true;
    let suggestions: Result[];

    try {
      suggestions = await trpc().publishers.fetchInfo.query( data.publisher.name );
    } finally {
      publisherInfoLoading = false;
    }

    if ( suggestions.length < 1 ) {
      return;
    }

    const bestMatch = suggestions.shift();

    await trpc().publishers.save.mutate( savable( {
      id: data.publisher.id,
      name: bestMatch.name || data.publisher.name,
      description: bestMatch.detailedDescription || data.publisher.description || undefined,
      wikipediaUrl: bestMatch.url || data.publisher.wikipediaUrl || undefined,
      logoUrl: bestMatch.image || data.publisher.logoUrl || undefined
    } ) );

    await invalidateAll();
  }
</script>

<div class="flex max-w-6xl mx-auto w-full py-16 px-8">
  <article class="flex-grow">
    <header class="mb-8 flex items-center">
      <img src={data.publisher.pictureUrl}
           class="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mr-4 flex-shrink-0 object-cover"
           alt="Picture of {data.publisher.name}">
      <div class="flex flex-col">
        <h1 class="text-4xl font-bold">{data.publisher.name}</h1>

        {#if data.publisher.description}
          <p class="mt-4">
            <span>{data.publisher.description}</span>
            {#if data.publisher.wikipediaUrl}
              <a target="_blank" href={data.publisher.wikipediaUrl} class="text-blue-500 underline">Wikipedia</a>
            {/if}
          </p>
        {:else}
          <div class="text-sm text-blue-500 flex items-center justify-start mt-1 cursor-pointer select-none"
               on:click={fetchPublisherInfo}>
            <div class="mr-1">
              {#if publisherInfoLoading}
                <Icon name="sync" class="text-lg" />
              {:else}
                <Icon name="lightbulb" class="text-lg" />
              {/if}
            </div>

            <span class="text-blue-500 underline">
              It seems like there is no information available on this publisher yet.
              Search the web
            </span>
          </div>
        {/if}
      </div>
    </header>

    <section>
      <header class="mb-4">
        <h2 class="text-2xl">Published Authors</h2>
      </header>

      <ul class="grid gap-4 grid-cols-3">
        {#each data.authors as author}
          <li class="contents">
            <AuthorLink {author} />
          </li>
        {/each}
      </ul>
    </section>

    <section class="mt-8">
      <header class="mb-4">
        <h2 class="text-2xl">Published Works</h2>
      </header>

      <ul class="grid grid-cols-2 xl:grid-cols-6 md:grid-cols-4 gap-8">
        {#each data.publisher.books as book}
          <li class="contents">
            <Book book={book} />
          </li>
        {/each}
      </ul>
    </section>
  </article>
</div>
