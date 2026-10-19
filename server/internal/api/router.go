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
		api.GET("/health", handler.HealthCheck)
		api.GET("/info", handler.GetClubInfo)
	}

	return r
}
