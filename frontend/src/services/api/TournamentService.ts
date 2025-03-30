import type { Tournament } from "./types";
import { API_URL } from "./config";

/**
 * Service for tournament-related API operations
 */
export class TournamentService {
  private static baseUrl = API_URL;

  /**
   * Get all tournaments
   */
  static async getAllTournaments(): Promise<Tournament[]> {
    const response = await fetch(`${this.baseUrl}/tournaments`);
    return response.json();
  }

  /**
   * Get tournament by ID
   */
  static async getTournamentById(tournamentId: number): Promise<Tournament> {
    const response = await fetch(`${this.baseUrl}/tournaments/${tournamentId}`);
    return response.json();
  }

  /**
   * Create a new tournament (admin only)
   */
  static async createTournament(
    tournamentData: Partial<Tournament>
  ): Promise<Tournament> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${this.baseUrl}/tournaments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tournamentData),
    });
    return response.json();
  }

  /**
   * Delete a tournament (admin only)
   */
  static async deleteTournament(tournamentId: number): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${this.baseUrl}/tournaments/${tournamentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Bulk delete multiple tournaments (admin only)
   */
  static async bulkDeleteTournaments(tournamentIds: number[]): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${this.baseUrl}/tournaments/bulk-delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ tournamentIds }),
    });
  }

  /**
   * Register a participant for a tournament (admin only)
   */
  static async registerForTournament(tournamentId: number): Promise<any> {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${this.baseUrl}/tournaments/${tournamentId}/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  }

  /**
   * Start a tournament (admin only)
   */
  static async startTournament(tournamentId: number): Promise<any> {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `${this.baseUrl}/tournaments/${tournamentId}/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.json();
  }
}
