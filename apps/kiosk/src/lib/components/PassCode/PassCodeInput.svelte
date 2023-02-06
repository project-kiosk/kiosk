<script context="module" lang="ts">
  export interface PassCodeChange
  {
    passCode: string | undefined;
  }

  export type PassCodeChangeEvent = CustomEvent<PassCodeChange>;
</script>

<script lang="ts">
  // noinspection TypeScriptCheckImport
  import type { BackspaceEvent, InputEvent, PasteEvent } from "$lib/components/PassCode/PassCodeDigit.svelte";
  import PassCodeDigit from "$lib/components/PassCode/PassCodeDigit.svelte";
  import type { SvelteComponentTyped } from "svelte";
  import { createEventDispatcher, tick } from "svelte";

  export let numberOfInputs: number      = 6;
  export let initialValue: string        = "";
  export let placeholder: string         = "";
  export let emitEventOnPrefill: boolean = false;
  export let disabled: boolean           = false;

  interface Digit
  {
    index: string;
    value: string;
    placeholder: string;
    ref: SvelteComponentTyped | null;
  }

  function resetDigits( passCode: string ): Digit[] {
    return Array.from( Array( numberOfInputs ).keys() ).map( ( index: number ) => ( {
      index: index.toString(),
      value: passCode[ index ] || "",
      placeholder: placeholder[ index ] || "",
      ref: null
    } ) );
  }

  function buildPassCode(): string | undefined {
    const passCode = digits.reduce( ( passCode, digit ) => passCode + digit.value, "" );

    if ( passCode.length < numberOfInputs ) {
      return undefined;
    }

    return passCode;
  }

  let digits: Digit[] = resetDigits( initialValue );

  $: {
    async function prefillValueOnInitialValueChange(): Promise<void> {
      if ( !( initialValue !== "" && initialValue.trim().length > 0 ) ) {
        return;
      }

      digits = resetDigits( initialValue );

      await tick();

      if ( emitEventOnPrefill ) {
        dispatch( "input", { passCode: buildPassCode() } );
      }
    }

    prefillValueOnInitialValueChange();
  }

  const dispatch = createEventDispatcher<{ input: PassCodeChange }>();

  export const getValue = (): string | undefined => {
    return buildPassCode();
  };

  function handleChange( event: InputEvent ): void {
    // @ts-ignore
    const { index }    = event.detail;
    const currentIndex = digits.findIndex( ( digit ) => digit.index === index );
    let nextIndex;

    nextIndex = currentIndex < digits.length - 1
                ? currentIndex + 1
                : currentIndex;

    focusDigit( digits[ nextIndex ] );

    const passCode = buildPassCode();

    if ( passCode && passCode.length === numberOfInputs ) {
      dispatch( "input", { passCode } );
    }
  }

  function handleBackspace( event: BackspaceEvent ): void {
    // noinspection TypeScriptUnresolvedVariable
    const { index }     = event.detail;
    const currentIndex  = digits.findIndex( ( digit ) => digit.index === index );
    const previousIndex = currentIndex !== 0 ? currentIndex - 1 : 0;

    focusDigit( digits[ previousIndex ] );
  }

  async function handlePaste( event: PasteEvent ): Promise<void> {
    // @ts-ignore
    let { value } = event.detail;
    value         = value.slice( 0, numberOfInputs );

    digits = resetDigits( value );

    await tick();

    // Focus the last digit after pasting
    focusDigit( digits[ value.length - 1 ] );

    const passCode = buildPassCode();

    if ( passCode && passCode.length === numberOfInputs ) {
      dispatch( "input", { passCode } );
    }
  }

  function focusDigit( digit: Digit ) {
    digit.ref?.$$.ctx[ 4 ].focus();
  }

</script>

<section class="pass-code flex items-center space-x-2">
  {#each digits as digit, index}
    <div class="pass-code__row">
      <PassCodeDigit
        placeholder={digit.placeholder}
        index={digit.index}
        bind:value={digit.value}
        disabled={disabled}
        bind:this={digit.ref}
        on:backspace={handleBackspace}
        on:input={handleChange}
        on:paste={handlePaste}
      />
    </div>
  {/each}
</section>
