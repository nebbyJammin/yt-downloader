const { contextBridge, ipcRenderer } = require('electron') as typeof import('electron');
import type { DownloadOptions, VideoDownloadContextWithoutId } from '../src/lib/types/window.ts';
import type { PersistentAppState } from '../src/lib/stores/globalPersistentStore.svelte.ts';

contextBridge.exposeInMainWorld('nebbysYTDLP', {
  ytdlp: {
    hasYTDLP:              () => ipcRenderer.invoke('ytdlp:hasYTDLP'),
    hasFFMPEG:             () => ipcRenderer.invoke('ytdlp:hasFFMPEG'),
    hasJSRUNTIME:          () => ipcRenderer.invoke('ytdlp:hasJSRuntime'),
    hasMinimumDependencies:() => ipcRenderer.invoke('ytdlp:hasMinimumDependencies'),

    getMetadata: 
      (url: string, options: Pick<DownloadOptions, 'cookies'>): Promise<VideoDownloadContextWithoutId> => 
        ipcRenderer.invoke('ytdlp:getMetadata', url, options),
    startDownload: () => ipcRenderer.invoke('ytdlp:startDownload'),
    cancelDownload: () => ipcRenderer.invoke('ytdlp:cancelDownload'),
    setOnRequestNextVideo: 
      (callback: () => VideoDownloadContextWithoutId | null) => {

        ipcRenderer.on('ytdlp:onRequestNextVideo', () => {
          const next = callback();
          // send result back to main
          ipcRenderer.invoke('ytdlp:provideNextVideo', next)
        });
      },
    setOnVideoDownloadRequestFinished:
      (callback: (() => any) | (() => void)) => 
        ipcRenderer.on('ytdlp:onVideoDownloadRequestFinished', callback)


  },
  store: {
    load: () => ipcRenderer.invoke('nebbysytdlp:load'),
    save: (state: PersistentAppState) => ipcRenderer.invoke('nebbysytdlp:save', state),
  },
  dialog: {
    showOpenDialog: () => ipcRenderer.invoke('dialog:openDirectory'),
    openDirectoryInSeparateProcess: (path: string) => ipcRenderer.invoke('dialog:openDirectoryInSeparateProcess', path),
  },
  restart: () => ipcRenderer.invoke('nebbysytdlp:restart'),
  getDefaultOutputDirectory: () => ipcRenderer.invoke('nebbysytdlp:getDefaultOutputDirectory'),
});
