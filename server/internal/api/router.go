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
		api.GET("/weather", handler.GetWeather)

		// Public articles（OptionalAuth：识别登录身份，供 manage 参数跳过浏览计数）
		api.GET("/articles", handler.ListArticles)
		api.GET("/articles/:id", middleware.OptionalAuth(cfg.JWTSecret), handler.GetArticle)

		// Public wiki
		api.GET("/wiki", handler.ListWikiPages)
		api.GET("/wiki/tree", handler.GetWikiTree)
		api.GET("/wiki/:id", handler.GetWikiPage)
		api.GET("/wiki/:id/revisions", handler.ListWikiRevisions)
		api.GET("/wiki/:id/revisions/:rid", handler.GetWikiRevision)

		// Public surveys (optional auth)
		api.GET("/surveys", middleware.OptionalAuth(cfg.JWTSecret), handler.ListSurveys)
		api.GET("/surveys/:id", middleware.OptionalAuth(cfg.JWTSecret), handler.GetSurvey)

		// Survey submit: 公开问卷允许匿名（OptionalAuth），非公开问卷在 handler 内要求登录
		api.POST("/surveys/:id/submit", middleware.OptionalAuth(cfg.JWTSecret), handler.SubmitSurvey)

		// Auth
		api.POST("/auth/register", handler.Register(cfg.JWTSecret))
		api.POST("/auth/login", handler.Login(cfg.JWTSecret))

		// Protected user endpoints
		userAuth := api.Group("")
		userAuth.Use(middleware.Auth(cfg.JWTSecret))
		{
			userAuth.GET("/auth/me", handler.GetMe)
			userAuth.GET("/surveys/:id/my", handler.GetMySurveySubmission)
		}

		// Protected wiki endpoints (member+)
		memberAuth := api.Group("")
		memberAuth.Use(middleware.Auth(cfg.JWTSecret), middleware.MemberPlus())
		{
			memberAuth.POST("/wiki", handler.CreateWikiPage)
			memberAuth.PUT("/wiki/:id", handler.UpdateWikiPage)
			memberAuth.POST("/wiki/:id/revert/:rid", handler.RevertWikiPage)
		}

		// Protected admin endpoints
		adminAuth := api.Group("")
		adminAuth.Use(middleware.Auth(cfg.JWTSecret), middleware.AdminOnly())
		{
			adminAuth.POST("/articles", handler.CreateArticle)
			adminAuth.PUT("/articles/:id", handler.UpdateArticle)
			adminAuth.DELETE("/articles/:id", handler.DeleteArticle)
			adminAuth.DELETE("/wiki/:id", handler.DeleteWikiPage)
		}

		// Admin survey endpoints
		adminSurveys := api.Group("/admin/surveys")
		adminSurveys.Use(middleware.Auth(cfg.JWTSecret), middleware.AdminOnly())
		{
			adminSurveys.GET("", handler.ListAdminSurveys)
			adminSurveys.POST("", handler.CreateAdminSurvey)
			adminSurveys.GET("/:id", handler.GetAdminSurvey)
			adminSurveys.PUT("/:id", handler.UpdateAdminSurvey)
			adminSurveys.POST("/:id/status", handler.UpdateSurveyStatus)
			adminSurveys.GET("/:id/submissions", handler.ListSurveySubmissions)
			adminSurveys.GET("/:id/submissions/:sid", handler.GetSurveySubmission)
			adminSurveys.DELETE("/:id/submissions/:sid", handler.DeleteSurveySubmission)
			adminSurveys.GET("/:id/stats", handler.SurveyStats)
			adminSurveys.GET("/:id/export", handler.ExportSurveyCSV)
		}
	}

	return r
}
