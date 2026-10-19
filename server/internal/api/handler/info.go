package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetClubInfo(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"name":        "SYUCT ACM 集训队",
		"englishName": "Shenyang University of Chemical Technology ACM-ICPC Team",
		"ojUrl":       "https://oj.syuctacm.cn",
		"githubOrg":   "https://github.com/syuctacm",
		"stats": gin.H{
			"ojUsers": 530,
			"establishedYear": 2013,
		},
	})
}
