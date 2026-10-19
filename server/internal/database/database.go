package database

import (
	"log"
	"time"

	"github.com/syuctacm/syuctacm/server/internal/model"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Init(databaseURL string) (*gorm.DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Printf("[Database] Warning: failed to connect to PostgreSQL: %v", err)
		return nil, err
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxIdleConns(10)
		sqlDB.SetMaxOpenConns(50)
		sqlDB.SetConnMaxLifetime(time.Hour)
	}

	log.Println("[Database] PostgreSQL connected successfully, running auto migrations...")
	if err := db.AutoMigrate(&model.User{}, &model.Announcement{}); err != nil {
		log.Printf("[Database] AutoMigrate error: %v", err)
	}

	DB = db
	return db, nil
}
