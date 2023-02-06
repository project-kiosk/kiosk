<script lang="ts">
  import Sidebar from "$lib/components/Sidebar/Sidebar.svelte";
  import UploadModal from "$lib/components/Upload/UploadModal.svelte";
  import type { AuthData } from "../+layout.server";
  import type { LayoutData } from "./$types";
  import type { LibraryData } from "./+layout.server";

  export let data: LayoutData & AuthData & LibraryData;

  let uploadModalOpen: boolean = false;
  let showDragOverlay: boolean = false;
  let file: File | undefined   = undefined;

  function showUploadModal(): void {
    uploadModalOpen = true;
  }

  function handleDragEnter( event: DragEvent ): void {
    event.dataTransfer.dropEffect = "copy";
    showDragOverlay               = true;
  }

  function handleDrop( event: DragEvent ): void {
    showDragOverlay = false;

    if ( event.dataTransfer?.files.length > 0 ) {
      const droppedFile = event.dataTransfer?.files.item( 0 );

      if ( droppedFile.type === "application/epub+zip" ) {
        uploadModalOpen = true;
        file            = droppedFile;
      }
    }
  }

  function handleDragLeave( event: DragEvent & { fromElement: HTMLElement | null } ): void {
    if ( event.fromElement !== null ) {
      return;
    }

    event.stopPropagation();
    showDragOverlay = false;
  }

  function continueDragging( event: DragEvent ): void {
    event.dataTransfer.dropEffect = "copy";
  }
</script>

<svelte:window
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragexit={handleDragLeave}
  on:dragover|preventDefault={continueDragging}
  on:drop|preventDefault={handleDrop}
/>

<main class="bg-white dark:bg-gray-900 text-black dark:text-white"
>
  <div class="flex flex-grow">
    <Sidebar class="md:w-1/5"
             collections={data.collections}
             isAuthenticated={data.isAuthenticated}
             userName={data.user?.name}
             userEmail={data.user?.email}
             on:upload={showUploadModal} />

    <div class="w-5/6">
      <slot />
    </div>
  </div>
</main>

<div id="drag-overlay"
     class="fixed w-full h-full top-0 left-0 flex p-8 bg-blue-500/25 backdrop-blur-xl backdrop-saturate-200 z-50 transition"
     class:opacity-0={!showDragOverlay}
     class:pointer-events-none={!showDragOverlay}
     class:opacity-100={showDragOverlay}>
  <div class="w-full h-full flex justify-center items-center border-4 border-white border-dashed rounded-3xl animate-breathe">
    <span class="text-white text-3xl drop-shadow-md">Drop books here to upload</span>
  </div>
</div>

<UploadModal bind:open={uploadModalOpen} bind:file={file} />
