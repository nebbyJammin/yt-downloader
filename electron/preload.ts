const electron = require('electron');
const contextBridge = electron.contextBridge;

contextBridge.exposeInMainWorld('nebbysYTDLP', {
  ytdlp: {
    getReady: () => true,
  },
  test: console.log
});
