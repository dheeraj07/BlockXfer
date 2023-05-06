import { useState, createContext, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mobileInput, setMobileInput] = useState(0);
  const [mobileNumber, setMobileNumber] = useState();

  const login = (user) => {
    setUser(user);
  };

  const logOut = () => {
    setUser(null);
  };

  const setMobileNumberAuth = (value) => {
    setMobileInput(value);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logOut,
        mobileInput,
        setMobileNumberAuth,
        mobileNumber,
        setMobileNumber,
        setMobileInput,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
