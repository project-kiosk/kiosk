<script lang="ts">
  import { page } from "$app/stores";
  import Icon from "$lib/components/Icon.svelte";
  import type { Author, Book } from "@prisma/client";

  let className: string = "";
  export { className as class };
  export let book: Book & { author: Author };

  const downloadUrl: string      = `${ $page.url.pathname }/download`;
  const downloadFileName: string = `${ book.title } - ${ book.author.name }.epub`;
</script>

<a class="{className} rounded-md flex items-center text-white dark:text-gray-300 text-xl py-2 pl-3 pr-4 bg-transparent hover:bg-white/10 hover:shadow-lg hover:backdrop-blur hover:backdrop-saturate-200 transition"
   download={downloadFileName}
   href={downloadUrl}>
  <Icon name="download" />
  <span class="ml-2">Download</span>
</a>
