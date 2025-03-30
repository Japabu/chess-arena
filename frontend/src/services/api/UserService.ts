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

  /**
   * Get current authenticated user
   */
  static async getCurrentUser(): Promise<User> {
    const claims = this.getUserClaims();

    if (!claims || !claims.id) {
      throw new Error("User not authenticated");
    }

    return this.getUserById(claims.id);
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: number): Promise<User> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.json();
  }

  /**
   * Update an existing user
   */
  static async updateUser(
    userId: number,
    userData: Partial<User>
  ): Promise<User> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${this.baseUrl}/user/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  }

  /**
   * Delete a user (admin only)
   */
  static async deleteUser(userId: number): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${this.baseUrl}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Bulk delete multiple users (admin only)
   */
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

  /**
   * Login a user
   */
  static async login(
    username: string,
    password: string
  ): Promise<{ access_token: string }> {
    const response = await fetch(`${this.baseUrl}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  }

  /**
   * Register a new user
   */
  static async register(
    username: string,
    password: string
  ): Promise<{ id: number; username: string }> {
    const response = await fetch(`${this.baseUrl}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  }

  /**
   * Get user claims from token
   */
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

  /**
   * Check if the current user has a specific role
   */
  static hasRole(role: string): boolean {
    const claims = this.getUserClaims();
    return claims?.roles?.includes(role) || false;
  }

  /**
   * Check if the current user is an admin
   */
  static isAdmin(): boolean {
    return this.hasRole("admin");
  }
}
