<script>
    import { cubicOut } from "svelte/easing";
    import { fade } from "svelte/transition";

  let {
    title, x, y, color,
  } = $props();
</script>
<div 
  style="
    top: {y + 5}px;
    left: {x + 5}px;
    color: {color};
  "
  transition:fade={{duration:100, easing: cubicOut}}
  class="font-bold bg-foreground border border-[#ddd] shadow shadow-[#ddd] rounded-sm absolute p-2 whitespace-pre-wrap"
>Error: {title}</div>
