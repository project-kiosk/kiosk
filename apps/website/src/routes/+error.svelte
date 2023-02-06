<script lang="ts">
  import { page } from "$app/stores";
</script>

<article class="error p-16">
  <header class="mb-8">
    <h1 class="text-5xl font-bold">An error occurred</h1>
    <span class="text-2xl">{$page.status}: {$page.error.message}</span>
  </header>

  <p>Uh-oh, this shouldn't have happened.</p>
</article>

