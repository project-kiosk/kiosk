<script lang="ts" context="module">
  interface Entity
  {
    id: string;
    value: string;
  }
</script>

<script lang="ts">
  import Field from "$lib/components/Form/Field.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { generateRandomString } from "$lib/utilities";
  import { onMount } from "svelte";
  import { createCombobox } from "svelte-headlessui";
  import { debounceTimer } from "svelte-reactive-debounce";
  import Transition from "svelte-transition";

  // noinspection TypeScriptUnresolvedVariable
  type T = $$Generic<Entity> & { id: string; value: string };

  export let value: string | undefined;
  export let query: string | undefined = undefined;
  export let label: string | undefined = undefined;
  export let name: string;
  export let suggestions: ( term: string ) => Promise<T[]>;
  export let debounce: number          = 250;

  export const updateQuery = ( term?: string ): void => {
    query     = term;
    selection = term;
  };

  let items: Partial<T>[]           = [

    // By placing the query in the initial item list, the combobox will be
    // populated when the component is rendered.
    // { id: "__none__", value: query || "" }
  ];
  let loading: boolean              = false;
  let selection: string | undefined = query || "";

  const combobox = createCombobox( { label: name } );

  function inputChange( event: InputEvent ) {
    selection = ( event.target as HTMLInputElement ).value;
  }

  function updateSelection( event: CustomEvent<{ selected?: T }> | InputEvent ): void {
    if ( event.detail ) {
      const { selected } = event.detail;
      selection          = selected?.value;
      value              = selected?.id;
    }
  }

  async function updateSuggestions( term?: string ): Promise<void> {
    if ( !term ) {
      return;
    }

    loading = true;

    try {
      items = await suggestions( term );
    } catch ( error ) {
      console.error( `Failed to fetch suggestions: ${ ( error as Error ).message }` );
    } finally {
      loading = false;
    }
  }

  /**
   * Memorizes the previous filter value to prevent unnecessary search queries
   */
  function applyFilter(): ( filter?: string ) => Promise<void> {
    let previous: string | undefined = undefined;

    return async function applyFilter( filter?: string ): Promise<void> {
      if ( filter && filter !== previous ) {
        await updateSuggestions( filter );

        previous = filter;
      }
    };
  }

  const timer = debounceTimer( debounce );
  const apply = applyFilter();

  // If the debounce timer is up, apply the current filter
  $: if ( $timer.up() ) {
    apply( $combobox.filter );
  }

  // Update the bound query if the selection changes
  $: query = selection;

  // Remove the item ID if a suggestion is modified, thus yielding something new
  $: if ( selection !== $combobox.selected?.value ) {
    value = undefined;
  }

  // If the preloaded value is found in the item list, set its ID immediately
  onMount( async () => {
    if ( query ) {
      await updateSuggestions( query );
      const existing = items.find( ( { value } ) => value === query );

      if ( existing ) {
        value = existing.id;
      }
    }
  } );
</script>

<Field class="relative" {label} bind:value={value}>
  <svelte:fragment slot="control" let:value={current} let:id={id}>
    <input
      on:select={updateSelection}
      on:input={inputChange}
      on:change={inputChange}
      use:combobox.input
      value={selection}
      {id}
    />
  </svelte:fragment>

  <button use:combobox.button
          class="absolute inset-y-0 right-0 h-full flex items-end pb-1 pr-1"
          type="button">
    {#if loading}
      <slot name="loading">
        <Icon class="text-gray-400 text-xl">
          <slot name="loadingIcon">autorenew</slot>
        </Icon>
      </slot>
    {:else}
      <slot name="unfold">
        <Icon class="text-gray-400 text-xl">
          <slot name="unfoldIcon">unfold_more</slot>
        </Icon>
      </slot>
    {/if}
  </button>

  <!--
  <Transition
    on:after-leave={() => combobox.reset()}
    show={$combobox.expanded}
    leave="transition ease-in duration-100"
    leaveFrom="opacity-100"
    leaveTo="opacity-0">
    -->
  {#if $combobox.expanded}
    <ul
      use:combobox.items
      class="absolute z-10 top-full mt-1 max-h-60 w-full overflow-auto rounded-md bg-white/50 dark:bg-black/25 backdrop-blur-2xl backdrop-saturate-200 py-1 text-base shadow-lg focus:outline-none sm:text-sm"
    >
      {#each items as item}
        <li
          class="relative cursor-default select-none py-2 pl-10 pr-4 {$combobox.active?.id === item.id ? 'bg-blue-600/25 backdrop-blur-2xl backdrop-saturate-200 text-white' : 'text-gray-900 dark:text-gray-400'}"
          use:combobox.item={{ value: item }}
        >
          <span class="block truncate {$combobox.selected?.id === item?.id ? 'font-medium' : 'font-normal'}">
            <slot name="item" item={item}>{item?.value}</slot>
          </span>

          {#if $combobox.selected?.id === item?.id}
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 {$combobox.active?.id === item.id ? 'text-white' : 'text-blue-600'}">
              <Icon class="h-5 w-5">
                <slot name="selectionIcon" item={item}>check</slot>
              </Icon>
            </span>
          {/if}
        </li>
      {:else}
        <li class="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 dark:text-gray-300">
          <slot name="noResults" {query}>
            <span class="block truncate font-normal">Nothing found</span>
          </slot>
        </li>
      {/each}
    </ul>
    <!--
  </Transition>
  -->
  {/if}

  <input type="hidden" name={name} value={value ? value : ''}>
</Field>
