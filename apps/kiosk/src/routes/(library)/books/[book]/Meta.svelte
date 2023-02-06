<script lang="ts">
  import { getLanguageByAlpha2Code } from "$lib/language";
  import { humanReadableFileSize } from "$lib/utilities";
  import type { Asset, Author, Book, Publisher } from "@prisma/client";
  import MetaItem from "./MetaItem.svelte";

  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };
  const classes = `${ className }`.trimEnd();

  export let book: Book & { author: Author; publisher?: Publisher, assets: Asset[] };
  let language: string | undefined;

  $: language = ( book && book.language )
                ? getLanguageByAlpha2Code( book?.language )
                : undefined;

  const size = humanReadableFileSize( book.assets.at( 0 ).size );
</script>

<div class={classes}>
  <ul class="flex justify-center items-stretch">
    <MetaItem name="Genre" value="Thriller" />

    {#if book.publishedAt}
      <MetaItem name="Published" value={book.publishedAt?.getUTCFullYear()} />
    {/if}

    {#if book.language}
      <MetaItem name="Language" value={book.language.toUpperCase()}>
        <span slot="secondary">{getLanguageByAlpha2Code( book.language ).name}</span>
      </MetaItem>
    {/if}

    <MetaItem name="Size" value={size} />
  </ul>
</div>
