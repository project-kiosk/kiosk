<script lang="ts">

  import { invalidateAll } from "$app/navigation";
  import Icon from "$lib/components/Icon.svelte";
  import { savable } from "$lib/savable";
  import { trpc } from "$lib/trpc/client";
  import { clickOutside } from "$lib/utilities";
  import type { Book } from "@prisma/client";
  import { Editor, Viewer } from "bytemd";
  import { debounce } from "debounce";

  export let book: Book;

  let editing: boolean = false;
  let updated          = book.description;

  async function updateDescription( value: string ): Promise<void> {
    await trpc().books.save.mutate( savable( {
      id: book.id,
      description: value
    } ) );
    await invalidateAll();
    updated = book.description;
  }

  const autoSave = debounce( async function( event: CustomEvent<{ value: string }> ) {
    await updateDescription( event.detail.value );
  }, 2_000 );

  async function closeEditor(): Promise<void> {
    editing = false;

    await updateDescription( updated as string );
  }
</script>

<section class="dark:text-gray-300 group">
  <header class="flex items-center mb-2">
    <h2 class="text-xl font-bold">Description</h2>
    {#if !editing}
      <button title="Edit description"
              class="ml-2 p-2 text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition"
              on:click={() => editing = true}>
        <Icon name="edit" class="text-lg" />
      </button>
    {/if}
  </header>

  {#if editing}
    <div use:clickOutside on:click_outside={closeEditor}>
      <Editor bind:value={updated} on:change={autoSave} />
    </div>
  {:else}
    <Viewer value={book.description} />
  {/if}
</section>
