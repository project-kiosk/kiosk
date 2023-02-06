<script lang="ts" context="module">
  type Change = { value: number }
  export type ChangeEvent = CustomEvent<Change>
</script>

<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher<{ change: Change }>();

  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };

  export let value: number;
  export let max: number         = 5;
  export let disabled: boolean   = false;
  export let starClasses: string = "";
  $: starClassName = `${ starClasses } cursor-pointer`;

  let projected: number | undefined = undefined;

  function update( index: number ): void {
    value = index + 1;

    dispatch( "change", { value } );
  }
</script>

<ul class={className}>
  <slot name="before" />

  {#each { length: max } as _, index}
    <button on:mouseover={() => projected = index}
            on:focus={() => projected = index}
            on:focusin={() => projected = index}
            on:mouseleave={() => projected = undefined}
            on:focusout={() => projected = undefined}
            on:click={() => update(index)}
            class={starClassName}
            {disabled}>
      <slot name="star"
            {value}
            {index}
            filled={typeof projected !== 'undefined' ? index <= projected : index <= value - 1}>
        <Icon name="star" fill={typeof projected !== 'undefined' ? index <= projected : index <= value - 1} />
      </slot>
    </button>
  {/each}
  <slot name="after" />
</ul>
