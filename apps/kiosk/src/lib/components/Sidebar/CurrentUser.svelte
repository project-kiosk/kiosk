<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import Icon from "$lib/components/Icon.svelte";
  import Gravatar from "svelte-gravatar";

  export let email: string;
  export let name: string;

  async function logout(): Promise<void> {
    await fetch( "/auth/logout", { method: "POST" } );
    await invalidateAll();
  }
</script>

<div class="flex items-center w-full">
  <a href="/family/profile" class="flex justify-center md:justify-start items-center flex-grow">
    <Gravatar {email} class="rounded-full overflow-hidden" />
    <span class="hidden md:inline ml-4 font-bold overflow-hidden overflow-ellipsis max-w-full">
      {name}
    </span>
  </a>

  <button type="button"
          class="hidden md:block p-4 ml-auto rounded-md leading-none bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          on:click={logout}>
    <Icon name="logout" />
  </button>
</div>
