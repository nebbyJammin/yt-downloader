const { contextBridge, ipcRenderer } = require('electron') as typeof import('electron');
import type { DownloadOptionsWithCookies, VideoDownloadContextWithoutId } from '../src/lib/types/window.ts';
import type { PersistentAppState } from '../src/lib/stores/globalPersistentStore.svelte.ts';
import type { DownloadingVideoDownloadContext } from '../src/lib/downloadsModel.ts';
import type { IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('nebbysYTDLP', {
  ytdlp: {
    hasYTDLP:              () => ipcRenderer.invoke('ytdlp:hasYTDLP'),
    hasFFMPEG:             () => ipcRenderer.invoke('ytdlp:hasFFMPEG'),
    hasJSRUNTIME:          () => ipcRenderer.invoke('ytdlp:hasJSRuntime'),
    hasMinimumDependencies:() => ipcRenderer.invoke('ytdlp:hasMinimumDependencies'),

    getMetadata: 
      (url: string, options: Pick<DownloadOptionsWithCookies, 'cookies'>): Promise<VideoDownloadContextWithoutId> => 
        ipcRenderer.invoke('ytdlp:getMetadata', url, options),
    startDownload: () => ipcRenderer.invoke('ytdlp:startDownload'),
    cancelDownload: () => ipcRenderer.invoke('ytdlp:cancelDownload'),
    setOnRequestNextVideo: 
      (callback: () => [VideoDownloadContextWithoutId | null, Pick<DownloadOptionsWithCookies, 'cookies'>]) =>
        ipcRenderer.on('ytdlp:onRequestNextVideo', async () => {
          const [nextVideo, cookies] = callback();
          return await ipcRenderer.invoke('ytdlp:provideNextVideo', nextVideo, cookies)
        }),
    setOnVideoDownloadRequestFinished:
      (callback: (() => any) | (() => void)) => 
        ipcRenderer.on('ytdlp:onVideoDownloadRequestFinished', callback),
    setOnVideoDownloadUpdated: 
    (callback: ((e: IpcRendererEvent, newVideoState: DownloadingVideoDownloadContext) => any) 
    | ((e: IpcRendererEvent, newVideoState: DownloadingVideoDownloadContext) => void)) => ipcRenderer.on('ytdlp:onVideoDownloadUpdated', callback)


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
