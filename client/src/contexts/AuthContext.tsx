import React, { useContext } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

interface ICurrentUser {
  username: string;
  token: string;
}

interface IAuthState {
  currentUser: ICurrentUser;
  signIn?: (userData: ICurrentUser) => void;
  signOut?: () => void;
  isAuthenticated: boolean;
}

const initialAuthState: IAuthState = {
  currentUser: { username: '', token: '' },
  isAuthenticated: false
};
const AuthContext = React.createContext<IAuthState>(initialAuthState);

function AuthProvider({ children }: any) {
  const [currentUser, setCurrentUser] = useLocalStorage<ICurrentUser>(
    'currentUser',
    initialAuthState.currentUser
  );
  function signIn(userData: ICurrentUser) {
    setCurrentUser(userData);
  }

  function signOut() {
    setCurrentUser(initialAuthState.currentUser);
  }

  let isAuthenticated = Boolean(currentUser.username);

  const value = {
    currentUser,
    signIn,
    signOut,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

export { useAuth, AuthProvider };
