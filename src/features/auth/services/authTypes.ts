export type UserRole = "admin" | "user" | string;

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

export type RegisterCredentials = {
  name: string;
  password: string;
};

export type TokenResponse = {
  access_token: string;
  token_type: string;
};

export type JwtPayload = {
  user_id?: string;
  username?: string;
  role?: UserRole;
  exp?: number;
};

export type RegisterResponse = {
  id: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
