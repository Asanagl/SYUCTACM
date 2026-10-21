package handler

import (
	"encoding/csv"
	"encoding/json"
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/syuctacm/syuctacm/server/internal/database"
	"github.com/syuctacm/syuctacm/server/internal/model"
	"gorm.io/gorm"
)

type SurveyQuestionReq struct {
	Title     string   `json:"title" binding:"required,max=500"`
	Type      string   `json:"type" binding:"required,oneof=single multi text textarea"`
	Required  bool     `json:"required"`
	Options   []string `json:"options"`
	SortOrder int      `json:"sort_order"`
}

type SurveyCreateReq struct {
	Title       string              `json:"title" binding:"required,max=255"`
	Description string              `json:"description"`
	IsPublic    bool                `json:"is_public"`
	Deadline    *time.Time          `json:"deadline"`
	Questions   []SurveyQuestionReq `json:"questions"`
}

type SurveyUpdateReq struct {
	Title       string              `json:"title" binding:"required,max=255"`
	Description string              `json:"description"`
	IsPublic    *bool               `json:"is_public"`
	Deadline    *time.Time          `json:"deadline"`
	Questions   []SurveyQuestionReq `json:"questions"`
}

type submitAnswerReq struct {
	QuestionID   uint     `json:"question_id" binding:"required"`
	ValueText    string   `json:"value_text"`
	ValueOptions []string `json:"value_options"`
}

type submitSurveyReq struct {
	Answers []submitAnswerReq `json:"answers" binding:"required"`
}

func parseOptions(raw string) []string {
	if raw == "" {
		return []string{}
	}
	var opts []string
	if err := json.Unmarshal([]byte(raw), &opts); err != nil {
		return []string{}
	}
	return opts
}

func getLoggedInUserID(c *gin.Context) (uint, bool) {
	userIDVal, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}
	userID, ok := userIDVal.(uint)
	return userID, ok
}

func isAdmin(c *gin.Context) bool {
	roleVal, exists := c.Get("role")
	return exists && roleVal == "admin"
}

func surveyDeadlinePassed(s *model.Survey) bool {
	return s.Deadline != nil && time.Now().After(*s.Deadline)
}

func buildSurveyDetail(survey *model.Survey, questions []model.Question) gin.H {
	qs := make([]gin.H, 0, len(questions))
	for _, q := range questions {
		qs = append(qs, gin.H{
			"id":         q.ID,
			"title":      q.Title,
			"type":       q.Type,
			"required":   q.Required,
			"options":    parseOptions(q.Options),
			"sort_order": q.SortOrder,
		})
	}
	return gin.H{
		"id":          survey.ID,
		"title":       survey.Title,
		"description": survey.Description,
		"is_public":   survey.IsPublic,
		"status":      survey.Status,
		"deadline":    survey.Deadline,
		"created_at":  survey.CreatedAt,
		"questions":   qs,
	}
}

// ---- 用户侧 ----

func ListSurveys(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusOK, gin.H{
			"total":     0,
			"page":      1,
			"page_size": 10,
			"items":     []gin.H{},
		})
		return
	}

	type surveyListItem struct {
		ID          uint       `json:"id"`
		Title       string     `json:"title"`
		Description string     `json:"description"`
		IsPublic    bool       `json:"is_public"`
		Deadline    *time.Time `json:"deadline"`
		CreatedAt   time.Time  `json:"created_at"`
	}

	_, loggedIn := getLoggedInUserID(c)

	query := database.DB.Model(&model.Survey{}).
		Where("status = ?", "published").
		Where("deadline IS NULL OR deadline > ?", time.Now())
	if !loggedIn {
		query = query.Where("is_public = ?", true)
	}

	var total int64
	query.Count(&total)

	var items []surveyListItem
	if err := query.Order("id DESC").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取问卷列表失败"})
		return
	}
	if items == nil {
		items = []surveyListItem{}
	}

	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"page":      1,
		"page_size": 50,
		"items":     items,
	})
}

