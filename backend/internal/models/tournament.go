package models

import (
	"time"
)

// TournamentStatus represents the status of a chess tournament
type TournamentStatus string

const (
	// TournamentStatusOpen indicates a tournament that is open for registration
	TournamentStatusOpen TournamentStatus = "open"
	// TournamentStatusInProgress indicates a tournament that is currently being played
	TournamentStatusInProgress TournamentStatus = "in_progress"
	// TournamentStatusCompleted indicates a tournament that has been completed
	TournamentStatusCompleted TournamentStatus = "completed"
)

// Tournament represents a chess tournament
type Tournament struct {
	ID        int              `json:"id"`
	Name      string           `json:"name"`
	Status    TournamentStatus `json:"status"`
	StartDate *time.Time       `json:"startDate,omitempty"`
	EndDate   *time.Time       `json:"endDate,omitempty"`
	UserIDs   []int            `json:"userIds"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
}

// TournamentMatch represents a match in a tournament
type TournamentMatch struct {
	ID           int        `json:"id"`
	TournamentID int        `json:"tournamentId"`
	MatchID      int        `json:"matchId"`
	Round        int        `json:"round"`
	Tournament   *Tournament `json:"tournament,omitempty"`
	Match        *Match      `json:"match,omitempty"`
}

// CreateTournamentInput represents the data needed to create a new tournament
type CreateTournamentInput struct {
	Name    string `json:"name" validate:"required"`
	UserIDs []int  `json:"userIds" validate:"required"`
}

// UpdateTournamentInput represents the data needed to update a tournament
type UpdateTournamentInput struct {
	Name      string           `json:"name,omitempty"`
	Status    TournamentStatus `json:"status,omitempty"`
	StartDate *time.Time       `json:"startDate,omitempty"`
	EndDate   *time.Time       `json:"endDate,omitempty"`
	UserIDs   []int            `json:"userIds,omitempty"`
}

// TournamentResponse represents a tournament in API responses
type TournamentResponse struct {
	ID        int              `json:"id"`
	Name      string           `json:"name"`
	Status    TournamentStatus `json:"status"`
	StartDate *time.Time       `json:"startDate,omitempty"`
	EndDate   *time.Time       `json:"endDate,omitempty"`
	UserIDs   []int            `json:"userIds"`
	CreatedAt time.Time        `json:"createdAt"`
	UpdatedAt time.Time        `json:"updatedAt"`
}

// ToResponse converts a Tournament to a TournamentResponse
func (t *Tournament) ToResponse() TournamentResponse {
	return TournamentResponse{
		ID:        t.ID,
		Name:      t.Name,
		Status:    t.Status,
		StartDate: t.StartDate,
		EndDate:   t.EndDate,
		UserIDs:   t.UserIDs,
		CreatedAt: t.CreatedAt,
		UpdatedAt: t.UpdatedAt,
	}
}

// TournamentMatchResponse represents a tournament match in API responses
type TournamentMatchResponse struct {
	ID           int                `json:"id"`
	TournamentID int                `json:"tournamentId"`
	MatchID      int                `json:"matchId"`
	Round        int                `json:"round"`
	Tournament   *TournamentResponse `json:"tournament,omitempty"`
	Match        *MatchResponse      `json:"match,omitempty"`
}

// ToResponse converts a TournamentMatch to a TournamentMatchResponse
func (tm *TournamentMatch) ToResponse() TournamentMatchResponse {
	response := TournamentMatchResponse{
		ID:           tm.ID,
		TournamentID: tm.TournamentID,
		MatchID:      tm.MatchID,
		Round:        tm.Round,
	}

	if tm.Tournament != nil {
		tournamentResp := tm.Tournament.ToResponse()
		response.Tournament = &tournamentResp
	}

	if tm.Match != nil {
		matchResp := tm.Match.ToResponse()
		response.Match = &matchResp
	}

	return response
} 