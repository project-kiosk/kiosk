<script lang="ts">
  import Dropzone from "$lib/components/Form/Dropzone.svelte";
  import Field from "$lib/components/Form/Field.svelte";
  import { createEventDispatcher } from "svelte";

  export let name: string;
  export let accept: string | undefined = undefined;
  export let value: File | undefined    = undefined;
  let inputElement: HTMLInputElement;

  const dispatch = createEventDispatcher<{ "load": { file: File } }>();

  $: if ( value && inputElement ) {
    const container = new DataTransfer();
    container.items.add( value );
    inputElement.files = container.files;
  }

  function handleLoad( event: CustomEvent<{ file: File }> ): void {
    dispatch( "load", event.detail );
  }
</script>

<Field>
  <div slot="control" class="contents">
    <input type="file" class="hidden" name={name} bind:this={inputElement}>
    <Dropzone bind:file={value} {accept} on:load={handleLoad}>
      <slot name="placeholder" slot="placeholder" />
    </Dropzone>
  </div>
</Field>