func GetSurvey(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	_, loggedIn := getLoggedInUserID(c)
	if !survey.IsPublic && !loggedIn {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "该问卷为非公开问卷，请先登录"})
		return
	}
	if survey.Status != "published" && !isAdmin(c) {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	var questions []model.Question
	if err := database.DB.Where("survey_id = ?", survey.ID).Order("sort_order ASC, id ASC").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取问卷题目失败"})
		return
	}

	c.JSON(http.StatusOK, buildSurveyDetail(&survey, questions))
}

func SubmitSurvey(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	userID, loggedIn := getLoggedInUserID(c)
	if !survey.IsPublic && !loggedIn {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "该问卷为非公开问卷，请先登录"})
		return
	}

	if survey.Status != "published" || surveyDeadlinePassed(&survey) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该问卷未在征集状态或已过截止时间，无法提交"})
		return
	}

	var req submitSurveyReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误，answers 为必填项"})
		return
	}

	var questions []model.Question
	if err := database.DB.Where("survey_id = ?", survey.ID).Order("sort_order ASC, id ASC").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取问卷题目失败"})
		return
	}
	questionMap := make(map[uint]model.Question, len(questions))
	for _, q := range questions {
		questionMap[q.ID] = q
	}

	answerMap := make(map[uint]submitAnswerReq, len(req.Answers))
	for _, a := range req.Answers {
		if _, ok := questionMap[a.QuestionID]; !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "存在不属于该问卷的题目"})
			return
		}
		answerMap[a.QuestionID] = a
	}

	// 校验每个题目的答案
	for _, q := range questions {
		a, hasAnswer := answerMap[q.ID]
		options := parseOptions(q.Options)
		optionSet := make(map[string]bool, len(options))
		for _, o := range options {
			optionSet[o] = true
		}

		var answered bool
		switch q.Type {
		case "single", "text", "textarea":
			answered = hasAnswer && a.ValueText != ""
		case "multi":
			answered = hasAnswer && len(a.ValueOptions) > 0
		}

		if q.Required && !answered {
			c.JSON(http.StatusBadRequest, gin.H{"error": "必填题目「" + q.Title + "」未作答"})
			return
		}
		if !answered {
			continue
		}

		switch q.Type {
		case "single":
			if !optionSet[a.ValueText] {
				c.JSON(http.StatusBadRequest, gin.H{"error": "题目「" + q.Title + "」的答案不在可选范围内"})
				return
			}
		case "multi":
			for _, v := range a.ValueOptions {
				if !optionSet[v] {
					c.JSON(http.StatusBadRequest, gin.H{"error": "题目「" + q.Title + "」的答案不在可选范围内"})
					return
				}
			}
		}
	}

	// 构建待写入的 Answers（仅包含有作答的题目）
	answers := make([]model.Answer, 0, len(req.Answers))
	for _, a := range req.Answers {
		q := questionMap[a.QuestionID]
		var answered bool
		if q.Type == "multi" {
			answered = len(a.ValueOptions) > 0
		} else {
			answered = a.ValueText != ""
		}
		if !answered {
			continue
		}
		answer := model.Answer{
			QuestionID: a.QuestionID,
			ValueText:  a.ValueText,
		}
		if q.Type == "multi" {
			data, err := json.Marshal(a.ValueOptions)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "提交失败"})
				return
			}
			answer.ValueOptions = string(data)
		}
		answers = append(answers, answer)
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if loggedIn {
			var existing model.Submission
			res := tx.Where("survey_id = ? AND user_id = ?", survey.ID, userID).First(&existing)
			if res.Error == nil {
				// 已提交过：删除旧答案，写入新答案并刷新 UpdatedAt
				if err := tx.Where("submission_id = ?", existing.ID).Delete(&model.Answer{}).Error; err != nil {
					return err
				}
				for i := range answers {
					answers[i].SubmissionID = existing.ID
				}
				if err := tx.Create(&answers).Error; err != nil {
					return err
				}
				if err := tx.Model(&existing).UpdateColumn("updated_at", time.Now()).Error; err != nil {
					return err
				}
				return nil
			}
			if res.Error != gorm.ErrRecordNotFound {
				return res.Error
			}
		}

		submission := model.Submission{
			SurveyID:    survey.ID,
			SubmitterIP: c.ClientIP(),
		}
		if loggedIn {
			submission.UserID = &userID
		}
		if err := tx.Create(&submission).Error; err != nil {
			return err
		}
		for i := range answers {
			answers[i].SubmissionID = submission.ID
		}
		return tx.Create(&answers).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "提交失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "提交成功"})
}

