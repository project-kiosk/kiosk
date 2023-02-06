<script lang="ts">
  import AutocompleteInput from "$lib/components/Form/AutocompleteInput.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { trpc } from "$lib/trpc/client";
  import type { Author } from "@prisma/client";
  import type { SvelteComponentTyped } from "svelte";

  export let name                      = "author";
  export let label: string | undefined = undefined;
  export let value: string | undefined;
  export let query: string | undefined = undefined;

  let input: SvelteComponentTyped & { updateQuery( term?: string ): void };

  async function fetchSuggestions( term ): Promise<Author> {
    const authors = await trpc().authors.autocomplete.query( term );

    return authors.map( ( { id, name } ) => ( { id, value: name } ) );
  }

  const nameOrderRegex = /([^,]+?)\s*,\s+([^,]+)$/;
  let fixedName: string | undefined;
  let nameFixable: boolean;

  $: nameFixable = nameOrderRegex.test( query || "" );
  $: fixedName = nameFixable
                 ? ( query as string ).replace( nameOrderRegex, "$2 $1" )
                 : undefined;
</script>

<AutocompleteInput {label}
                   {name}
                   bind:value={value}
                   bind:query={query}
                   bind:this={input}
                   suggestions={fetchSuggestions} />
{#if nameFixable}
  <div class="text-xs text-blue-500 flex items-center justify-end pt-1 cursor-pointer select-none"
       on:click={() => input.updateQuery( fixedName )}>
    <Icon name="lightbulb" class="text-sm mr-1" />
    <span class="text-blue-500 underline">Use “{fixedName}” instead</span>
  </div>
{/if}
