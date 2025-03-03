export default interface User {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    language: 'en' | 'fr';
    is_logged_in: boolean;
}