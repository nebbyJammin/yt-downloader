// yt-dlp --cookies-from-browser firefox --skip-download --flat-playlist --extractor-args  youtubetab:approximate-date -O "url,title,channel,duration,timestamp,view_count" 'https://www.youtube.com/playlist?list=PLKLMsHwPzDZHB9n7mneI5vI5ZdKjiu02p'

export type VideoMetadata = {
  url: string  
  title: string
  channel: string
  duration: number
  timestamp: number
  view_count: number
}

export enum FileFormat {
  MP3,
  MP4,
}

export enum MP3DownloadQuality {
  KBS96,
  KBS128,
  KBS256,
  KBS320,
}

export enum MP4DownloadQuality {
  P144,
  P360,
  P480,
  P720,
  P1080,
}

export type DownloadQuality = 
  | MP3DownloadQuality
  | MP4DownloadQuality

export function getReadableMP3DownloadQuality(q: MP3DownloadQuality) {
  return {
    [MP3DownloadQuality.KBS96]: "96kb/s",
    [MP3DownloadQuality.KBS128]: "128kb/s",
    [MP3DownloadQuality.KBS256]: "256kb/s",
    [MP3DownloadQuality.KBS320]: "320kb/s",
  }[q]
}

export function getReadableMP4DownloadQuality(q: MP4DownloadQuality) {
  return {
    [MP4DownloadQuality.P144]: "144p",
    [MP4DownloadQuality.P360]: "360p",
    [MP4DownloadQuality.P480]: "480p",
    [MP4DownloadQuality.P720]: "720p",
    [MP4DownloadQuality.P1080]: "1080p",
  }[q]
}

export type DownloadFormat = 
  | { format: FileFormat.MP3, quality: MP3DownloadQuality }
  | { format: FileFormat.MP4, quality: MP4DownloadQuality }

export type VideoDownloadContext = {
  downloadId: number,
  downloadFormat: DownloadFormat,
  embedThumbnail: boolean,
} & VideoMetadata

export enum DownloadRequestResult {
  CANCELLED,
  FAILED,
  SUCCESS,
}

export type VideoDownloadResultContext = {
  requestResult: DownloadRequestResult
} & VideoDownloadContext
