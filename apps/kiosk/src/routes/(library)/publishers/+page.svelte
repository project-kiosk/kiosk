<script lang="ts">
  import { default as PublisherLink } from "$lib/components/Links/Publisher.svelte";
  import type { Publisher } from "@prisma/client";
  import type { PageData } from "./$types";

  export let data: PageData & { publishers: Publisher[] };
</script>

<article>
  <header class="mb-8">
    <h1 class="text-4xl font-bold">Publishers</h1>
  </header>

  <ul class="grid gap-4 grid-cols-3">
    {#each data.publishers as publisher}
      <PublisherLink {publisher} />
    {/each}
  </ul>
</article>
