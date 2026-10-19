package handler

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/syuctacm/syuctacm/server/internal/database"
)

func HealthCheck(c *gin.Context) {
	dbStatus := "connected"
	if database.DB == nil {
		dbStatus = "disconnected"
	} else {
		sqlDB, err := database.DB.DB()
		if err != nil || sqlDB.Ping() != nil {
			dbStatus = "error"
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"status":    "healthy",
		"service":   "syuctacm-server",
		"database":  dbStatus,
		"timestamp": time.Now().Format(time.RFC3339),
	})
}
