<script lang="ts">
  import type { Book } from "@prisma/client";
  import { Cover } from "@prisma/client";
  import { decode } from "blurhash";
  import { onMount } from "svelte";

  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };

  export let book: Book | Book & { cover: Cover };

  export let size: number = 32;

  let canvas: HTMLCanvasElement;

  async function renderBackground( book: Book | Book & { cover: Cover } ): Promise<void> {
    if ( !( "cover" in book ) ) {
      return;
    }

    const hash = book.cover?.hash;

    if ( typeof hash === "undefined" ) {
      console.warn( "Book has no blurhash: Skipping rendering" );

      return;
    }

    // TODO: Render in web worker, if possible
    const context   = canvas.getContext( "2d" );
    const pixels    = decode( hash, size, size );
    const imageData = new ImageData( pixels, size, size );
    context.putImageData( imageData, 0, 0 );
  }

  onMount( async () => renderBackground( book ) );
</script>

<canvas bind:this={canvas}
        width="{size}px"
        height="{size}px"
        class="{className} dark:opacity-50 bg-white dark:bg-black"></canvas>
