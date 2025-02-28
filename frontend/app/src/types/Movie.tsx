export default interface Movie {
    imdb_id: string;
    production_year: number;
    imdb_rating: number;
    watched: boolean;
    language: {
        en: {
            title: string;
            poster_path: string;
            audio: string;
        },
        fr: {
            title: string;
            poster_path: string;
            audio: string;
        }
    },
    videos_quality: {
        sd_url: string;
        hd_url: string;
        full_hd_url: string;
    };
    nb_downloads: number;
    nb_peers: number;
    nb_seeders: number;
    genres: string[];
    summary: string;
    casting: {
        producer: string;
        director: string;
        actors: string[];
    };
}

