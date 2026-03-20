import which from 'which';
import { app, ipcMain, IpcMainInvokeEvent } from 'electron';
import type { DownloadOptions } from '../../src/lib/types/window';
import { spawn } from 'node:child_process';
import { closeSync, openSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CookiesFromBrowserMethod, CookiesMethod } from '../../src/lib/types/cookies';

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
  ]).catch(() => false);

const hasMinimumDependencies = async () => {
  const results = await Promise.all([hasYTDLP(), hasFFMPEG(), hasJSRuntime()]);
  return results.every(Boolean);
};

const getCookieArgs = (options: Pick<DownloadOptions, 'cookies'>) => {
  const args: string[] = []
  if (options.cookies.cookiesMethod === CookiesMethod.NONE) {
    return args
  } else if (options.cookies.cookiesMethod === CookiesMethod.RAW) {
    // TODO: IMPLEMENT RAW COOKIES
    return args
  } else if (options.cookies.cookiesMethod === CookiesMethod.BROWSER) {
    const method = options.cookies.cookiesFromBrowserMethod === CookiesFromBrowserMethod.OTHER ? options.cookies.cookiesFromBrowserMethodOther : CookiesFromBrowserMethod[options.cookies.cookiesFromBrowserMethod].toLowerCase();

    args.push("--cookies-from-browser", method)
    return args;
  } else {
    return args;
  }
}

const getMetadata = async (e: IpcMainInvokeEvent, url: string, options: Pick<DownloadOptions, 'cookies'>) => {
  const cookieArgs = getCookieArgs(options);
  const urlHash = createHash('md5').update(url).digest('hex');
  const timeISO = new Date().toISOString();
  const tempDir = app.getPath("temp");
  const tempFilePath = path.join(tempDir, `${urlHash}-${timeISO}`)
  const out = openSync(tempFilePath, 'a')

  console.log("getting metadata into", tempFilePath, "with cookies args", cookieArgs);

  await new Promise<void>((resolve, reject) => {
    const ytdlp = spawn("yt-dlp", [
      "--skip-download",
      "--flat-playlist",
      ...cookieArgs,
      "--extractor-args", "youtubetab:approximate-date",
      "--print", "%(.{url,title,channel,duration,timestamp,view_count})j",
      url,
    ], {
      stdio: ['ignore', out, 'inherit']
    });

    ytdlp.on('close', (code) => {
      closeSync(out); // close the file descriptor
      if (code === 0) {
        resolve();
      }
      else reject(new Error(`yt-dlp exited with code ${code}`));
    });

    ytdlp.on('error', reject); // handle spawn failures e.g. yt-dlp not found
  });

  const stdout = await readFile(tempFilePath, 'utf8');
  console.log(stdout);

  const lines = stdout.trim().split('\n').filter(Boolean);
  const metadata = lines.map(line => {
    const video = JSON.parse(line)
    if (video.url === null) {
      video.url = url;
    }

    return video;
  });
  console.log("got metadata", metadata);

  return metadata;
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
