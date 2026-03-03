import API from "../../../../api";
import { AuthModel, UserModel } from "./_models";

export const LOGIN_URL = `/login`;
export const REGISTER_URL = `/register`;
export const LOGOUT_URL = `/logout`;
// export const REQUEST_PASSWORD_URL = `/forgot-password`; 
export const GET_USER_BY_ACCESSTOKEN_URL = `/profile`;

// Server should return AuthModel
export function login(email: string, password: string) {
  return API.post<AuthModel>(LOGIN_URL, {
    email,
    password,
  });
}

// Server should return AuthModel
export function register(
  email: string,
  firstname: string,
  lastname: string,
  password: string,
  password_confirmation: string
) {
  return API.post(REGISTER_URL, {
    email,
    first_name: firstname,
    last_name: lastname,
    password,
    password_confirmation,
  });
}

// Server should return object => { result: boolean } (Is Email in DB)
export function requestPassword(email: string) {
  // Endpoint not available in backend
  console.warn("Forgot Password endpoint not implemented in backend");
  return Promise.reject("Feature not available");
  // return API.post<{ result: boolean }>(REQUEST_PASSWORD_URL, {
  //   email,
  // });
}

export function logout() {
  return API.post(LOGOUT_URL);
}

export function getUserByToken() {
  return API.get<UserModel>(GET_USER_BY_ACCESSTOKEN_URL);
}
