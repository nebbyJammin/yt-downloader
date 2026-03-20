<script lang="ts">
    import type { Snippet } from "svelte";

  interface StyledFieldArgs {
    label?: string
    children?: Snippet
  }

  let {
    label = "\x80",
    children,
  }: StyledFieldArgs = $props();
</script>


<div class="flex flex-col col-span-full">
  <span class="font-medium text-xs text-grey-1">{label}</span>
  {@render children?.()}
</div>
