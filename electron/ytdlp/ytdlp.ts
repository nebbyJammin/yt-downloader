import which from 'which';
import { app, BrowserWindow, ipcMain, IpcMainInvokeEvent } from 'electron';
import type { DownloadOptionsWithCookies, VideoDownloadContextWithoutId } from '../../src/lib/types/window';
import { FileFormat, type DownloadingVideoDownloadContext } from '../../src/lib/downloadsModel'
import { spawn } from 'node:child_process';
import { closeSync, openSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { CookiesFromBrowserMethod, CookiesMethod } from '../../src/lib/types/cookies';

let mainWindow: BrowserWindow | null = null;
let currentDownload: DownloadingVideoDownloadContext | null = null;
let cancelDownloadCallback: (() => Promise<boolean>) | null;

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

const getCookieArgs = (options: Pick<DownloadOptionsWithCookies, 'cookies'>) => {
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

const getMetadata = async (e: IpcMainInvokeEvent, url: string, options: Pick<DownloadOptionsWithCookies, 'cookies' | 'embedMetadata' | 'embedThumbnail' | 'downloadFormat'>) => {
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
      "--print", "%(.{url,title,channel,duration,timestamp,view_count,thumbnail})j",
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
    const video = JSON.parse(line);
    if (video.url === null) {
      video.url = url;
    }

    // yt-dlp does not return thumbnails when using flat-playlist
    const videoId = new URL(video.url).searchParams.get("v");
    video.thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`; // Use default thumbnail -> this is usually not the highest quality thumbnail, but yt-dlp will embed highest quality one upon download
    video.downloadFormat = options.downloadFormat;
    video.embedThumbnail = options.embedThumbnail;
    video.embedMetadata = options.embedMetadata;

    return video satisfies VideoDownloadContextWithoutId;
  });
  console.log("got metadata", metadata);

  return metadata;
}

const notifyDownloadFinished = () => {
  mainWindow?.webContents.send('ytdlp:onVideoDownloadRequestFinished');
}

const requestNextVideo = () => {
  resetTrackingVariables();
  mainWindow?.webContents.send('ytdlp:onRequestNextVideo');
}

const startDownload = async (e: IpcMainInvokeEvent) => {
  if (currentDownload) return false;

  console.log("starting download");
  requestNextVideo();
  return true;
}

const cancelDownload = async () => {
  if (!currentDownload) return;
  mainWindow?.webContents.send('ytdlp:onVideoDownloadUpdated', {
    ...currentDownload,
    failed: true,
    error: "Download cancelled",
  } satisfies DownloadingVideoDownloadContext)
  console.log("canceling download");

  // Reset tracking variables
  resetTrackingVariables();
}

const onNextVideoProvided = async (e: IpcMainInvokeEvent, video: VideoDownloadContextWithoutId, options: Pick<DownloadOptionsWithCookies, 'cookies' | 'outputDirectory'>) => {
  // If couldn't provide next video just return
  if (!video || !options) {
    return;
  }

  console.log("next video received");
  // Can't process requested video if we are downloading something
  if (currentDownload) return;
  console.log("setting on request next video");
  currentDownload = {
    ...video,
    progress: 0,
    failed: false,
    error: "",
  };

  console.log(options);

  let killProcess: (() => void) | null = null;
  const cookieArgs = getCookieArgs(options);

  // Handle request args specific to this video
  const requestArgs: string[] = []
  if (currentDownload!.embedThumbnail) {
    requestArgs.push("--embed-thumbnail");
  }
  if (currentDownload!.embedMetadata) {
    requestArgs.push("--embed-metadata");
  }
  if (currentDownload!.downloadFormat.format === FileFormat.MP3) {
    requestArgs.push("-x");
    requestArgs.push("--audio-format", "mp3");
  } else if (currentDownload!.downloadFormat.format === FileFormat.MP4) {
    const { quality } = currentDownload!.downloadFormat;
    requestArgs.push("-f", `bv[height<=${quality}]+ba/b[height<=${quality}]`)
  }

  new Promise<void>((resolve, reject) => {
    const ytdlp = spawn("yt-dlp", [
      ...cookieArgs,
      "-P", options.outputDirectory,
      "--newline",
      "--progress-template", "download:[nebbysytdlp:DL_PROGRESS] %(progress._percent_str)s",
      ...requestArgs,
      currentDownload!.url,
    ], {
      stdio: ['ignore', 'pipe', 'inherit']
    });

    killProcess = () => {
      return ytdlp.kill('SIGTERM');
    };

    ytdlp.on('close', (code, signal) => {
      if (signal === 'SIGTERM') {
        resolve(); // killed intentionally, don't reject
      } else if (code === 0) {
        console.log(`Successfully downloaded ${video.url} (${video.title})`)
        notifyDownloadFinished();
        requestNextVideo();
        resolve();
      } else {
        reject(new Error(`yt-dlp exited with code ${code}`));
      }
    });

    ytdlp.stdout!.on('data', (chunk: Buffer) => {
      const line = chunk.toString();
      if (line.includes('[nebbysytdlp:DL_PROGRESS]')) {
        const tokens = line.split(' ').filter((sub) => sub.length > 0);

        if (tokens.length < 2) {
          console.error("Failed to parse progress for", currentDownload?.url, `(${currentDownload?.title})`)
          return
        }

        const progressStr = tokens[1];
        const progressWithoutPercent = progressStr.substring(0, progressStr.length-1)
        const progress = Math.round(Number(progressWithoutPercent)) || 0

        currentDownload = {
          ...currentDownload!,
          progress: progress,
        }
        mainWindow?.webContents.send('onVideoDownloadUpdated', currentDownload)
      }
    })

    ytdlp.on('error', reject);
  });
  
  cancelDownloadCallback = killProcess;
}

const resetTrackingVariables = () => {
  currentDownload = null;
  cancelDownloadCallback = null;
}

export default function registerYTDLPHandlers(window: BrowserWindow) {
  mainWindow = window;
  ipcMain.handle('ytdlp:hasYTDLP',               hasYTDLP);
  ipcMain.handle('ytdlp:hasFFMPEG',              hasFFMPEG);
  ipcMain.handle('ytdlp:hasJSRuntime',           hasJSRuntime);
  ipcMain.handle('ytdlp:hasMinimumDependencies', hasMinimumDependencies);

  ipcMain.handle('ytdlp:getMetadata',           getMetadata);
  ipcMain.handle('ytdlp:startDownload',         startDownload);
  ipcMain.handle('ytdlp:cancelDownload',        cancelDownload);
  ipcMain.handle('ytdlp:provideNextVideo', onNextVideoProvided);
}
