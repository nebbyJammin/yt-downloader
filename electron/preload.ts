const { contextBridge, ipcRenderer } = require('electron') as typeof import('electron');

contextBridge.exposeInMainWorld('nebbysYTDLP', {
  ytdlp: {
    hasYTDLP:              () => ipcRenderer.invoke('ytdlp:hasYTDLP'),
    hasFFMPEG:             () => ipcRenderer.invoke('ytdlp:hasFFMPEG'),
    hasJSRUNTIME:          () => ipcRenderer.invoke('ytdlp:hasJSRuntime'),
    hasMinimumDependencies:() => ipcRenderer.invoke('ytdlp:hasMinimumDependencies'),
  },
});
