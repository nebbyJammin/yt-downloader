import type { VideoDownloadContext } from "$lib/downloadsModel";

export const mockVideo: VideoDownloadContext = {
  "url": "https://www.youtube.com/watch?v=n1q-R6iNxRE",
  "title": "Camellia - Dokuhebi / Venomous Snake (feat. Hatsune Miku) [ElectroSwing]",
  "channel": "Camellia Official",
  "duration": 229,
  "timestamp": 1679443200,
  "view_count": 1700000,
  "thumbnail": "https://img.youtube.com/vi/n1q-R6iNxRE/mqdefault.jpg",
  "downloadFormat": {
    "format": 0,
    "quality": 3
  },
  "embedThumbnail": true,
  "embedMetadata": true,
  "downloadId": -1,
}

export const mockData: VideoDownloadContext[] = [
  {
    "url": "https://www.youtube.com/watch?v=n1q-R6iNxRE",
    "title": "Camellia - Dokuhebi / Venomous Snake (feat. Hatsune Miku) [ElectroSwing]",
    "channel": "Camellia Official",
    "duration": 229,
    "timestamp": 1679443200,
    "view_count": 1700000,
    "thumbnail": "https://img.youtube.com/vi/n1q-R6iNxRE/mqdefault.jpg",
    "downloadFormat": {
      "format": 0,
      "quality": 3
    },
    "embedThumbnail": true,
    "embedMetadata": true,
    "downloadId": 0,
  },
  {
    "url": "https://www.youtube.com/watch?v=cq8WquQioXY",
    "title": "Camellia - Play-With-Fire (Hiasobi) Kasane Teto Cover",
    "channel": "Camellia Official",
    "duration": 248,
    "timestamp": 1742601600,
    "view_count": 800000,
    "thumbnail": "https://img.youtube.com/vi/cq8WquQioXY/mqdefault.jpg",
    "downloadFormat": {
      "format": 0,
      "quality": 3
    },
    "embedThumbnail": true,
    "embedMetadata": true,
    "downloadId": 1,
  },
  {
    "url": "https://www.youtube.com/watch?v=IWbOiOg_lro",
    "title": "Camellia - Nasty * Nasty * Spell (from Blackmagik Blazing)",
    "channel": "Camellia Official",
    "duration": 264,
    "timestamp": 1616371200,
    "view_count": 832000,
    "thumbnail": "https://img.youtube.com/vi/IWbOiOg_lro/mqdefault.jpg",
    "downloadFormat": {
      "format": 0,
      "quality": 3
    },
    "embedThumbnail": true,
    "embedMetadata": true,
    "downloadId": 2,
  },
  {
    "url": "https://www.youtube.com/watch?v=od4QcDPpNVk",
    "title": "Camellia - Play With Fire / Hiasobi (feat. Hatsune Miku) 「Electroswing」",
    "channel": "Camellia Official",
    "duration": 248,
    "timestamp": 1647907200,
    "view_count": 9200000,
    "thumbnail": "https://img.youtube.com/vi/od4QcDPpNVk/mqdefault.jpg",
    "downloadFormat": {
      "format": 0,
      "quality": 3
    },
    "embedThumbnail": true,
    "embedMetadata": true,
    "downloadId": 3,
  },
  {
    "url": "https://www.youtube.com/watch?v=W8xtRz5b_JA",
    "title": "Camellia feat. VIVI ZENA - Badly [From Beat Saber OST 8]",
    "channel": "Camellia Official",
    "duration": 265,
    "timestamp": 1769040000,
    "view_count": 69000,
    "thumbnail": "https://img.youtube.com/vi/W8xtRz5b_JA/mqdefault.jpg",
    "downloadFormat": {
      "format": 0,
      "quality": 3
    },
    "embedThumbnail": true,
    "embedMetadata": true,
    "downloadId": 4,
  },
  {
    "url": "https://www.youtube.com/watch?v=1WD6Xlm4vvY",
    "title": "[U.U.F.O.] Tr.02 (The) Red * Room",
    "channel": "Camellia Official",
    "duration": 235,
    "timestamp": 1647907200,
    "view_count": 507000,
    "thumbnail": "https://img.youtube.com/vi/1WD6Xlm4vvY/mqdefault.jpg",
    "downloadFormat": {
      "format": 0,
      "quality": 3
    },
    "embedThumbnail": true,
    "embedMetadata": true,
    "downloadId": 5,
  }
] as const;
