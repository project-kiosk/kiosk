<script lang="ts">
  import type { Author } from "@prisma/client";

  export let author: Author;
</script>

<a href="/authors/{author.id}" class="contents">
  <article class="flex items-center">
    <header class="contents">
      <img src="/authors/{author.id}/picture"
           alt="Picture of {author.name}"
           class="w-12 h-12 flex-shrink-0 object-cover rounded-full shadow bg-gray-100">
      <h3 class="ml-4 font-bold text-base">{author.name}</h3>
    </header>
  </article>
</a>
