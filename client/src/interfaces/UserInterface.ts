import type { RoleInfo } from "./AuthInterface";

export interface UserColumns {
    user_id: number;
    profile_picture?: string | null;
    name: string;
    username: string;
    role?: RoleInfo;
    is_deleted?: boolean;
}

export interface UserFieldErrors {
    profile_picture?: string[];
    name?: string[];
    username?: string[];
    role?: string[];
    password?: string[];
    password_confirmation?: string[];
}
