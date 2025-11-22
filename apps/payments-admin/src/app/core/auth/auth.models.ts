export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export interface SessionUser {
  id: string;
  email: string;
  roles: UserRole[];
}

export interface AuthSession {
  token: string;
  user: SessionUser;
  expiresAt?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  token: string;
  roles?: UserRole[];
}
