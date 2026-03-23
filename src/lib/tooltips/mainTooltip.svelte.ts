import Tooltip from './MainTooltipAction.svelte';
import type { Action } from 'svelte/action';
import { mount, unmount } from 'svelte';

interface MainTooltipOptions {
  color?: string;
}

// TODO: Allow the tooltip to take args wrt to offset positioning
export const mainTooltip: Action<HTMLElement, MainTooltipOptions> = (element, options) => {
  let tooltipText: string | null = null;
  let tooltipComponent: Record<string, unknown> | null = null;
  const state = $state({ title: '', x: 0, y: 0, color: options.color ?? 'var(--background)' });

  const boundingRect = element.getBoundingClientRect();

  function mouseEnter(event: MouseEvent) {
    if (tooltipComponent) return;
    tooltipText = element.getAttribute('data-tooltip');
    if (!tooltipText) return;
    state.title = tooltipText;
    state.x = boundingRect.left;
    state.y = boundingRect.top + boundingRect.height/2+10;
    tooltipComponent = mount(Tooltip, {
      props: state,
      target: document.body,
    });
  }

  function mouseMove(event: MouseEvent) {
    state.x = boundingRect.left;
    state.y = boundingRect.bottom;
  }

  function mouseLeave() {
    if (tooltipComponent) {
      unmount(tooltipComponent);
      tooltipComponent = null;
    }
    if (tooltipText) element.setAttribute('data-tooltip', tooltipText);
  }

  element.addEventListener('mouseenter', mouseEnter);
  element.addEventListener('mouseleave', mouseLeave);
  element.addEventListener('mousemove', mouseMove);

  return {
    destroy() {
      if (tooltipComponent) unmount(tooltipComponent);
      element.removeEventListener('mouseenter', mouseEnter);
      element.removeEventListener('mouseleave', mouseLeave);
      element.removeEventListener('mousemove', mouseMove);
    }
  };
};
