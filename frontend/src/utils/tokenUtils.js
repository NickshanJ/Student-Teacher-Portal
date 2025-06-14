// utils/tokenUtils.js
export const isTokenExpired = (token) => {
  if (!token) return true;

  const payload = JSON.parse(atob(token.split('.')[1]));
  const expiry = payload.exp * 1000; // convert to milliseconds
  return Date.now() > expiry;
};