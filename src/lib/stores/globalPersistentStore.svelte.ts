import { electron } from "$lib/electron";
import { debounce, type DeepReadonly } from "$lib/utils";
import type { VideoMetadata } from "$lib/downloadsModel";

const SAVE_DEBOUNCE = 500;

export enum CookiesMethod {
  NONE,
  TXT,
  BROWSER,
}

export enum CookiesFromBrowserMethod {
  CHROME, BRAVE, EDGE, OPERA, VIVALDI, WHALE, FIREFOX, SAFARI, OTHER,
}

export type CookiesPreferences = { 
  cookiesMethod: CookiesMethod,
  cookiesRaw: string,
  cookiesFromBrowserMethod: CookiesFromBrowserMethod
  cookiesFromBrowserMethodOther: string
}

export type Preferences = {
  cookies: CookiesPreferences
}

export interface PersistentAppState {
  preferences: Preferences,
  downloads: {
    history: VideoMetadata[]
  },
}

const defaultState: PersistentAppState = {
  preferences: {
    cookies: {
      cookiesMethod: CookiesMethod.NONE,
      cookiesRaw: "",
      cookiesFromBrowserMethod: CookiesFromBrowserMethod.CHROME,
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
