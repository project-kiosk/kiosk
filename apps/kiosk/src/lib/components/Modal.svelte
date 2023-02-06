<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { createEventDispatcher, onDestroy } from "svelte";

  export let open: boolean = false;

  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };

  const dispatch = createEventDispatcher<{ "close": {} }>();
  let modal;

  if ( typeof document !== "undefined" && document.activeElement ) {
    onDestroy( () => {
      ( document.activeElement as HTMLElement ).focus();
    } );
  }

  function handleKeydown( event: KeyboardEvent ): void {
    const { key } = event;

    if ( key === "Escape" ) {
      return close();
    }

    if ( key === "Tab" ) {
      // trap focus
      const nodes    = modal.querySelectorAll( "*" );
      const tabbable = Array.from( nodes ).filter( n => n.tabIndex >= 0 );

      let index = tabbable.indexOf( document.activeElement );

      if ( index === -1 && event.shiftKey ) {
        index = 0;
      }

      index += tabbable.length + ( event.shiftKey ? -1 : 1 );
      index %= tabbable.length;

      tabbable[ index ].focus();
      event.preventDefault();
    }
  }

  export function close(): void {
    open = false;
    dispatch( "close" );
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <div class="z-40 fixed top-0 left-0 w-full h-full bg-black/30 dark:bg-white/5 backdrop-blur-2xl backdrop-saturate-200"
       on:click={close}>
  </div>

  <div class="fixed top-0 left-0 w-full h-full pointer-events-none z-[60] flex flex-col justify-center items-center">
    <div class="pointer-events-auto z-50 relative max-w-full h-screen md:py-8">
      <button class="absolute right-0 -top-12 ml-auto w-8 h-8 flex justify-center items-center bg-white/20 dark:bg-black/20 hover:bg-white/40 hover:bg-black/60 transition text-white/80 hover:text-white rounded-full"
              autofocus
              on:click={close}>
        <Icon name="close" weight="500" />
      </button>

      <div class="{className} flex flex-col h-full flex-grow overflow-y-scroll max-h-full max-w-full md:max-w-[90vw] xl:max-w-7xl p-4 md:rounded-xl bg-white dark:bg-gray-900 shadow-xl"
           role="dialog"
           aria-modal="true"
           bind:this={modal}>
        <slot name="header" />
        <slot />
      </div>
    </div>
  </div>
{/if}
