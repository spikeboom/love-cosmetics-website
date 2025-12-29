export interface AuthState {
  isLoggedIn: boolean;
  userName: string;
}

export interface AuthOperations {
  refreshAuth: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

export interface AuthContextType extends AuthState, AuthOperations {}
