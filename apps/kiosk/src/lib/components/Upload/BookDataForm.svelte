<script lang="ts">
  import type { SubmitFunction } from "$app/forms";
  import { enhance } from "$app/forms";
  import AuthorInput from "$lib/components/Form/AuthorInput.svelte";
  import Button from "$lib/components/Form/Button.svelte";
  import Field from "$lib/components/Form/Field.svelte";
  import ImageInput from "$lib/components/Form/ImageInput.svelte";
  import PublisherInput from "$lib/components/Form/PublisherInput.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { encodeImageToBlurHash } from "$lib/utilities";
  import type { FileResponse } from "$lib/workers/epub.worker";
  import type { BlurhashRequest, BlurhashResponse } from "$lib/workers/image.worker";
  import { workerOperation } from "$lib/workers/workers";
  import { Editor } from "bytemd";
  import "bytemd/dist/index.css";
  import { createEventDispatcher, tick } from "svelte";
  import Turndown from "turndown";

  export let file: File;
  export let cover: File | undefined;
  export let data: FileResponse["metadata"];

  let loading: boolean = false;
  let fileInput: HTMLInputElement;

  type KnownProperty = keyof typeof data;
  type MetadataEntries = [ KnownProperty, string ][];
  let author: string;
  let authorName: string;
  let description: string;
  let doi: string;
  let isbn: string;
  let jdcn: string;
  let language: string;
  let publisher: string;
  let publisherName: string;
  let publishingDate: Date;
  let rights: string;
  let title: string;
  let uuid: string;
  let metadata: [ string, string ][]  = [];
  let coverFile: File | undefined     = undefined;
  let coverHash: string | undefined   = undefined;
  let coverWidth: number | undefined  = undefined;
  let coverHeight: number | undefined = undefined;

  const turndown = new Turndown();

  const dispatch = createEventDispatcher<{
    submit: never,
    cancel: never
  }>();

  function removeMetaProperty<A extends MetadataEntries, K extends A[number][0], T extends K>(
    data: A,
    property: T
  ) {
    type NotT<E extends [ K ]> = Exclude<typeof E[0], T>;

    return data.filter( ( entry ): entry is [ NotT<typeof entry>, string ] => (
      entry[ 0 ] !== property
    ) );
  }

  async function init(): Promise<void> {

    // Known book metadata properties
    authorName     = data.author;
    description    = parseDescription( data.description );
    doi            = data.doi;
    isbn           = data.isbn;
    jdcn           = data.jdcn;
    language       = data.language;
    publisherName  = data.publisher || "";
    publishingDate = data.date;
    rights         = data.rights || "";
    title          = data.title;
    uuid           = data.uuid;

    const knownProperties: KnownProperty[] = [
      "author",
      "cover",
      "date",
      "description",
      "doi",
      "isbn",
      "jdcn",
      "language",
      "publisher",
      "rights",
      "title",
      "uuid"
    ];

    // ...everything else.
    metadata = Object.entries( data ).filter(
      ( pair ): pair is [ string, string ] => !knownProperties.includes( pair[ 0 ] )
    );

    loading = false;

    // Wait for the image element to be created in the DOM
    await tick();

    if ( !cover ) {
      return;
    }

    const { data: coverBuffer, type, width, height } = cover;

    coverFile   = new File( [ coverBuffer ], "cover", { type } );
    coverHash   = await getCoverHash( coverFile, width, height );
    coverWidth  = width;
    coverHeight = height;
  }

  function parseDescription( description: string | undefined ): string {
    if ( !description ) {
      return "";
    }

    return turndown.turndown( description );
  }

  async function getCoverHash( coverFile: File, width: number, height: number ): Promise<string> {
    const canvasNode = document.createElement( "canvas" );

    // Assigning the proper width is crucial to calculate the right hash
    canvasNode.width  = width;
    canvasNode.height = height;

    // Try to encode the blurhash in a worker thread, if supported
    if ( canvasNode.transferControlToOffscreen ) {
      return encodeBlurhashInWorker(
        await coverFile.arrayBuffer(),
        canvasNode.transferControlToOffscreen()
      );
    }

    return encodeImageToBlurHash( coverFile, canvasNode.getContext( "2d" ) );
  }

  async function encodeBlurhashInWorker(
    data: ArrayBuffer,
    canvas: OffscreenCanvas
  ): Promise<string> {
    const { hash } = await workerOperation<BlurhashRequest, BlurhashResponse>(
      import("$lib/workers/image.worker?worker"),
      "blurhash",
      { data, canvas },
      [ data, canvas ]
    );

    return hash;
  }

  $: if ( file ) {
    init();
  }

  $: if ( file && fileInput ) {
    const container = new DataTransfer();
    container.items.add( file );
    fileInput.files = container.files;
  }

  const submit: SubmitFunction = () => {
    dispatch( "submit" );

    return ( { update } ) => update();
  };

  function cancel() {
    dispatch( "cancel" );
  }
