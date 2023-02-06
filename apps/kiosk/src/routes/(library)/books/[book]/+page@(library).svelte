<script lang="ts">
  import { goto } from "$app/navigation";
  import BookCover from "$lib/components/BookCover.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { sticky } from "$lib/utilities";
  import type { Author, Book } from "@prisma/client";
  import { Viewer } from "bytemd";
  import "bytemd/dist/index.css";
  import type { PageData } from "./$types";
  import BlurBackground from "./BlurBackground.svelte";
  import CollectionModal from "./CollectionModal.svelte";
  import Description from "./Description.svelte";
  import DownloadButton from "./DownloadButton.svelte";
  import Meta from "./Meta.svelte";
  import Title from "./Title.svelte";
  import TopLinks from "./TopLinks.svelte";

  export let data: PageData & { book: Book & { author: Author } };

  let collectionModalOpen: boolean = false;
  let showCover: boolean           = false;

  function back(): Promise<void> {
    return goto( "/books" );
  }

  function handleHeaderStuck( event: CustomEvent<{ isStuck: boolean }> ) {
    showCover = event.detail.isStuck;
  }

</script>

<div class="flex flex-col xl:flex-row flex-grow h-full">
  <nav class="relative flex xl:flex-col w-full xl:w-1/5 h-72 xl:h-full flex-shrink-0 items-start justify-between">
    <BlurBackground class="w-full xl:w-1/5 h-72 xl:h-screen absolute   xl:fixed border-b xl:border-b-none flex-shrink-0"
                    book={data.book} />

    <button class="relative xl:sticky xl:top-8 mt-4 xl:mt-8 mx-4 xl:mx-8 xl:mr-auto flex rounded-md items-center text-white dark:text-gray-300 text-xl py-2 pl-3 pr-4 bg-transparent hover:bg-white/10 hover:shadow-lg hover:backdrop-blur hover:backdrop-saturate-200 transition"
            on:click={back}>
      <Icon name="chevron_left" />
      <span class="ml-2">Back</span>
    </button>

    <div class="absolute xl:sticky top-24 mt-4 mb-10 translate-x-1/4 z-10">
      <BookCover book={data.book}
                 class="mt-4 max-w-xs rounded-md shadow-lg xl:shadow-2xl"
                 imageClasses="aspect-[50/81] max-h-72 xl:max-h-full" />
    </div>

    <button class="relative xl:hidden ml-auto mt-4 rounded-md flex items-center text-white dark:text-gray-300 text-xl py-2 pl-3 pr-4 bg-transparent hover:bg-white/10 hover:shadow-lg hover:backdrop-blur hover:backdrop-saturate-200 transition"
            on:click={() => collectionModalOpen = true}>
      <Icon name="library_add" />
      <span class="ml-2">Add to collection</span>
    </button>

    <DownloadButton class="relative xl:sticky mx-4 xl:ml-8 xl:left-8 xl:mr-auto xl:bottom-8 mt-4 xl:mt-auto xl:mb-8"
                    book={data.book} />
  </nav>

  <article class="pb-8 pr-8 w-full min-h-screen max-w-5xl xl:max-w-4xl bg-white dark:bg-gray-900 z-0 border-l dark:border-l-gray-700">
    <header class="bg-white dark:bg-gray-900 sticky top-0 xl:-mt-24 xl:mt-0 xl:pt-8 pl-36 xl:pl-0"
            use:sticky={{ stickToTop: true }} on:stuck={handleHeaderStuck}>
      <TopLinks class="justify-between items-center pt-2 pl-12 text-xl hidden xl:flex" book={data.book} />
      <Title class="pt-10 pl-32 pb-4 mb-8" book={data.book} {showCover} on:collection={() => collectionModalOpen = true} />
    </header>

    <div class="pl-10 xl:pl-32 min-h-fit">
      {#if data.book.description}
        <Description book={data.book} />
      {/if}

      {#if data.book.rights}
        <section class="text-gray-600 text-sm mt-8">
          <Viewer value={data.book.rights} />
        </section>
      {/if}
    </div>

    <footer class="pl-28 mt-12">
      <Meta book={data.book} />
    </footer>
  </article>
</div>

<CollectionModal book={data.book} bind:open={collectionModalOpen} />
