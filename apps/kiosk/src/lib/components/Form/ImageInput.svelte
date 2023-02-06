<script lang="ts">
  import Dropzone from "$lib/components/Form/Dropzone.svelte";
  import Field from "$lib/components/Form/Field.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { getImageDimensions } from "$lib/utilities";

  export let name: string   = "file";
  export let label: string  = "File";
  export let accept: string = "image/*";

  export let value: File | undefined = undefined;

  let previewImage: HTMLImageElement;
  let inputElement: HTMLInputElement;
  let hasPreview: boolean = false;
  let width: number       = 0;
  let height: number      = 0;

  function handle( event: InputEvent ): void {
    const target = event.target as HTMLInputElement;
    const file   = target.files.item( 0 );
    value        = file || undefined;
  }

  $: if ( previewImage ) {
    if ( value instanceof File ) {
      previewImage.src = URL.createObjectURL( value );
      hasPreview       = true;
      getImageDimensions( previewImage.src ).then( ( dimensions ) => {
        width  = dimensions.width;
        height = dimensions.height;
      } );
    } else if ( typeof value === "undefined" ) {
      previewImage.src = "";
      hasPreview       = false;
    }
  }

  // Use the DataTransfer object to update the file in the input element.
  // This usually belongs to the drag-n-drop API, but works here too.
  $: if ( inputElement && value instanceof File ) {
    const container = new DataTransfer();
    container.items.add( value );
    inputElement.files = container.files;
  }

  function clear() {
    value              = undefined;
    inputElement.value = "";
    previewImage.src   = "";
  }
</script>

<Field class="relative" {label}>
  <div slot="control" class="contents">
    <input type="file" {accept} {name} bind:value={value} bind:this={inputElement} class="hidden">

    <Dropzone accept={accept} bind:file={value} class="order-2 mx-2 mb-2">
      <div slot="placeholder" class="w-full">
        {#if !hasPreview}
          <div class="w-full flex justify-center items-center h-24 bg-gray-100 dark:bg-gray-800 rounded-md">
            <Icon name="image" class="text-black dark:text-gray-400" />
          </div>
        {/if}

        <img bind:this={previewImage}
             src=""
             alt="Preview of the selected image"
             class="rounded-md object-scale-down w-full h-auto {hasPreview ? 'block' : 'hidden'}">
      </div>
    </Dropzone>
  </div>

  <div class="append">
    {#if hasPreview}
      <button class="absolute right-4 bottom-4 rounded-full bg-black/20 backdrop-blur-2xl backdrop-saturate-200 text-white h-8 w-8 flex items-center justify-center"
              type="button"
              on:click|stopPropagation|preventDefault={clear}>
        <Icon name="delete_forever" />
      </button>
    {/if}
  </div>

  <span slot="appendLabel">
    {#if hasPreview}
      {width}&thinsp;×&thinsp;{height}
    {/if}
  </span>
</Field>
