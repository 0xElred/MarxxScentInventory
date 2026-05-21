export interface RoleInfo {
    role_id?: number;
    name: string;
}

export interface UserDetails {
    user_id?: number;
    name: string;
    username?: string;
    profile_picture?: string | null;
    role?: RoleInfo;
    token?: string;
}

export interface LoginCredentialsErrorFields {
    username?: string[];
    password?: string[];
}
