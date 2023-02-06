<script lang="ts">
  export let title: string | undefined = undefined;
  export let help: string | undefined  = undefined;
</script>

<section class="mt-8">
  <header>
    <h2 class="text-lg font-bold mb-2">
      {#if $$slots.title || title}
        <slot name="title">{title}</slot>
      {/if}
    </h2>
  </header>

  <div class="flex flex-col md:flex-row">
    <slot name="before" />
    <div class="xl:w-1/4 lg:w-1/3 md:w-1/2 w-full text-gray-500 pr-8">
      {#if $$slots.help}
        <slot name="help">{help}</slot>
      {/if}
    </div>
    <div class="xl:w-3/4 lg:w-2/3 md:w-1/2 w-full">
      <slot></slot>
    </div>
    <slot name="after" />
  </div>
</section>
