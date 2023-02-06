<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ click: never }>();

  function handleClick(): void {
    dispatch( "click" );
  }
</script>

<button class="flex items-center justify-center mt-auto p-4 bg-gray-200 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition rounded-md mx-4"
        on:click={handleClick}
        type="button">
  <Icon name="add" class="md:mr-2" />
  <span class="hidden md:inline">Add Book</span>
</button>
