// Override types on window object to expose API via IPC

export interface YTDLP {
  getReady: () => boolean
}

export interface NebbysYTDLP {
  ytdlp: YTDLP
}

declare global {
  interface Window {
    nebbysYTDLP: NebbysYTDLP
  }
}
