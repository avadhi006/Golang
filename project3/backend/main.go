package main

import (
	"log"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
	"project3/handlers"
)

func main() {
	r := gin.Default()

	// CORS configuration
	
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Middleware for error logging
	r.Use(func(c *gin.Context) {
		c.Next()
		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				log.Println("Error:", e.Error())
			}
		}
	})

	// API endpoints
	r.GET("/api/records", handlers.GetRecords)
	r.POST("/api/records", handlers.AddRecord)
	r.PUT("/api/records/:id", handlers.UpdateRecord)
	r.DELETE("/api/records/:id", handlers.DeleteRecord)
	r.POST("/api/upload", handlers.UploadCSV)
	r.DELETE("/api/remove", handlers.RemoveCSV)

	// Start server
	r.Run(":8888")

	/*err := r.RunTLS(":8888", "path/to/your/certificate.crt", "path/to/your/private.key")
	if err != nil {
		log.Fatal("Failed to start HTTPS server: ", err) */
	}

