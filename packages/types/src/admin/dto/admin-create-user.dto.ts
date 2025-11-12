export interface AdminCreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: string | string[];
  data?: Record<string, unknown>;
}
