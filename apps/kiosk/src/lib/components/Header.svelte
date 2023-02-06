<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import HeaderNavLink from "./HeaderNavLink.svelte";

  export let isAuthenticated: boolean;
  export let userName: string;

  async function logout(): Promise<void> {
    await fetch( "/auth/logout", { method: "POST" } );
    await invalidateAll();
  }
</script>

<header class="page-header py-8 border-b bg-white">
  <div class="flex items-center max-w-6xl mx-auto px-8">
    <a href="/" class="title-link mr-8">
      <h1 class="text-2xl font-bold uppercase">Kiosk</h1>
    </a>

    <nav class="flex w-full justify-between">
      <ul class="flex space-x-4">
        <HeaderNavLink to="/authors" title="Authors" />
        <HeaderNavLink to="/books" title="Books" />
      </ul>

      <ul class="flex items-center">
        {#if isAuthenticated}
          <li><span class="mr-8 font-bold">{userName}</span></li>

          <HeaderNavLink on:click={logout} title="Logout" />
        {:else}
          <HeaderNavLink to="/auth/login" title="Login" />
        {/if}
      </ul>
    </nav>

    <button class="switch-display-mode minimal im im-newspaper-o" title="Switch Reader Mode"></button>
  </div>
</header>
