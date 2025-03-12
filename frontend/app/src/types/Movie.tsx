export default interface Movie {
    id: number;
    title: string;
    overview?: string;
    release_date: string;
    vote_average: number;
    poster_path: string;
    is_watched: boolean;
    popularity?: number;
    backdrop_path?: string;
    vote_count?: number;
    comments?: [
      {
        "id": 0,
        "user_id": 0,
        "user_name": "string",
        "content": "string"
      }
    ]
}

// Age
// Length
// Producer + Director + Casting

