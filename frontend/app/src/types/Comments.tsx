export default interface Comments {
    id: number;
    user_id: number;
    movie_id: number;
    comment: string;
    date: string;
    // user: {
    //     id: number;
    //     username: string;
    //     email: string;
    //     firstName: string;
    //     lastName: string;
    //     avatar: string;
    // };
}