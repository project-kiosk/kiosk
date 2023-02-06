<script lang="ts">
  export let name: string | undefined  = undefined;
  export let value: string | undefined = undefined;
</script>

<li class="flex flex-col flex-grow items-center border-r dark:border-r-gray-700 last:border-r-0 border-gray-200 px-4">
  <span class="uppercase font-bold text-sm mb-1 dark:text-gray-500">
    <slot name="name">{name}</slot>
  </span>
  <div class="flex flex-col flex-grow items-center justify-center dark:text-gray-300">
    <span class="text-2xl font-bold leading-none">
      <slot>{value}</slot>
    </span>

    <slot name="secondary" />
  </div>
</li>
