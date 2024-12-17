package main

import (
    "github.com/gin-gonic/gin"
    "log"
    "net/http"
	"github.com/gin-contrib/cors"
)

func main() {
    r := gin.Default()

    // Middleware: Logger
    r.Use(gin.Logger())
	r.Use(cors.Default())

    // Define a RESTful API endpoint
    r.GET("/api/message", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Hello from Gin Backend!",
        })
    })

    // Start the server
    if err := r.Run(":8080"); err != nil {
        log.Fatalf("Failed to start server: %s", err)
    }
}
