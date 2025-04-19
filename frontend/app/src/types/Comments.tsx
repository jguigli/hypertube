export default interface CommentType {
    id: number;
    user_id: number;
    user_name: string;
    parent_id: number | null;
    content: string;
    replies: CommentType[];
    timestamp: number;
    avatarUrl: string;
    items?: CommentType[];
    name?: string;
    video_id?: number;
}