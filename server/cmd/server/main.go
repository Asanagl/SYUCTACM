package main

import (
	"log"

	"github.com/syuctacm/syuctacm/server/internal/api"
	"github.com/syuctacm/syuctacm/server/internal/config"
	"github.com/syuctacm/syuctacm/server/internal/database"
)

func main() {
	cfg := config.Load()

	// Initialize Database (non-blocking log on dev if postgres isn't running yet)
	_, _ = database.Init(cfg.DatabaseURL)

	r := api.SetupRouter(cfg)

	log.Printf("[SYUCTACM Server] Starting listening on port :%s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server startup failed: %v", err)
	}
}
