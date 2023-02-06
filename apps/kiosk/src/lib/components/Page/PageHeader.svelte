<script lang="ts">
  let className = "";
  // noinspection ReservedWordAsName, JSUnusedGlobalSymbols
  export { className as class };
  const classes = `mb-8 w-full ${ className }`.trimEnd();

  export let title: string;
</script>

<header class="{classes}">
  <slot name="content">
    <h2 class="text-3xl">
      <slot>{title}</slot>
    </h2>
  </slot>
</header>
