package handler

import (
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

// Open-Meteo 当前天气响应（仅取需要的字段）
type openMeteoResp struct {
	CurrentWeather struct {
		Temperature float64 `json:"temperature"`
		WeatherCode int     `json:"weathercode"`
	} `json:"current_weather"`
}

type weatherCacheEntry struct {
	temperature float64
	text        string
	fetchedAt   time.Time
}

var (
	weatherCacheMu sync.Mutex
	weatherCache   *weatherCacheEntry
	weatherTTL     = 30 * time.Minute
	weatherClient  = &http.Client{Timeout: 5 * time.Second}
)

const weatherURL = "https://api.open-meteo.com/v1/forecast?latitude=41.80&longitude=123.38&current_weather=true"

// weatherCodeText WMO 天气现象码 → 中文文案
func weatherCodeText(code int) string {
	switch {
	case code == 0:
		return "晴"
	case code == 1 || code == 2:
		return "多云"
	case code == 3:
		return "阴"
	case code == 45 || code == 48:
		return "雾"
	case code >= 51 && code <= 57:
		return "毛毛雨"
	case code >= 61 && code <= 67:
		return "雨"
	case code >= 71 && code <= 77:
		return "雪"
	case code >= 80 && code <= 82:
		return "阵雨"
	case code >= 85 && code <= 86:
		return "阵雪"
	case code >= 95:
		return "雷暴"
	default:
		return "未知"
	}
}

// GetWeather 返回学校（沈阳市铁西区）当前天气，带 30 分钟内存缓存
func GetWeather(c *gin.Context) {
	weatherCacheMu.Lock()
	if weatherCache != nil && time.Since(weatherCache.fetchedAt) < weatherTTL {
		entry := weatherCache
		weatherCacheMu.Unlock()
		c.JSON(http.StatusOK, gin.H{
			"temperature": entry.temperature,
			"text":        entry.text,
			"fetched_at":  entry.fetchedAt,
			"cached":      true,
		})
		return
	}
	weatherCacheMu.Unlock()

	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, weatherURL, nil)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "天气服务请求构建失败"})
		return
	}
	resp, err := weatherClient.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "天气服务暂时不可用"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{"error": "天气服务返回异常"})
		return
	}

	var data openMeteoResp
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "天气数据解析失败"})
		return
	}

	entry := &weatherCacheEntry{
		temperature: data.CurrentWeather.Temperature,
		text:        weatherCodeText(data.CurrentWeather.WeatherCode),
		fetchedAt:   time.Now(),
	}
	weatherCacheMu.Lock()
	weatherCache = entry
	weatherCacheMu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"temperature": entry.temperature,
		"text":        entry.text,
		"fetched_at":  entry.fetchedAt,
		"cached":      false,
	})
}
