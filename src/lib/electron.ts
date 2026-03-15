import { browser } from "$app/environment";

// Expose electron IPC
// NOTE: This is only defined on client side
export const electron = browser ? window.nebbysYTDLP : undefined;