func GetMySurveySubmission(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	userID, loggedIn := getLoggedInUserID(c)
	if !loggedIn {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "请先登录"})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	var submission model.Submission
	if err := database.DB.Where("survey_id = ? AND user_id = ?", survey.ID, userID).First(&submission).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "尚未提交该问卷"})
		return
	}

	var answers []model.Answer
	if err := database.DB.Where("submission_id = ?", submission.ID).Order("id ASC").Find(&answers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取提交记录失败"})
		return
	}

	items := make([]gin.H, 0, len(answers))
	for _, a := range answers {
		items = append(items, gin.H{
			"question_id":   a.QuestionID,
			"value_text":    a.ValueText,
			"value_options": parseOptions(a.ValueOptions),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           submission.ID,
		"submitted_at": submission.CreatedAt,
		"updated_at":   submission.UpdatedAt,
		"answers":      items,
	})
}

// ---- 管理侧 ----

func ListAdminSurveys(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusOK, gin.H{
			"total":     0,
			"page":      1,
			"page_size": 10,
			"items":     []gin.H{},
		})
		return
	}

	type adminSurveyListItem struct {
		ID              uint       `json:"id"`
		Title           string     `json:"title"`
		Description     string     `json:"description"`
		IsPublic        bool       `json:"is_public"`
		Status          string     `json:"status"`
		Deadline        *time.Time `json:"deadline"`
		CreatedBy       string     `json:"created_by"`
		CreatedAt       time.Time  `json:"created_at"`
		SubmissionCount int64      `json:"submission_count"`
	}

	var total int64
	database.DB.Model(&model.Survey{}).Count(&total)

	var items []adminSurveyListItem
	err := database.DB.Model(&model.Survey{}).
		Select(`surveys.*, (SELECT COUNT(*) FROM submissions WHERE submissions.survey_id = surveys.id AND submissions.deleted_at IS NULL) AS submission_count`).
		Order("id DESC").
		Find(&items).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取问卷列表失败"})
		return
	}
	if items == nil {
		items = []adminSurveyListItem{}
	}

	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"page":      1,
		"page_size": 50,
		"items":     items,
	})
}

func buildQuestionModels(surveyID uint, reqs []SurveyQuestionReq) []model.Question {
	questions := make([]model.Question, 0, len(reqs))
	for _, qr := range reqs {
		optsJSON := ""
		if len(qr.Options) > 0 {
			data, _ := json.Marshal(qr.Options)
			optsJSON = string(data)
		}
		questions = append(questions, model.Question{
			SurveyID:  surveyID,
			Title:     qr.Title,
			Type:      qr.Type,
			Required:  qr.Required,
			Options:   optsJSON,
			SortOrder: qr.SortOrder,
		})
	}
	return questions
}

func CreateAdminSurvey(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var req SurveyCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误，标题与题目格式不正确"})
		return
	}

	usernameVal, exists := c.Get("username")
	username, ok := usernameVal.(string)
	if !exists || !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取当前用户信息失败"})
		return
	}

	survey := model.Survey{
		Title:       req.Title,
		Description: req.Description,
		IsPublic:    req.IsPublic,
		Status:      "draft",
		Deadline:    req.Deadline,
		CreatedBy:   username,
	}
	questions := buildQuestionModels(0, req.Questions)

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&survey).Error; err != nil {
			return err
		}
		for i := range questions {
			questions[i].SurveyID = survey.ID
		}
		if len(questions) > 0 {
			return tx.Create(&questions).Error
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建问卷失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "创建成功",
		"data":    buildSurveyDetail(&survey, questions),
	})
}

