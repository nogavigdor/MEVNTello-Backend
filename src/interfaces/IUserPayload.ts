// interface UserPayload
export interface UserPayload {
    _id: string;
    email: string;
    username: string;
    role: 'user' | 'admin';
    password: string;
  }
  