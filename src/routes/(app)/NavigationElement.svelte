<script lang="ts">
  import { page } from "$app/state";
  import type { NavigationButtonInfo } from "./NavigationElement";

  const {
    title, src, href
  }: NavigationButtonInfo = $props()

  const isCurrentlyOpen = $derived(page.url.pathname === href);

</script>

<a href={href}>
  <div class={`flex flex-col items-center justify-center p-2 hover:bg-white/5 transition-colors duration-200 ease-out w-full aspect-square select-none`}> 
    <div class="w-full px-4 py-1">
      <div class={`${isCurrentlyOpen ? "bg-purple" : "bg-white" } w-full aspect-square`} style:mask-image={`url(${src})`}></div>
    </div>
    <div class={`text-xs ${isCurrentlyOpen ? "text-purple font-medium" : "font-light"}`}>{title}</div>
  </div>
</a>
