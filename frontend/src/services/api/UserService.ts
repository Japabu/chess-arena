import type { User } from "./types";
import { API_URL } from "./config";

export interface GetUsersResponse {
  users: User[];
}

export class UserService {
  private static baseUrl = API_URL;

  static async getAllUsers(): Promise<GetUsersResponse> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${this.baseUrl}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async getUserById(userId: number): Promise<User> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${this.baseUrl}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }

  static async deleteUser(userId: number): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${this.baseUrl}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static async bulkDeleteUsers(userIds: number[]): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${this.baseUrl}/admin/users/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds }),
    });
  }

  static async login(
    username: string,
    password: string
  ): Promise<{ access_token: string }> {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  }

  static async register(username: string, password: string): Promise<void> {
    await fetch(`${this.baseUrl}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
  }

  static getUserClaims(): {
    id: number;
    username: string;
    roles: string[];
  } | null {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
      // Extract payload from JWT
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch (error) {
      return null;
    }
  }

  static hasRole(role: string): boolean {
    const claims = this.getUserClaims();
    return claims?.roles?.includes(role) || false;
  }

  static isAdmin(): boolean {
    return this.hasRole("admin");
  }
}
