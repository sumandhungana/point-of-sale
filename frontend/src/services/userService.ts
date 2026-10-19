// ============================================================
// AUTH HEADERS
// ============================================================


// ============================================================
// GET USERS
// ============================================================

export interface User {
    userId: number;
    userName: string;
    role: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    memberId?: number | null; // Selected member association
}

export interface Member {
    id: number;
    name: string;
}

