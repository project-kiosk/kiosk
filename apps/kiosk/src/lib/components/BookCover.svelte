<script lang="ts">
  import type { Book } from "@prisma/client";

  let className = "";
  export { className as class };

  export let imageClasses: string = "";

  export let book: Book;
  export let src: string = `/books/${ book.id }/cover`;
  export let alt: string = `Cover of {book.title}`;
</script>

<div class={className}>
  <img {src} {alt} class="{imageClasses} block m-0 w-full h-auto bg-gray-100 rounded">
</div>

<style lang="postcss">
    div {
        @apply relative;
    }

    div::after {
        @apply absolute block w-full h-full top-0 left-0 z-20 rounded;
        content:    '';
        background: linear-gradient(to right, rgba(60, 13, 20, 0.2) 0.75%, rgba(255, 255, 255, 0.5) 1.25%, rgba(255, 255, 255, 0.25) 1.75%, rgba(255, 255, 255, 0.25) 2.5%, rgba(0, 0, 0, 0.05) 3%, transparent 4%, rgba(255, 255, 255, 0.25) 4.25%, transparent 5.5%);
        /*        background: linear-gradient(to right, transparent 2%, rgba(0, 0, 0, 0.1) 3%, rgba(0, 0, 0, 0.1) 4%, transparent 5%);*/
    }
</style>
