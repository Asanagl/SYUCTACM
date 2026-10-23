package handler

import (
	"net/http"
	"strconv"
	"time"
	"unicode/utf8"

	"github.com/gin-gonic/gin"
	"github.com/syuctacm/syuctacm/server/internal/database"
	"github.com/syuctacm/syuctacm/server/internal/model"
	"gorm.io/gorm"
)

type WikiPageReq struct {
	Title     string `json:"title" binding:"required,max=200"`
	Content   string `json:"content" binding:"required,max=200000"`
	GroupName string `json:"group_name"`
}

type wikiPageListItem struct {
	ID            uint      `json:"id"`
	Title         string    `json:"title"`
	GroupName     string    `json:"group_name"`
	CreatedBy     string    `json:"created_by"`
	UpdatedBy     string    `json:"updated_by"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	RevisionCount int       `json:"revision_count"`
}

type wikiTreeItem struct {
	ID        uint   `json:"id"`
	Title     string `json:"title"`
	GroupName string `json:"group_name"`
}

type wikiRevisionListItem struct {
	ID        uint      `json:"id"`
	PageID    uint      `json:"page_id"`
	Title     string    `json:"title"`
	Editor    string    `json:"editor"`
	CreatedAt time.Time `json:"created_at"`
}

func ListWikiPages(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusOK, gin.H{
			"total": 0,
			"items": []wikiPageListItem{},
		})
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
	database.DB.Model(&model.WikiPage{}).Count(&total)

	var items []wikiPageListItem
	offset := (page - 1) * pageSize
	err := database.DB.Model(&model.WikiPage{}).
		Select("id", "title", "group_name", "created_by", "updated_by", "created_at", "updated_at", "revision_count").
		Order("updated_at DESC").
		Offset(offset).Limit(pageSize).
		Find(&items).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取 Wiki 页面失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total":     total,
		"page":      page,
		"page_size": pageSize,
		"items":     items,
	})
}

func GetWikiTree(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusOK, gin.H{
			"items": []wikiTreeItem{},
		})
		return
	}

	items := make([]wikiTreeItem, 0)
	err := database.DB.Model(&model.WikiPage{}).
		Select("id", "title", "group_name").
		Order("group_name ASC").
		Order("title ASC").
		Find(&items).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取 Wiki 目录失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
	})
}

func GetWikiPage(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	id := c.Param("id")
	var wikiPage model.WikiPage
	if err := database.DB.First(&wikiPage, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wiki 页面未找到"})
		return
	}

	c.JSON(http.StatusOK, wikiPage)
}

func CreateWikiPage(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	var req WikiPageReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误，标题和内容为必填项"})
		return
	}
	if utf8.RuneCountInString(req.GroupName) > 64 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "group_name 不能超过 64 字"})
		return
	}

	usernameVal, exists := c.Get("username")
	username, ok := usernameVal.(string)
	if !exists || !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取当前用户信息失败"})
		return
	}

	wikiPage := model.WikiPage{
		Title:         req.Title,
		Content:       req.Content,
		GroupName:     req.GroupName,
		CreatedBy:     username,
		UpdatedBy:     username,
		RevisionCount: 1,
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&wikiPage).Error; err != nil {
			return err
		}
		revision := model.WikiRevision{
			PageID:  wikiPage.ID,
			Title:   wikiPage.Title,
			Content: wikiPage.Content,
			Editor:  username,
		}
		return tx.Create(&revision).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建 Wiki 页面失败"})
		return
	}

	c.JSON(http.StatusOK, wikiPage)
}

func UpdateWikiPage(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	id := c.Param("id")
	var wikiPage model.WikiPage
	if err := database.DB.First(&wikiPage, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wiki 页面未找到"})
		return
	}

	var req WikiPageReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误，标题和内容为必填项"})
		return
	}
	if utf8.RuneCountInString(req.GroupName) > 64 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "group_name 不能超过 64 字"})
		return
	}

	usernameVal, exists := c.Get("username")
	username, ok := usernameVal.(string)
	if !exists || !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取当前用户信息失败"})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&wikiPage).Updates(map[string]interface{}{
			"title":          req.Title,
			"content":        req.Content,
			"group_name":     req.GroupName,
			"updated_by":     username,
			"revision_count": gorm.Expr("revision_count + 1"),
		}).Error; err != nil {
			return err
		}
		revision := model.WikiRevision{
			PageID:  wikiPage.ID,
			Title:   req.Title,
			Content: req.Content,
			Editor:  username,
		}
		return tx.Create(&revision).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新 Wiki 页面失败"})
		return
	}

	database.DB.First(&wikiPage, id)
	c.JSON(http.StatusOK, wikiPage)
}

func ListWikiRevisions(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusOK, gin.H{
			"total": 0,
			"items": []wikiRevisionListItem{},
		})
		return
	}

	id := c.Param("id")
	var wikiPage model.WikiPage
	if err := database.DB.First(&wikiPage, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wiki 页面未找到"})
		return
	}

	var total int64
	database.DB.Model(&model.WikiRevision{}).Where("page_id = ?", wikiPage.ID).Count(&total)

	var items []wikiRevisionListItem
	err := database.DB.Model(&model.WikiRevision{}).
		Select("id", "page_id", "title", "editor", "created_at").
		Where("page_id = ?", wikiPage.ID).
		Order("id DESC").
		Find(&items).Error
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取修订历史失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"total": total,
		"items": items,
	})
}

func GetWikiRevision(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	id := c.Param("id")
	rid := c.Param("rid")

	var wikiPage model.WikiPage
	if err := database.DB.First(&wikiPage, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wiki 页面未找到"})
		return
	}

	var revision model.WikiRevision
	if err := database.DB.Where("id = ? AND page_id = ?", rid, wikiPage.ID).First(&revision).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "修订版本未找到"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":         revision.ID,
		"page_id":    revision.PageID,
		"title":      revision.Title,
		"content":    revision.Content,
		"editor":     revision.Editor,
		"created_at": revision.CreatedAt,
	})
}

func RevertWikiPage(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	id := c.Param("id")
	rid := c.Param("rid")

	var wikiPage model.WikiPage
	if err := database.DB.First(&wikiPage, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Wiki 页面未找到"})
		return
	}

	var revision model.WikiRevision
	if err := database.DB.Where("id = ? AND page_id = ?", rid, wikiPage.ID).First(&revision).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "修订版本未找到"})
		return
	}

	usernameVal, exists := c.Get("username")
	username, ok := usernameVal.(string)
	if !exists || !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "获取当前用户信息失败"})
		return
	}

	err := database.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&wikiPage).Updates(map[string]interface{}{
			"title":          revision.Title,
			"content":        revision.Content,
			"updated_by":     username,
			"revision_count": gorm.Expr("revision_count + 1"),
		}).Error; err != nil {
			return err
		}
		newRevision := model.WikiRevision{
			PageID:  wikiPage.ID,
			Title:   revision.Title,
			Content: revision.Content,
			Editor:  username,
		}
		return tx.Create(&newRevision).Error
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "回退 Wiki 页面失败"})
		return
	}

	database.DB.First(&wikiPage, id)
	c.JSON(http.StatusOK, wikiPage)
}

func DeleteWikiPage(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	id := c.Param("id")
	if err := database.DB.Delete(&model.WikiPage{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
