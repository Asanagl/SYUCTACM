package model

import (
	"time"

	"gorm.io/gorm"
)

// Base contains common columns for all models.
type Base struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// User represents a member or admin account
type User struct {
	Base
	Username     string `gorm:"uniqueIndex;size:64;not null" json:"username"`
	PasswordHash string `gorm:"size:255;not null" json:"-"`
	Nickname     string `gorm:"size:64" json:"nickname"`
	Email        string `gorm:"size:128" json:"email"`
	Role         string `gorm:"size:32;default:'member'" json:"role"` // admin, member, candidate, alumni
	StudentNumber string `gorm:"size:32" json:"student_number"`
	Grade        string `gorm:"size:16" json:"grade"` // e.g. 2024, 2025
	Major        string `gorm:"size:64" json:"major"`
	CFHandle     string `gorm:"size:64" json:"cf_handle"`
	NowCoderID   string `gorm:"size:64" json:"nowcoder_id"`
	AtCoderID    string `gorm:"size:64" json:"atcoder_id"`
	Bio          string `gorm:"size:512" json:"bio"`
	IsActive     bool   `gorm:"default:true" json:"is_active"`
}

// Announcement represents club news or notices
type Announcement struct {
	Base
	Title     string `gorm:"size:255;not null" json:"title"`
	Content   string `gorm:"type:text;not null" json:"content"`
	Category  string `gorm:"size:64;default:'news'" json:"category"` // news, contest, recruit
	IsPinned  bool   `gorm:"default:false" json:"is_pinned"`
	AuthorID  uint   `json:"author_id"`
	Author    User   `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
}
