<script lang="ts">
  import type { Publisher } from "@prisma/client";

  export let publisher: Publisher;
</script>

<a href="/publishers/{publisher.id}" class="contents">
  <article class="flex items-center">
    <header class="contents">
      <img src="/publishers/{publisher.id}/logo"
           alt="Logo of {publisher.name}"
           class="w-12 h-12 object-cover rounded-full shadow bg-gray-100">
      <h3 class="ml-4 font-bold text-base">{publisher.name}</h3>
    </header>
  </article>
</a>
