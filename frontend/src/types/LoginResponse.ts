import { AppUser } from './AppUser';

export interface LoginResponse {
  user: AppUser;
  token: string;
} 