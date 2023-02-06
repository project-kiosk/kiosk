<script lang="ts">
  import { createEventDispatcher, SvelteComponentTyped } from "svelte";

  export let value: string       = "";
  export let index: string;
  export let placeholder: string = "";
  export let disabled: boolean   = false;

  const dispatch = createEventDispatcher<{
    backspace: Backspace;
    input: Input;
    paste: Paste;
  }>();

  let digit: SvelteComponentTyped;

  function handlePaste( event: Event ): void {
    // Get pasted data via clipboard API
    // @ts-ignore
    let clipboardData = event.clipboardData || window.clipboardData;
    let pastedData    = clipboardData.getData( "Text" ).replace( /[^0-9]/g, "" );

    if ( !pastedData ) {
      return;
    }

    value = pastedData.slice( 0, 1 );

    dispatch( "paste", { index, value: pastedData } );
  }

  function handleKey( event: KeyboardEvent ): void {
    if ( event.key === "Backspace" ) {
      event.preventDefault();
      value = "";
      dispatch( "backspace", { index } );
    }

    const newValue = event.key;

    if ( !newValue.match( /^[0-9]$/ ) ) {
      return;
    }

    event.preventDefault();
    value = newValue;

    dispatch( "input", { index, value } );
  }

  interface Input
  {
    index: string;
    value: string;
  }

  export type InputEvent = CustomEvent<Input>;

  interface Paste
  {
    index: string;
    value: string;
  }

  export type PasteEvent = CustomEvent<Paste>;

  interface Backspace
  {
    index: string;
  }

  export type BackspaceEvent = CustomEvent<Backspace>;
</script>

<svelte:window />

<label class="digit" for="pass-code-digit-{index}">
  <input
    name="pass-code-digit-{index}"
    id="pass-code-digit-{index}"
    inputmode="numeric"
    type="text"
    {placeholder}
    {disabled}
    value={value}
    on:paste|preventDefault={handlePaste}
    on:keydown={handleKey}
    maxlength={1}
    class="digit__control text-center w-10 h-12 px-0 py-2 border rounded disabled:bg-gray-100 bg-white dark:bg-black"
    bind:this={digit}
  />
</label>

