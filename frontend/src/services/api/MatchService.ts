import type { TournamentMatch } from "./types";
import { API_URL } from "./config";

interface MatchRequest {
  white: { id: number };
  black: { id: number };
}

export class MatchService {
  private static baseUrl = API_URL;

  /**
   * Get all matches
   */
  static async getAllMatches(): Promise<TournamentMatch[]> {
    const response = await fetch(`${this.baseUrl}/matches`);
    return response.json();
  }

  /**
   * Create a new match (admin only)
   */
  static async createMatch(matchData: MatchRequest): Promise<TournamentMatch> {
    const token = localStorage.getItem("token");
    const response = await fetch(`${this.baseUrl}/admin/matches`, {
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
   * Delete a match
   */
  static async deleteMatch(matchId: number): Promise<void> {
    const token = localStorage.getItem("token");
    await fetch(`${this.baseUrl}/matches/${matchId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