func GetAdminSurvey(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	var questions []model.Question
	if err := database.DB.Where("survey_id = ?", survey.ID).Order("sort_order ASC, id ASC").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取问卷题目失败"})
		return
	}

	c.JSON(http.StatusOK, buildSurveyDetail(&survey, questions))
}

func UpdateAdminSurvey(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	var req SurveyUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误，标题与题目格式不正确"})
		return
	}

	updates := map[string]interface{}{
		"title":       req.Title,
		"description": req.Description,
		"deadline":    req.Deadline,
	}
	if req.IsPublic != nil {
		updates["is_public"] = *req.IsPublic
	}

	questions := buildQuestionModels(survey.ID, req.Questions)

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&survey).Updates(updates).Error; err != nil {
			return err
		}
		// 整体替换题目集（硬删除旧题，已存在的回答保留）
		if err := tx.Where("survey_id = ?", survey.ID).Unscoped().Delete(&model.Question{}).Error; err != nil {
			return err
		}
		if len(questions) > 0 {
			if err := tx.Create(&questions).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新问卷失败"})
		return
	}

	database.DB.First(&survey, survey.ID)
	c.JSON(http.StatusOK, buildSurveyDetail(&survey, questions))
}

func UpdateSurveyStatus(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	var req struct {
		Action string `json:"action" binding:"required,oneof=publish close reopen"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误，action 必须为 publish / close / reopen"})
		return
	}

	var target string
	switch req.Action {
	case "publish":
		if survey.Status != "draft" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "仅草稿状态的问卷可以发布"})
			return
		}
		target = "published"
	case "close":
		if survey.Status != "published" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "仅进行中的问卷可以关闭"})
			return
		}
		target = "closed"
	case "reopen":
		if survey.Status != "closed" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "仅已关闭的问卷可以重新开放"})
			return
		}
		target = "published"
	}

	if err := database.DB.Model(&survey).Update("status", target).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新问卷状态失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "状态更新成功", "status": target})
}

func ListSurveySubmissions(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusOK, gin.H{
			"total":     0,
			"page":      1,
			"page_size": 10,
			"items":     []gin.H{},
		})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}

	var total int64
	database.DB.Model(&model.Submission{}).Where("survey_id = ?", survey.ID).Count(&total)

	var submissions []model.Submission
	offset := (page - 1) * pageSize
	if err := database.DB.Where("survey_id = ?", survey.ID).
		Order("id DESC").Offset(offset).Limit(pageSize).
		Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取提交列表失败"})
		return
	}

	// 关联用户名（匿名提交为空字符串）
	usernameMap := map[uint]string{}
	userIDs := make([]uint, 0, len(submissions))
	for _, s := range submissions {
		if s.UserID != nil {
			userIDs = append(userIDs, *s.UserID)
		}
	}
	if len(userIDs) > 0 {
		var users []model.User
		if err := database.DB.Select("id", "username").Where("id IN ?", userIDs).Find(&users).Error; err == nil {
			for _, u := range users {
				usernameMap[u.ID] = u.Username
			}
		}
	}

	type submissionListItem struct {
		ID          uint      `json:"id"`
		UserID      *uint     `json:"user_id"`
		Username    string    `json:"username"`
		SubmitterIP string    `json:"submitter_ip"`
		CreatedAt   time.Time `json:"created_at"`
		UpdatedAt   time.Time `json:"updated_at"`
	}

	items := make([]submissionListItem, 0, len(submissions))
	for _, s := range submissions {
		username := ""
		if s.UserID != nil {
			username = usernameMap[*s.UserID]
		}
		items = append(items, submissionListItem{
			ID:          s.ID,
			UserID:      s.UserID,
			Username:    username,
			SubmitterIP: s.SubmitterIP,
			CreatedAt:   s.CreatedAt,
			UpdatedAt:   s.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"items":     items,
	})
}

func loadSubmissionDetail(surveyID uint, sid string) (*model.Submission, []model.Answer, map[uint]model.Question, error) {
	var submission model.Submission
	if err := database.DB.Where("id = ? AND survey_id = ?", sid, surveyID).First(&submission).Error; err != nil {
		return nil, nil, nil, err
	}

	var answers []model.Answer
	if err := database.DB.Where("submission_id = ?", submission.ID).Order("id ASC").Find(&answers).Error; err != nil {
		return nil, nil, nil, err
	}

	var questions []model.Question
	if err := database.DB.Where("survey_id = ?", surveyID).Find(&questions).Error; err != nil {
		return nil, nil, nil, err
	}
	questionMap := make(map[uint]model.Question, len(questions))
	for _, q := range questions {
		questionMap[q.ID] = q
	}

	return &submission, answers, questionMap, nil
}

func GetSurveySubmission(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	surveyID := c.Param("id")
	var survey model.Survey
	if err := database.DB.First(&survey, surveyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	submission, answers, questionMap, err := loadSubmissionDetail(survey.ID, c.Param("sid"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "提交记录未找到"})
		return
	}

	username := ""
	if submission.UserID != nil {
		var user model.User
		if err := database.DB.Select("username").First(&user, *submission.UserID).Error; err == nil {
			username = user.Username
		}
	}

	items := make([]gin.H, 0, len(answers))
	for _, a := range answers {
		q := questionMap[a.QuestionID]
		items = append(items, gin.H{
			"question_id":    a.QuestionID,
			"question_title": q.Title,
			"type":           q.Type,
			"value_text":     a.ValueText,
			"value_options":  parseOptions(a.ValueOptions),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"id":           submission.ID,
		"created_at":   submission.CreatedAt,
		"updated_at":   submission.UpdatedAt,
		"submitter_ip": submission.SubmitterIP,
		"username":     username,
		"answers":      items,
	})
}

func DeleteSurveySubmission(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	surveyID := c.Param("id")
	var survey model.Survey
	if err := database.DB.First(&survey, surveyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	var submission model.Submission
	if err := database.DB.Where("id = ? AND survey_id = ?", c.Param("sid"), survey.ID).First(&submission).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "提交记录未找到"})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Where("submission_id = ?", submission.ID).Delete(&model.Answer{}).Error; err != nil {
			return err
		}
		return tx.Delete(&submission).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除提交记录失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func SurveyStats(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	var totalSubmissions int64
	database.DB.Model(&model.Submission{}).Where("survey_id = ?", survey.ID).Count(&totalSubmissions)

	var questions []model.Question
	if err := database.DB.Where("survey_id = ?", survey.ID).Order("sort_order ASC, id ASC").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取问卷题目失败"})
		return
	}

	var answers []model.Answer
	if err := database.DB.
		Joins("JOIN submissions ON submissions.id = answers.submission_id").
		Where("submissions.survey_id = ?", survey.ID).
		Find(&answers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取统计数据失败"})
		return
	}

	// 按题目聚合答案
	answersByQuestion := make(map[uint][]model.Answer)
	for _, a := range answers {
		answersByQuestion[a.QuestionID] = append(answersByQuestion[a.QuestionID], a)
	}

	questionStats := make([]gin.H, 0, len(questions))
	for _, q := range questions {
		qAnswers := answersByQuestion[q.ID]
		answeredCount := int64(len(qAnswers))

		switch q.Type {
		case "single", "multi":
			options := parseOptions(q.Options)
			countMap := make(map[string]int64, len(options))
			for _, a := range qAnswers {
				if q.Type == "single" {
					if a.ValueText != "" {
						countMap[a.ValueText]++
					}
				} else {
					for _, v := range parseOptions(a.ValueOptions) {
						countMap[v]++
					}
				}
			}
			optionStats := make([]gin.H, 0, len(options))
			for _, o := range options {
				count := countMap[o]
				percent := float64(0)
				if totalSubmissions > 0 {
					percent = math.Round(float64(count)/float64(totalSubmissions)*10000) / 100
				}
				optionStats = append(optionStats, gin.H{
					"label":   o,
					"count":   count,
					"percent": percent,
				})
			}
			questionStats = append(questionStats, gin.H{
				"question_id":    q.ID,
				"title":          q.Title,
				"type":           q.Type,
				"required":       q.Required,
				"options":        optionStats,
				"answered_count": answeredCount,
			})
		default: // text / textarea
			textAnswers := make([]string, 0, 100)
			for _, a := range qAnswers {
				if a.ValueText == "" {
					continue
				}
				if len(textAnswers) >= 100 {
					break
				}
				textAnswers = append(textAnswers, a.ValueText)
			}
			questionStats = append(questionStats, gin.H{
				"question_id":    q.ID,
				"title":          q.Title,
				"type":           q.Type,
				"required":       q.Required,
				"text_answers":   textAnswers,
				"answered_count": answeredCount,
			})
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"total_submissions": totalSubmissions,
		"questions":         questionStats,
	})
}

func ExportSurveyCSV(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var survey model.Survey
	if err := database.DB.First(&survey, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "问卷未找到"})
		return
	}

	var questions []model.Question
	if err := database.DB.Where("survey_id = ?", survey.ID).Order("sort_order ASC, id ASC").Find(&questions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取问卷题目失败"})
		return
	}

	var submissions []model.Submission
	if err := database.DB.Where("survey_id = ?", survey.ID).Order("id ASC").Find(&submissions).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取提交记录失败"})
		return
	}

	var answers []model.Answer
	if err := database.DB.
		Joins("JOIN submissions ON submissions.id = answers.submission_id").
		Where("submissions.survey_id = ?", survey.ID).
		Find(&answers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取提交记录失败"})
		return
	}

	answersBySubmission := make(map[uint][]model.Answer)
	for _, a := range answers {
		answersBySubmission[a.SubmissionID] = append(answersBySubmission[a.SubmissionID], a)
	}

	// 关联用户名
	usernameMap := map[uint]string{}
	userIDs := make([]uint, 0, len(submissions))
	for _, s := range submissions {
		if s.UserID != nil {
			userIDs = append(userIDs, *s.UserID)
		}
	}
	if len(userIDs) > 0 {
		var users []model.User
		if err := database.DB.Select("id", "username").Where("id IN ?", userIDs).Find(&users).Error; err == nil {
			for _, u := range users {
				usernameMap[u.ID] = u.Username
			}
		}
	}

	c.Header("Content-Type", "text/csv; charset=utf-8")
	c.Header("Content-Disposition", `attachment; filename="survey-`+strconv.FormatUint(uint64(survey.ID), 10)+`-submissions.csv"`)

	// UTF-8 BOM 防止 Excel 打开乱码
	c.Writer.Write([]byte{0xEF, 0xBB, 0xBF})
	w := csv.NewWriter(c.Writer)

	header := []string{"提交时间", "提交者", "IP"}
	for _, q := range questions {
		header = append(header, q.Title)
	}
	if err := w.Write(header); err != nil {
		return
	}

	for _, s := range submissions {
		submitter := ""
		if s.UserID != nil {
			submitter = usernameMap[*s.UserID]
		}
		row := []string{
			s.CreatedAt.Local().Format("2006-01-02 15:04:05"),
			submitter,
			s.SubmitterIP,
		}
		answerByQuestion := make(map[uint]model.Answer)
		for _, a := range answersBySubmission[s.ID] {
			answerByQuestion[a.QuestionID] = a
		}
		for _, q := range questions {
			a, ok := answerByQuestion[q.ID]
			if !ok {
				row = append(row, "")
				continue
			}
			if q.Type == "multi" {
				row = append(row, strings.Join(parseOptions(a.ValueOptions), "、"))
			} else {
				row = append(row, a.ValueText)
			}
		}
		if err := w.Write(row); err != nil {
			return
		}
	}
	w.Flush()
}
