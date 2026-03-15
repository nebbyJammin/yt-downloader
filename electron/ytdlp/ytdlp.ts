import which from 'which';
import { ipcMain } from 'electron';

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

export default function registerYTDLPHandlers() {
  ipcMain.handle('ytdlp:hasYTDLP',               hasYTDLP);
  ipcMain.handle('ytdlp:hasFFMPEG',              hasFFMPEG);
  ipcMain.handle('ytdlp:hasJSRuntime',           hasJSRuntime);
  ipcMain.handle('ytdlp:hasMinimumDependencies', hasMinimumDependencies);
}
