package model

import (
	"time"

	"gorm.io/gorm"
)

type Base struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type User struct {
	Base
	Username      string `gorm:"uniqueIndex;size:64;not null" json:"username"`
	PasswordHash  string `gorm:"size:255;not null" json:"-"`
	Nickname      string `gorm:"size:64" json:"nickname"`
	Email         string `gorm:"size:128" json:"email"`
	Role          string `gorm:"size:32;default:'member'" json:"role"` // admin, member, guest
	StudentNumber string `gorm:"size:32" json:"student_number"`
	Grade         string `gorm:"size:16" json:"grade"`
	Major         string `gorm:"size:64" json:"major"`
	CFHandle      string `gorm:"size:64" json:"cf_handle"`
	Bio           string `gorm:"size:512" json:"bio"`
	IsActive      bool   `gorm:"default:true" json:"is_active"`
}

type Article struct {
	Base
	Title       string `gorm:"size:255;not null" json:"title"`
	Slug        string `gorm:"size:128;index" json:"slug"`
	Category    string `gorm:"size:64;default:'news';index" json:"category"` // news, notice, senior, contest
	Summary     string `gorm:"size:1024" json:"summary"`
	Content     string `gorm:"type:text;not null" json:"content"`
	IsPinned    bool   `gorm:"default:false;index" json:"is_pinned"`
	ViewCount   int    `gorm:"default:0" json:"view_count"`
	AuthorID    uint   `json:"author_id"`
	AuthorName  string `gorm:"size:64" json:"author_name"`
}

type SiteConfig struct {
	Key       string    `gorm:"primaryKey;size:64" json:"key"`
	Value     string    `gorm:"type:text;not null" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}
