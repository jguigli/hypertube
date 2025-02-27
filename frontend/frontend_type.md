
# Flux :

On a deux sources de liens pour les torrents :
- piratebay.org / yts.pro


Fronted Movie class:

class Movie:
- IMDB ID
- Production year
- langues [
    - fr [
      - Title
      - 720p video_url
      - 1080p video_url
      - 4k video_url
      - subtitles
    ]
    - en [
      - Title
      - 720p video_url
      - 1080p video_url
      - 4k video_url
      - subtitles
    ]
]

```typescript
interface Movie {
    imdb_id: number;
    production_year: number;
    imdb_rating: number;
    watched: boolean;
    language: {
        en: {
            title: string;
            poster_path: string;
            audio: MediaStreamAudioSourceNode;
        },
        fr: {
            title: string;
            poster_path: string;
            audio: MediaStreamAudioSourceNode;
        }
    },
    videos_quality: {
        sd_url: string;
        hd_url: string;
        full_hd_url: string;
    }
    nb_downloads: number;
    nb_peers: number;
    nb_seeders: number;
    genres: string[];
    summary: string;
    casting: {
        producer: string;
        director: string;
        actors: string[];
    }
}
```