<script lang="ts">
  import Field from "$lib/components/Form/Field.svelte";
  import { savable } from "$lib/savable";
  import { trpc } from "$lib/trpc/client";
  import { clickOutside } from "$lib/utilities";
  import { createEventDispatcher } from "svelte";

  let loading: boolean = false;
  let name: string     = "";

  const dispatch = createEventDispatcher<{ "done": { created: boolean } }>();

  async function create(): Promise<void> {
    loading = true;

    try {
      await trpc().collections.save.mutate( savable( {
        icon: "collections_bookmark",
        name
      } ) );
    } catch ( error ) {
      console.error( "Failed to create collection", error );

      // TODO: Show notification
    } finally {
      loading = false;
    }

    dispatch( "done", { created: true } );
    name = "";
  }

  function cancel(): void {
    dispatch( "done", { created: false } );
    name = "";
  }
</script>

<form on:click_outside={cancel} on:submit={create} use:clickOutside>
  <Field placeholder="Collection Name" bind:value={name} disabled={loading} name="collectionName" autofocus />
</form>
