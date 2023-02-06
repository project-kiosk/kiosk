<script lang="ts">
  import Icon from "$lib/components/Icon.svelte";
  import { generateRandomString } from "$lib/utilities";
  import { createEventDispatcher } from "svelte";

  let className: string = "";
  // noinspection ReservedWordAsName
  export { className as class };

  export let value: string                                              = "";
  export let label: string | undefined                                  = undefined;
  export let hint: string | undefined                                   = undefined;
  export let error: string | undefined                                  = undefined;
  export let prependIcon: string | undefined                            = undefined;
  export let appendIcon: string | undefined                             = undefined;
  export let type: HTMLInputElement["type"]                             = "text";
  export let name: HTMLInputElement["name"] | undefined                 = undefined;
  export let placeholder: HTMLInputElement["placeholder"] | undefined   = undefined;
  export let autocomplete: HTMLInputElement["autocomplete"] | undefined = undefined;
  export let disabled: HTMLInputElement["disabled"]                     = false;
  export let readonly: HTMLInputElement["readOnly"]                     = false;
  export let required: HTMLInputElement["required"]                     = false;
  export let autofocus: HTMLInputElement["autofocus"]                   = false;
  export let step: HTMLInputElement["step"] | undefined                 = undefined;
  export let max: HTMLInputElement["max"] | undefined                   = undefined;
  export let maxlength: HTMLInputElement["maxLength"] | undefined       = undefined;
  export let min: HTMLInputElement["min"] | undefined                   = undefined;
  export let minlength: HTMLInputElement["minLength"] | undefined       = undefined;
  export let size: HTMLInputElement["size"] | undefined                 = undefined;
  export let pattern: HTMLInputElement["pattern"] | undefined           = undefined;
  export let inputmode: HTMLInputElement["inputMode"] | undefined       = undefined;

  const dispatch = createEventDispatcher<{
    submit: never
  }>();
  let id         = "field-" + generateRandomString( 6 );

  function handleInput( { target }: InputEvent ): void {
    value = ( target as HTMLInputElement ).value;
  }

  function handleKeypress( { key }: KeyboardEvent ): void {
    if ( key === "Enter" ) {
      dispatch( "submit" );
    }
  }
</script>

<label class="{className} form-field" for={id}>
  <slot name="prepend" />

  {#if $$slots.prependIcon || prependIcon}
    <span class="form-field__prepend-icon">
      <slot name="prependIcon">
        <Icon name={prependIcon} />
      </slot>
    </span>
  {/if}

  <!-- svelte-ignore a11y-autofocus -->
  <span class="form-field__control-wrapper">
    <slot name="control" {id} {type} fieldName={name} {placeholder} {disabled}
          {autocomplete} {readonly} {max} {min} {autofocus} {size} {required}
          {inputmode} {maxlength} {minlength} {pattern} {step} {value}>

      <!-- svelte-ignore a11y-autofocus -->
      <input {id} {type} {name} {placeholder} {disabled} {autocomplete}
             {readonly} {max} {min} {autofocus} {size} {required} {inputmode}
             {maxlength} {minlength} {pattern} {step} {value}
             class="form-field__control"
             on:keypress={handleKeypress}
             on:input={handleInput}>
    </slot>
  </span>

  {#if $$slots.label || label}
    <slot name="label">
      <span class="form-field__label">
        <slot name="labelText">{label}</slot>
        <slot name="appendLabel" />
      </span>
    </slot>
  {/if}

    {#if $$slots.appendIcon || appendIcon}
    <span class="form-field__append-icon">
      <slot name="appendIcon">
        <Icon name={appendIcon} />
      </slot>
    </span>
  {/if}

  <slot {value} />

  {#if $$slots.hint || hint || $$slots.error || error}
    <span class="form-field__messages">
      {#if $$slots.error || error}
        <slot name="error">
          <span class="form-field__hint">{error}</span>
        </slot>
      {:else if $$slots.hint || hint}
        <slot name="hint">
          <span class="form-field__hint">{hint}</span>
        </slot>
      {/if}
    </span>
  {/if}
</label>

<style lang="postcss">
    .form-field {
        @apply relative flex items-center flex-wrap border dark:border-gray-700 rounded-md bg-white dark:bg-black transition focus:outline-none focus-within:ring-2 ring-blue-500 shadow-sm;

        &:has(.form-field__messages) {
            @apply mb-6;
        }

        & + & {
            @apply mt-2;
        }

        & + :global(.button) {
            @apply mt-8;
        }
    }

    .form-field__prepend-icon,
    .form-field__append-icon {
        @apply leading-none h-6 text-gray-500;
    }

    /* 1. Label */

    .form-field__label {
        @apply order-1 w-full flex items-center justify-between flex-shrink-0 px-2 text-sm text-gray-500 select-none;
    }

    /* 2. Prepend Icon */

    .form-field__prepend-icon {
        @apply order-2 pl-2;
    }

    /* 3. Control */

    .form-field__control-wrapper {
        @apply order-3 flex flex-grow;

        & + .form-field__label {
            @apply mt-2;
        }

        & :global(input),
        & :global(textarea) {
            @apply flex-grow border-none bg-transparent rounded-md ring-0 px-2 pt-1 pb-1 min-w-0;
        }
    }

    /* 4. Append Icon */

    .form-field__append-icon {
        @apply order-4 px-2;
    }

    .form-field__messages {
        @apply absolute bottom-0 left-0 -mb-6 w-full flex-shrink-0 px-2 text-xs text-gray-500 select-none;
    }

</style>
