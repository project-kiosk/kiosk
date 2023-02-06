<script lang="ts">
  import AutocompleteInput from "$lib/components/Form/AutocompleteInput.svelte";
  import { trpc } from "$lib/trpc/client";
  import type { Publisher } from "@prisma/client";

  export let name                      = "publisher";
  export let value: string | undefined;
  export let query: string | undefined = undefined;

  async function fetchSuggestions( term?: string ): Promise<Publisher> {
    const publishers = await trpc().publishers.autocomplete.query( term );

    return publishers.map( ( { id, name } ) => ( { id, value: name } ) );
  }
</script>

<AutocompleteInput name={name} bind:value={value} query={query} suggestions={fetchSuggestions} />
