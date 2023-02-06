<div class="h-full gradient">
  <header class="h-[70vh] bg-black/80 backdrop-blur-2xl text-white content p-32">
    <h1 class="text-[10rem] font-bold leading-tight">Kiosk</h1>
    <span class="text-4xl ml-3">Your digital bookshelf.</span>
  </header>

  <section class="min-h-[40vh]">

  </section>
</div>

<style lang="postcss">
    .content {
        clip-path: polygon(0 0, 100% 0, 100% 95%, 0% 100%);
    }

    .gradient {
        @apply relative;
        background: rgba(255, 114, 203, 1);

        &::after {
            @apply absolute inset-0;
            content:        "";
            mix-blend-mode: multiply;
            background:     radial-gradient(circle at 20% 60%, rgba(214, 153, 41, 1) 0%, rgba(240, 103, 103, 1) 14%, transparent 50%);
            pointer-events: none;
        }
    }
</style>

<svelte:head>
  <meta name="theme-color" content="rgb(48,25,40)" />
</svelte:head>
