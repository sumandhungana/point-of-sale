// export interface PermissionResponse {
//     module: string;
//     permissions: string[];
// }
//
// export interface LoginData {
//     token: string;
//     message: string;
//     userInfo: UserInfo;
// }
//
// export interface LoginApiResponse {
//     code: number;
//     message: string;
//     data: LoginData;
// }
//
// // export interface AuthContextType {
// //     user: UserInfo | null;
// //     token: string | null;
// //     isAuthenticated: boolean;
// //     isLoading: boolean;
// //     login: (authData: LoginData) => void;
// //     logout: () => void;
// // }
// export interface AppUser {
//     id: string;
//     username: string;
//     role: string;
//     name?: string;
//     email?: string;
//     profileImage?: string | null;
//     imagePath?: string | null;
//     branch?: string;
//     company?: string;
//     phone?: string;
//     address?: string;
//     pan?: string;
//     remarks?: string;
//     enable?: boolean;
// }
//
// export interface UserInfo {
//     id: number;
//     userId: string;
//     userName: string;
//     email: string;
//     enabled: string;
//     imagePath: string;
//     subscriptionType: string;
//     subscriptionStartDate: string;
//     subscriptionEndDate: string;
//     isSubscriptionActive: boolean;
//     hasUsedTrial: boolean;
//     permissionResponse: PermissionResponse;
//     subscriptionStatus: string;
//     permission: string[];
//     role: string;
// }
//
// export interface LoginUserUseCaseResponse {
//     token: string;
//     message: string;
//     userInfo: UserInfo;
// }
//
// export interface RestResponse<T> {
//     status?: string;
//     data?: T;
//     message?: string;
//     error?: string;
// }
//
// export interface JwtPayload {
//     nameid: string;
//     unique_name: string;
//     role: string;
//     exp: number;
// }
//
// export interface AuthContextType {
//     user: AppUser | null;
//     token: string | null;
//     isAuthenticated: boolean;
//     isLoading: boolean;
//     login: (username: string, password: string) => Promise<void>;
//     logout: () => Promise<void>;
//     updateUser: (userData: Partial<AppUser>) => void;
//     fetchUserProfile: () => Promise<void>;
// }

export interface PermissionResponse {
    module: string;
    permissions: string[];
}

export interface AppUser {
    id: string;
    username: string;
    role: string;
    name?: string;
    email?: string;
    profileImage?: string | null;
    imagePath?: string | null;
    branch?: string;
    company?: string;
    phone?: string;
    address?: string;
    pan?: string;
    remarks?: string;
    enable?: boolean;
    permissionResponse?: PermissionResponse | PermissionResponse[] | null;
    permissions?: string[];
}

export interface UserInfo {
    id: number;
    userId: string;
    userName: string;
    email: string;
    enabled: string;
    imagePath: string;
    subscriptionType: string;
    subscriptionStartDate: string;
    subscriptionEndDate: string;
    isSubscriptionActive: boolean;
    hasUsedTrial: boolean;
    permissionResponse?: PermissionResponse | PermissionResponse[];
    subscriptionStatus: string;
    permission: string[];
    role: string;
}

export interface LoginUserUseCaseResponse {
    token: string;
    message: string;
    userInfo: UserInfo;
}

export interface RestResponse<T> {
    status?: string;
    data?: T;
    message?: string;
    error?: string;
}

export interface JwtPayload {
    nameid: string;
    unique_name: string;
    role: string;
    exp: number;
}

export interface AuthContextType {
    user: AppUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<AppUser>) => void;
    fetchUserProfile: () => Promise<void>;
    hasPermission?: (permissionName: string) => boolean;
}