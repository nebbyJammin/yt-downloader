import { electron } from "$lib/electron";
import { debounce, type DeepReadonly } from "$lib/utils";
import type { VideoMetadata } from "$lib/downloadsModel";
import { CookiesFromBrowserMethod, CookiesMethod, type CookiesPreferences } from "$lib/types/cookies";

const SAVE_DEBOUNCE = 500;

export type Preferences = {
  cookies: CookiesPreferences
}

export interface PersistentAppState {
  preferences: Preferences,
  downloads: {
    history: VideoMetadata[]
  },
}

// const defaultState: PersistentAppState = {
  // preferences: {
    // cookies: {
      // cookiesMethod: CookiesMethod.NONE,
      // cookiesRaw: "",
      // cookiesFromBrowserMethod: CookiesFromBrowserMethod.CHROME,
      // cookiesFromBrowserMethodOther: "",
    // }
  // },
  // downloads: {
    // history: []
  // }
// }

const defaultState: PersistentAppState = {
  preferences: {
    cookies: {
      cookiesMethod: CookiesMethod.BROWSER,
      cookiesRaw: "",
      cookiesFromBrowserMethod: CookiesFromBrowserMethod.FIREFOX,
      cookiesFromBrowserMethodOther: "",
    }
  },
  downloads: {
    history: []
  }
}

class GlobalPersistentStore {
  #state = $state<PersistentAppState>(defaultState);
  #loaded = false;

  get state(): DeepReadonly<PersistentAppState> {
    return this.#state;
  }

  #save = debounce(async () => {
    await electron.store.save($state.snapshot(this.#state));
  }, SAVE_DEBOUNCE);

  async init() {
    if (this.#loaded) return;
    this.#loaded = true;

    $effect(() => {
      console.log("state changed");
      JSON.stringify(this.#state); // Listen to any state changes
      this.#save();
    })

    const saved = await electron.store.load()

    // NOTE: Consider crashing or throwing an error if we cannot load properly
    if (saved) {
      this.#state = saved;
    }
  }
}

export const globalPersistentStore = new GlobalPersistentStore();
