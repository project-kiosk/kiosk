<script lang="ts">
  import { createEventDispatcher } from "svelte";

  let className: string;
  export { className as class };

  export let label: string | undefined = undefined;
  export let href: string | undefined  = undefined;
  let tag                              = href ? "a" : "button";
  export let type: "button" | "submit" = "button";
  export let disabled: boolean         = false;
  export let subtle: boolean           = false;
  export let small: boolean            = false;
  export let large: boolean            = false;
  export let icon: boolean             = false;

  const dispatch = createEventDispatcher<{ click: never }>();

  function handleClick(): void {
    dispatch( "click" );
  }

  function handleKeyUp( { key }: KeyboardEvent ): void {
    if ( key !== "Enter" && key !== "Space" ) {
      return;
    }

    dispatch( "click" );
  }
</script>

<svelte:element
  this={tag}
  href={tag === 'a' ? href : undefined}
  type={tag === 'button' ? type : undefined}
  disabled={tag === 'button' ? disabled : undefined}
  class="button {className}"
  class:button--subtle={subtle}
  class:button--small={small}
  class:button--large={large}
  class:button--icon={icon}
  on:click={handleClick}
  on:keyup={handleKeyUp}>
  <div class="flex items-center">
    <slot>{label}</slot>
  </div>
</svelte:element>

<style lang="postcss">
    .button {
        @apply px-4 py-2 text-black dark:text-white font-bold ring-2 ring-gray-200 dark:ring-gray-700 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800 rounded disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-700 dark:disabled:text-gray-500 transition;

        &.button--small {
            @apply px-2 py-1;
        }

        &.button--icon {
            @apply flex flex-grow-0 p-1 my-0 rounded-full justify-center items-center w-8 h-8;
        }

        &.button--subtle {
            @apply bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-800 hover:text-gray-500 dark:hover:text-gray-300 ring-0;
        }
    }
</style>
