import type { TournamentMatch } from "./types";
import { API_URL } from "./config";

/**
 * Service for match-related API operations
 */
export class MatchService {
  private static baseUrl = API_URL;

  /**
   * Get all matches
   */
  static async getAllMatches(): Promise<TournamentMatch[]> {
    const response = await fetch(`${this.baseUrl}/match`);
    return response.json();
  }

  /**
   * Get match by ID
   */
  static async getMatchById(matchId: number): Promise<TournamentMatch> {
    const response = await fetch(`${this.baseUrl}/match/${matchId}`);
    return response.json();
  }

  /**
   * Get matches by tournament ID
   */
  static async getMatchesByTournament(
    tournamentId: number
  ): Promise<TournamentMatch[]> {
    const response = await fetch(
      `${this.baseUrl}/tournaments/${tournamentId}/matches`
    );
    return response.json();
  }

  /**
   * Create a new match (admin only)
   */
  static async createMatch(
    matchData: Partial<TournamentMatch>
  ): Promise<TournamentMatch> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${this.baseUrl}/match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(matchData),
    });
    return response.json();
  }

  /**
   * Update an existing match
   */
  static async updateMatch(
    matchId: number,
    matchData: Partial<TournamentMatch>
  ): Promise<TournamentMatch> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${this.baseUrl}/match/${matchId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(matchData),
    });
    return response.json();
  }

  /**
   * Delete a match
   */
  static async deleteMatch(matchId: number): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${this.baseUrl}/match/${matchId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
