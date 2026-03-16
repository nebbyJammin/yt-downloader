<script lang="ts">
  import { type Snippet } from 'svelte';
  import type { NavigationButtonInfo } from './NavigationElement';
  import NavigationElement from './NavigationElement.svelte';

  let {children}: {children?: Snippet} = $props();

  const navigations: NavigationButtonInfo[] = [
    {
      title: "Home",
      src: "/images/icons/home.svg",
      href: "/home",
    },
    {
      title: "Download",
      src: "/images/icons/download.svg",
      href: "/download",
    },
    {
      title: "Settings",
      src: "/images/icons/settings.svg",
      href: "/settings",
    },
    {
      title: "About",
      src: "/images/icons/info.svg",
      href: "/about",
    },
  ]
</script>

<nav class="fixed h-screen border-r border-r-grey-2 w-20 flex flex-col">
  {#each navigations as navigation}
    <NavigationElement {...navigation}/> 
  {/each}
</nav>
<main class="ml-20">
  {@render children?.()}
</main>
