export interface User {
  id: string
  username: string
  email: string
  password: string
  avatar: string
  role: 'user' | 'admin'
  createdAt: string
  status: 'active' | 'blocked'
}

export interface UserWithoutPassword extends Omit<User, 'password'> {}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm extends LoginForm {
  username: string
  confirmPassword: string
} 