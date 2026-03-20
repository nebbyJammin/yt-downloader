import which from 'which';
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import type { DownloadOptions } from '../../src/lib/types/window';
import type { VideoMetadata } from '../../src/lib/downloadsModel';

async function checkBinary(cmd: string): Promise<boolean> {
  try { await which(cmd); return true; }
  catch { return false; }
}

const hasYTDLP  = () => checkBinary('yt-dlp');
const hasFFMPEG = () => checkBinary('ffmpeg');
const hasJSRuntime = () =>
  Promise.any([
    checkBinary('deno'), checkBinary('node'),
    checkBinary('bun'),  checkBinary('qjs'),
  ]).then(() => true).catch(() => false);

const hasMinimumDependencies = async () => {
  const results = await Promise.all([hasYTDLP(), hasFFMPEG(), hasJSRuntime()]);
  return results.every(Boolean);
};

const getMetadata = async (e: IpcMainInvokeEvent, url: string, options: Pick<DownloadOptions, 'cookies'>) => {
  console.log("getting metadata");
  return {
      url: url,
      title: 'Re:Verse',
      channel: 'Camellia Official',
      duration: 267,
      timestamp: 1615312212,
      view_count: 36798
  } satisfies VideoMetadata;
}
const startDownload = async () => {
  console.log("starting download");
}
const cancelDownload = async () => {
  console.log("canceling download");
}
const onNextVideoProvided = () => {
  console.log("setting on request next video");
}

export default function registerYTDLPHandlers() {
  ipcMain.handle('ytdlp:hasYTDLP',               hasYTDLP);
  ipcMain.handle('ytdlp:hasFFMPEG',              hasFFMPEG);
  ipcMain.handle('ytdlp:hasJSRuntime',           hasJSRuntime);
  ipcMain.handle('ytdlp:hasMinimumDependencies', hasMinimumDependencies);

  ipcMain.handle('ytdlp:getMetadata',           getMetadata);
  ipcMain.handle('ytdlp:startDownload',         startDownload);
  ipcMain.handle('ytdlp:cancelDownload',        cancelDownload);
  ipcMain.handle('ytdlp:provideNextVideo', onNextVideoProvided);


}
