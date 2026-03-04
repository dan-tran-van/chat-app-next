"use client";
import axios, { AxiosInstance } from "axios";
import { UserModel } from "../models/User";
import { createContext, useState } from "react";
import { useRouter } from "next/navigation";

import AuthService from "../services/AuthService";
import authHeader from "../services/AuthHeader";

const DefaultProps = {
  login: () => null,
  logout: () => null,
  authAxios: axios,
  user: null,
};

export interface AuthProps {
  login: (username: string, password: string) => any;
  logout: () => void;
  authAxios: AxiosInstance;
  user: UserModel | null;
}

export const AuthContext = createContext<AuthProps>(DefaultProps);

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState(() => AuthService.getCurrentUser());

  async function login(username: string, password: string) {
    const data = await AuthService.login(username, password);
    setUser(data);
    return data;
  }

  function logout() {
    AuthService.logout();
    setUser(null);
    router.push("/login");
  }

  // axios instance for making requests
  const authAxios = axios.create();

  // request interceptor for adding token
  authAxios.interceptors.request.use((config) => {
    // add  token to request headers
    config.headers = authHeader();
    return config;
  });

  authAxios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        logout();
      }
      return Promise.reject(error);
    },
  );
  return (
    <AuthContext.Provider value={{ login, logout, authAxios, user }}>
      {children}
    </AuthContext.Provider>
  );
};