</script>

<form use:enhance={submit} method="POST" action="/books/add">
  <input type="file" class="hidden" name="file" bind:this={fileInput}>

  <div class="flex flex-col md:grid md:grid-cols-5 md:gap-2 metadata">
    <dl class="grid col-span-3 grid-cols-[max-content_auto] gap-2 items-center mb-auto">
      <dt class="mr-2 font-bold">Title</dt>
      <dd>
        <Field name="title" value={title || 'Unknown'} required />
      </dd>

      <dt class="mr-2 font-bold">Author</dt>
      <dd>
        <AuthorInput name="author" bind:value={author} bind:query={authorName} />
        <input type="hidden" name="authorName" value={authorName}>
      </dd>

      <dt class="mr-2 font-bold">Publisher</dt>
      <dd>
        <PublisherInput name="publisher" bind:value={publisher} query={publisherName} />
        <input type="hidden" name="publisherName" value={publisherName}>
      </dd>

      <dt class="mr-2 font-bold">Description</dt>
      <dd>
        <Field name="description">
          <div class="contents" slot="control">
            <input type="hidden" name="description" value={description} />
            <Editor bind:value={description} on:change={(event) => description = event.detail.value} mode="tab" />
          </div>
        </Field>
      </dd>

      <dt class="mr-2 font-bold">Rights</dt>
      <dd>
        <Field name="rights">
          <div class="contents" slot="control">
            <input type="hidden" name="rights" value={rights} />
            <Editor bind:value={rights} on:change={(event) => rights = event.detail.value} mode="tab" />
          </div>
        </Field>
      </dd>

      <dt class="mr-2 font-bold">Publishing Date</dt>
      <dd>
        <Field type="date"
               name="publishingDate"
               value={publishingDate?.toISOString() || ''} />
      </dd>

      <dt class="mr-2 font-bold">Language</dt>
      <dd>
        <Field name="language" value={language || 'en'} />
      </dd>

      <dt class="mr-2 font-bold">ISBN</dt>
      <dd>
        <Field name="isbn" value={isbn || ''} />
      </dd>

      {#each metadata as [ property, value ]}
        <dt class="mr-2 font-bold">{property}</dt>
        <dd class="flex items-center">
          <Field class="flex-grow" name="metadata[{property}]" value={value || ''}>
            <Button subtle icon class="ml-2 order-3"
                    on:click={() => metadata = removeMetaProperty(metadata, property)}>
              <Icon name="do_not_disturb_on" />
            </Button>
          </Field>
        </dd>
      {/each}
    </dl>

    <div class="mt-8 md:mt-0 md:col-span-2">
      <input type="hidden" name="coverHash" value={coverHash} />
      <input type="hidden" name="coverWidth" value={coverWidth} />
      <input type="hidden" name="coverHeight" value={coverHeight} />
      <ImageInput name="cover" label="Cover" accept="*/*" bind:value={coverFile} />
    </div>
  </div>

  <footer class="sticky md:static -bottom-4 md:bottom-0 bg-white dark:bg-gray-900 w-full  pb-8 md:pb-0 pt-8 mt-8 flex items-center">
    <Button label="Add to library" disabled={loading} type="submit" />
    <Button label="Cancel" disabled={loading} class="button--subtle ml-4" on:click={cancel} />
  </footer>
</form>

<style lang="postcss">
</style>
