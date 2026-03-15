// Override types on window object to expose API via IPC

export interface YTDLP {
  hasYTDLP: () => Promise<boolean>
  hasFFMPEG: () => Promise<boolean>
  hasJSRUNTIME: () => Promise<boolean>
  hasMinimumDependencies: () => Promise<boolean>
}

export interface NebbysYTDLP {
  ytdlp: YTDLP
}

declare global {
  interface Window {
    nebbysYTDLP: NebbysYTDLP
  }
}
