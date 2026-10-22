package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/syuctacm/syuctacm/server/internal/database"
	"github.com/syuctacm/syuctacm/server/internal/model"
)

type ArticleCreateReq struct {
	Title      string `json:"title" binding:"required"`
	Slug       string `json:"slug"`
	Category   string `json:"category"`
	Summary    string `json:"summary"`
	Content    string `json:"content" binding:"required"`
	IsPinned   bool   `json:"is_pinned"`
	AuthorName string `json:"author_name"`
}

type ArticleUpdateReq struct {
	Title      string `json:"title"`
	Slug       string `json:"slug"`
	Category   string `json:"category"`
	Summary    string `json:"summary"`
	Content    string `json:"content"`
	IsPinned   *bool  `json:"is_pinned"`
	AuthorName string `json:"author_name"`
}

func escapeLikePattern(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "%", "\\%")
	s = strings.ReplaceAll(s, "_", "\\_")
	return s
}

func ListArticles(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusOK, gin.H{
			"total": 0,
			"items": []model.Article{},
		})
		return
	}

	category := c.Query("category")
	search := c.Query("search")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "10"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 10
	}

	query := database.DB.Model(&model.Article{})
	if category != "" {
		query = query.Where("category = ?", category)
	}
	if search != "" {
		query = query.Where("title ILIKE ? ESCAPE '\\'", "%"+escapeLikePattern(search)+"%")
	}

	var total int64
	query.Count(&total)

	var items []model.Article
	offset := (page - 1) * pageSize
	err := query.Order("is_pinned DESC, id DESC").Offset(offset).Limit(pageSize).Find(&items).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取文章失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"items":     items,
	})
}

func GetArticle(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	id := c.Param("id")
	var article model.Article
	if err := database.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章未找到"})
		return
	}

	// Increment view count
	database.DB.Model(&article).UpdateColumn("view_count", article.ViewCount+1)
	article.ViewCount++

	c.JSON(http.StatusOK, article)
}

func CreateArticle(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var req ArticleCreateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误，标题和内容为必填项"})
		return
	}

	userIDVal, _ := c.Get("user_id")
	usernameVal, _ := c.Get("username")

	authorName := req.AuthorName
	if authorName == "" {
		authorName = usernameVal.(string)
	}

	category := req.Category
	if category == "" {
		category = "news"
	}

	article := model.Article{
		Title:      req.Title,
		Slug:       req.Slug,
		Category:   category,
		Summary:    req.Summary,
		Content:    req.Content,
		IsPinned:   req.IsPinned,
		AuthorID:   userIDVal.(uint),
		AuthorName: authorName,
	}

	if err := database.DB.Create(&article).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "发布文章失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "文章发布成功",
		"data":    article,
	})
}

func UpdateArticle(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	id := c.Param("id")
	var article model.Article
	if err := database.DB.First(&article, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "文章未找到"})
		return
	}

	var req ArticleUpdateReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数格式错误"})
		return
	}

	updates := map[string]interface{}{}
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Slug != "" {
		updates["slug"] = req.Slug
	}
	if req.Category != "" {
		updates["category"] = req.Category
	}
	if req.Summary != "" {
		updates["summary"] = req.Summary
	}
	if req.Content != "" {
		updates["content"] = req.Content
	}
	if req.AuthorName != "" {
		updates["author_name"] = req.AuthorName
	}
	if req.IsPinned != nil {
		updates["is_pinned"] = *req.IsPinned
	}

	if err := database.DB.Model(&article).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新文章失败"})
		return
	}

	database.DB.First(&article, id)
	c.JSON(http.StatusOK, gin.H{
		"message": "更新成功",
		"data":    article,
	})
}

func DeleteArticle(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	id := c.Param("id")
	if err := database.DB.Delete(&model.Article{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
