<script lang="ts">
  import Dropzone from "$lib/components/Form/Dropzone.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import BookDataForm from "$lib/components/Upload/BookDataForm.svelte";
  import type { FileRequestMessage, FileResponse } from "$lib/workers/epub.worker";
  import type { WebWorker, WorkerMessage } from "$lib/workers/workers";
  import { loadWorker } from "$lib/workers/workers";
  import { onDestroy, onMount } from "svelte";

  export let open: boolean          = false;
  export let file: File | undefined = undefined;

  let worker: WebWorker | undefined;
  let metadata: FileResponse["metadata"] | undefined = undefined;
  let cover: FileResponse["cover"] | undefined       = undefined;
  let loading: boolean                               = false;

  async function processBook(): Promise<void> {
    console.log( "processing book" );
    loading = true;

    if ( !file ) {
      return;
    }

    const payload: Omit<FileRequestMessage["payload"], "content"> = {
      lastModified: new Date( file.lastModified ),
      name: file.name,
      size: file.size,
      type: file.type
    };

    // Safari is unable to transfer streams, despite the standards allowing this
    const content = "safari" in window
                    ? await file.arrayBuffer()
                    : file.stream();

    // noinspection TypeScriptValidateTypes
    return worker?.postMessage( {
      type: "file",
      payload: { ...payload, content }
    } as FileRequestMessage, [ content ] );
  }

  onMount( async () => {
    worker = await loadWorker<WebWorker>( import("$lib/workers/epub.worker?worker") );
    type Message = MessageEvent<WorkerMessage<FileResponse>>;

    worker.onmessage = async ( { data }: Message ) => handleWorkerMessage(
      data.type,
      data.payload
    );
  } );

  onDestroy( () => worker?.terminate() );

  async function handleWorkerMessage( type: string, payload: FileResponse ) {
    switch ( type ) {
      case "file":
        metadata = payload.metadata;
        cover    = payload.cover;
        loading  = false;
        break;

      default:
        console.log( `Unhandled message type ${ type }` );
    }
  }

  function reset(): void {
    file     = undefined;
    metadata = undefined;
    cover    = undefined;
    loading  = false;
    open     = false;
  }

  function close(): void {
    open = false;
  }

  let fileChangeTriggered = false;

  $: if ( !fileChangeTriggered && file && !loading ) {
    fileChangeTriggered = true;
    processBook();
  }
</script>

<Modal bind:open={open}>
  <div slot="header">
    <h1 class="text-4xl font-bold mb-8 md:mb-4 text-black dark:text-gray-300">Add new book</h1>
  </div>

  <div class="flex flex-grow h-full flex-col w-screen min-h-[70vh] md:min-h-[60vh] max-w-full relative">
    {#if !file}
      <Dropzone accept="application/epub+zip" bind:file={file} on:load={processBook}>
        <span slot="placeholder" class="text-gray-500">Drag a book here, or click to select one</span>
      </Dropzone>
    {:else if loading}
      <div class="flex justify-center items-center h-full">
        <span class="text-xl text-gray-500">
          Hang tight, your book is being analyzed…
        </span>
      </div>
    {:else if !loading && metadata}
      <BookDataForm bind:file={file} bind:cover={cover} bind:data={metadata} on:submit={reset} on:cancel={close} />
    {/if}
  </div>
</Modal>
