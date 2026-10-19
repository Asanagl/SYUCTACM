package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/syuctacm/syuctacm/server/internal/api/middleware"
	"github.com/syuctacm/syuctacm/server/internal/database"
	"github.com/syuctacm/syuctacm/server/internal/model"
	"golang.org/x/crypto/bcrypt"
)

type RegisterReq struct {
	Username      string `json:"username" binding:"required,min=3,max=32"`
	Password      string `json:"password" binding:"required,min=6,max=64"`
	Nickname      string `json:"nickname" binding:"required,min=2,max=32"`
	Email         string `json:"email"`
	StudentNumber string `json:"student_number"`
	Grade         string `json:"grade"`
	Major         string `json:"major"`
}

type LoginReq struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Register(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if database.DB == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
			return
		}

		var req RegisterReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "参数格式错误或缺失必要字段"})
			return
		}

		var count int64
		database.DB.Model(&model.User{}).Where("username = ?", req.Username).Count(&count)
		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "该用户名已被注册"})
			return
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
			return
		}

		user := model.User{
			Username:      req.Username,
			PasswordHash:  string(hash),
			Nickname:      req.Nickname,
			Email:         req.Email,
			Role:          "member",
			StudentNumber: req.StudentNumber,
			Grade:         req.Grade,
			Major:         req.Major,
		}

		if err := database.DB.Create(&user).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "创建用户失败"})
			return
		}

		token, err := generateToken(user, jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "生成凭证失败"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "注册成功",
			"token":   token,
			"user": gin.H{
				"id":             user.ID,
				"username":       user.Username,
				"nickname":       user.Nickname,
				"email":          user.Email,
				"role":           user.Role,
				"student_number": user.StudentNumber,
				"grade":          user.Grade,
			},
		})
	}
}

func Login(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if database.DB == nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
			return
		}

		var req LoginReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "请输入用户名和密码"})
			return
		}

		var user model.User
		if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
			return
		}

		if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
			return
		}

		token, err := generateToken(user, jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "生成登录凭证失败"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "登录成功",
			"token":   token,
			"user": gin.H{
				"id":             user.ID,
				"username":       user.Username,
				"nickname":       user.Nickname,
				"email":          user.Email,
				"role":           user.Role,
				"student_number": user.StudentNumber,
				"grade":          user.Grade,
			},
		})
	}
}

func GetMe(c *gin.Context) {
	if database.DB == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "数据库未连接"})
		return
	}

	userIDVal, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未登录"})
		return
	}

	var user model.User
	if err := database.DB.First(&user, userIDVal).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":             user.ID,
			"username":       user.Username,
			"nickname":       user.Nickname,
			"email":          user.Email,
			"role":           user.Role,
			"student_number": user.StudentNumber,
			"grade":          user.Grade,
			"major":          user.Major,
			"cf_handle":      user.CFHandle,
			"bio":            user.Bio,
		},
	})
}

func generateToken(user model.User, secret string) (string, error) {
	claims := middleware.Claims{
		UserID:   user.ID,
		Username: user.Username,
		Role:     user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "syuctacm-server",
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
