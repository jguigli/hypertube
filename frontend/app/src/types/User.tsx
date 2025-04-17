export default interface User {
    id?: number;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    language: 'en' | 'fr';
    is_logged_in: boolean;
}