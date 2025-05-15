export interface User {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
    emailVerified: boolean;
  }
  
  export interface AuthError {
    code: string;
    message: string;
  }