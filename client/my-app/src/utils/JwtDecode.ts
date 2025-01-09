import {jwtDecode} from "jwt-decode";

export function getTokenExpirations(token: string): number {
  const decoded: { exp: number } = jwtDecode(token);
  return decoded.exp * 1000; // Convert to milliseconds
}