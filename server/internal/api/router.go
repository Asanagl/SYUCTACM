package api

import (
	"github.com/gin-gonic/gin"
	"github.com/syuctacm/syuctacm/server/internal/api/handler"
	"github.com/syuctacm/syuctacm/server/internal/api/middleware"
	"github.com/syuctacm/syuctacm/server/internal/config"
)

func SetupRouter(cfg *config.Config) *gin.Engine {
	r := gin.Default()

	r.Use(middleware.CORS(cfg.CORSAllowOrigins))

	api := r.Group("/api/v1")
	{
		// Public general
		api.GET("/health", handler.HealthCheck)
		api.GET("/info", handler.GetClubInfo)

		// Public articles
		api.GET("/articles", handler.ListArticles)
		api.GET("/articles/:id", handler.GetArticle)

		// Auth
		api.POST("/auth/register", handler.Register(cfg.JWTSecret))
		api.POST("/auth/login", handler.Login(cfg.JWTSecret))

		// Protected user endpoints
		userAuth := api.Group("")
		userAuth.Use(middleware.Auth(cfg.JWTSecret))
		{
			userAuth.GET("/auth/me", handler.GetMe)
		}

		// Protected admin endpoints
		adminAuth := api.Group("")
		adminAuth.Use(middleware.Auth(cfg.JWTSecret), middleware.AdminOnly())
		{
			adminAuth.POST("/articles", handler.CreateArticle)
			adminAuth.PUT("/articles/:id", handler.UpdateArticle)
			adminAuth.DELETE("/articles/:id", handler.DeleteArticle)
		}
	}

	return r
}
