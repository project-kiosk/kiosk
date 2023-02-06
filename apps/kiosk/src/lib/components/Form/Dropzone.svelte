<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Dropzone from "svelte-file-dropzone";

  let className = "";
  // noinspection ReservedWordAsName
  export { className as class };

  export let accept: string | undefined = undefined;
  export let multiple: boolean          = false;

  let disabled: boolean    = false;
  let draggedOver: boolean = false;

  const dispatch = createEventDispatcher<{ "load": { file: File } }>();

  export let file: File | undefined = undefined;

  function handleFilesSelect( event: DragEvent ): void {
    const { acceptedFiles, fileRejections } = event.detail;

    if ( fileRejections.length > 0 ) {
      const { code, message } = fileRejections[ 0 ].errors[ 0 ];

      // TODO: Show a message to users
      console.error( `Invalid file (${ code }): ${ message }` );
      return;
    }

    if ( acceptedFiles.length > 0 ) {
      file = acceptedFiles[ 0 ];
      dispatch( "load", { file: file as File } );
    }
  }

  function handleDragOver(): void {
    draggedOver = true;
  }

  function handleDragLeave(): void {
    draggedOver = false;
  }
</script>

<div class="{className || ''} dropzone-container flex flex-col flex-grow w-full" class:ghost={draggedOver}>
  <Dropzone
    containerClasses="book-upload-dropzone"
    on:drop={handleFilesSelect}
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    {multiple}
    {disabled}
    {accept}
  >
    <slot name="placeholder">
      <span class="text-gray-500">Drag a file here, or click to select one</span>
    </slot>
  </Dropzone>
</div>

<style lang="postcss">
    .dropzone-container {
        & > :global(.book-upload-dropzone) {
            @apply flex items-center justify-center p-0 rounded-lg h-full bg-white dark:bg-black border-2 border-dashed border-gray-100 dark:border-gray-700;

        }

        &.ghost > :global(.book-upload-dropzone) {
            @apply bg-blue-50 dark:bg-blue-900 border-blue-500;
        }
    }
</style>
