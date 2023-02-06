<script lang="ts">
  import Button from "$lib/components/Form/Button.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import type { Book } from "@prisma/client";
  import { createEventDispatcher } from "svelte";
  import { createMenu } from "svelte-headlessui";

  const menu = createMenu( { label: "Actions" } );

  export let field: keyof Book = "updatedAt";
  const dispatch               = createEventDispatcher<{
    change: { field: keyof Book }
  }>();

  function onSelect( event: CustomEvent<{ selected: string }> ) {
    const icon: string = event.detail.selected.split( " " ).shift();
    field              = options.find( ( item ) => item.icon === icon )?.field;

    dispatch( "change", { field } );
  }

  const options: { icon: string; field: keyof Book; label: string }[] = [
    { icon: "event", label: `Last Updated`, field: "updatedAt" },
    { icon: "title", label: `Title`, field: "title" },
    { icon: "star", label: `Rating`, field: "rating" },
    { icon: "breaking_news_alt_1", label: `Publishing Date`, field: "publishedAt" },
    { icon: "face", label: `Author`, field: "authorId" }
  ] as const;

  $: fieldLabel = options.find( ( item ) => item.field === field )?.label || "";
</script>

<div class="flex w-full flex-col items-center justify-center">
  <div class="relative text-right">
    <div class="relative inline-block text-left">
      <div use:menu.button on:select={onSelect} class="contents">
        <Button subtle class="!pr-2">
          <span class="mr-2">Sort by: {fieldLabel}</span>
          <Icon name="expand_more" class="text-lg" />
        </Button>
      </div>

      {#if $menu.expanded}
        <div
          use:menu.items
          class="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 dark:divide-gray-800 rounded-md bg-white dark:bg-black shadow-lg ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none"
        >
          {#each options as option}
            <button
              use:menu.item
              class="group flex items-center w-full px-2 py-2 text-sm {$menu.active === option.label ? 'bg-blue-500 text-white' : 'text-gray-900 dark:text-gray-400'}"
            >
              <Icon name={option.icon} class="text-xl mr-2"></Icon>
              <span>{option.label}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
