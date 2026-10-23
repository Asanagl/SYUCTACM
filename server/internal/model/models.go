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
	Title      string `gorm:"size:255;not null" json:"title"`
	Slug       string `gorm:"size:128;index" json:"slug"`
	Category   string `gorm:"size:64;default:'news';index" json:"category"` // news, notice, senior, contest
	Summary    string `gorm:"size:1024" json:"summary"`
	Content    string `gorm:"type:text;not null" json:"content"`
	IsPinned   bool   `gorm:"default:false;index" json:"is_pinned"`
	ViewCount  int    `gorm:"default:0" json:"view_count"`
	AuthorID   uint   `json:"author_id"`
	AuthorName string `gorm:"size:64" json:"author_name"`
}

type WikiPage struct {
	Base
	Title         string `gorm:"size:255;not null" json:"title"`
	Content       string `gorm:"type:text;not null" json:"content"`
	GroupName     string `gorm:"size:64;not null;default:''" json:"group_name"`
	CreatedBy     string `gorm:"size:64" json:"created_by"`
	UpdatedBy     string `gorm:"size:64" json:"updated_by"`
	RevisionCount int    `gorm:"default:0" json:"revision_count"`
}

type WikiRevision struct {
	Base
	PageID  uint   `gorm:"index;not null" json:"page_id"`
	Title   string `gorm:"size:255;not null" json:"title"`
	Content string `gorm:"type:text;not null" json:"content"`
	Editor  string `gorm:"size:64" json:"editor"`
}

type Survey struct {
	Base
	Title       string     `gorm:"size:255;not null" json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	IsPublic    bool       `gorm:"default:false" json:"is_public"`
	Status      string     `gorm:"size:16;default:'draft';index" json:"status"` // draft, published, closed
	Deadline    *time.Time `json:"deadline"`
	CreatedBy   string     `gorm:"size:64" json:"created_by"`
}

type Question struct {
	Base
	SurveyID  uint   `gorm:"index;not null" json:"survey_id"`
	Title     string `gorm:"size:500;not null" json:"title"`
	Type      string `gorm:"size:16;not null" json:"type"` // single, multi, text, textarea
	Required  bool   `gorm:"default:false" json:"required"`
	Options   string `gorm:"type:text" json:"options"` // JSON 字符串数组，仅选择题使用
	SortOrder int    `gorm:"default:0" json:"sort_order"`
}

type Submission struct {
	Base
	SurveyID    uint   `gorm:"index;not null;uniqueIndex:idx_submissions_survey_user" json:"survey_id"`
	UserID      *uint  `gorm:"uniqueIndex:idx_submissions_survey_user" json:"user_id"` // 可空 = 匿名；PG 中 NULL 不参与唯一冲突，匿名可多条
	SubmitterIP string `gorm:"size:64" json:"submitter_ip"`
}

type Answer struct {
	Base
	SubmissionID uint   `gorm:"index;not null" json:"submission_id"`
	QuestionID   uint   `gorm:"index;not null" json:"question_id"`
	ValueText    string `gorm:"type:text" json:"value_text"`    // single / text / textarea
	ValueOptions string `gorm:"type:text" json:"value_options"` // multi，JSON 数组字符串
}

type SiteConfig struct {
	Key       string    `gorm:"primaryKey;size:64" json:"key"`
	Value     string    `gorm:"type:text;not null" json:"value"`
	UpdatedAt time.Time `json:"updated_at"`
}
