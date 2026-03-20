import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import registerYTDLPHandlers from "./ytdlp/ytdlp";
import { pathToFileURL } from "node:url";
import type { PersistentAppState } from "../src/lib/stores/globalPersistentStore.svelte";
import { spawn } from "node:child_process";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

const isDev = MAIN_WINDOW_VITE_DEV_SERVER_URL !== undefined;

console.log("is dev", isDev);
console.log("dev server url:", MAIN_WINDOW_VITE_DEV_SERVER_URL);
console.log("main window name:", MAIN_WINDOW_VITE_NAME);

const rendererDist = path.join(
  import.meta.dirname,
  `../renderer/${MAIN_WINDOW_VITE_NAME}`
);

if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
  app.setPath('userData', path.join(app.getPath('userData'), '-dev'));
}

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.js"),
      devTools: isDev,
    },
  });

  // TODO: Probably refactor this elsewhere, this feels messy having a bunch of event handlers crammed here

  // Register BrowserWindow specific IPC handlers
  ipcMain.handle("dialog:openDirectory", async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    });
    if (result.canceled) return null;

    return result.filePaths[0];
  })

  ipcMain.handle("dialog:openDirectoryInSeparateProcess", async (_, path: string) => {
    const command = process.platform === 'win32' ? 'explorer'
      : process.platform === 'darwin' ? 'open'
      : 'xdg-open';

    spawn(command, [path], { detached: true, stdio: 'ignore' }).unref();
  })

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(
      MAIN_WINDOW_VITE_DEV_SERVER_URL
    );
    mainWindow.webContents.on("did-frame-finish-load", () => {
      mainWindow.webContents.openDevTools({ mode: "right" });
    });
  } else {
    // NOTE: This is old method
    // const filePath = path.join(
      // import.meta.dirname,
      // `../renderer/${MAIN_WINDOW_VITE_NAME}/app.html`
    // );
    // console.log('Loading production file:', filePath);
    // mainWindow.loadURL(`file://${filePath}`);
 
    // NOTE: This is new method, defining custom protocol to resolve relative paths to absolute paths (required by svelte)
    mainWindow.loadURL('app://bundle/').catch(err => {
      console.error('Failed to load app url', err);
      mainWindow.loadFile(path.join(rendererDist, 'app.html'));
    });

    // Disable reloading in production builds
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.key === 'r' && (input.control || input.meta)) {
        event.preventDefault();
      }
    });
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  // Register custom protocol to intercept resource resolution
  // We need this because of the way svelte compiles html files, specifically URIs as absolute path rooted at _app, which doesn't exist in a client only electron app.
  protocol.handle('app', (req) => {
    console.log("Protocol handler hit:", req.url);

    const url = new URL(req.url);
    let filePath = url.pathname;

    // strip leading slash for path.join
    filePath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    
    // fallback to app.html for SPA routing
    const resolved = filePath === '' || filePath === '/'
      ? path.join(rendererDist, 'app.html')
      : path.join(rendererDist, filePath);

    return net.fetch(pathToFileURL(resolved).toString());
  });

  createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Register YTDLP specific event handlers
registerYTDLPHandlers();

// Register non-YTDLP specific event handlers
ipcMain.handle("nebbysytdlp:restart", (_) => {
  if (!MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    app.relaunch({
      args: process.argv.slice(1),
      execPath: process.execPath,
    });
  }
  app.exit(0);
});

ipcMain.handle("nebbysytdlp:load", (_) => {
  console.log("loading store");
  return null;
});

ipcMain.handle("nebbysytdlp:save", (_, state: PersistentAppState) => {
  console.log("saving state");
  return true;
});

ipcMain.handle("nebbysytdlp:getDefaultOutputDirectory", () => {
  console.log("getting default output");
  try {
    return app.getPath("downloads");
  } catch(e) {
    return app.getPath("home");
  }
})
