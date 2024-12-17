package handlers

import (
	"encoding/csv"
	"net/http"
	"os"
	"sync"
	"github.com/gin-gonic/gin"
	"project3/models"
)

var (
	csvFilePath = "data.csv"
	mutex       sync.Mutex
)

func fileExists() bool {
	_, err := os.Stat(csvFilePath)
	return !os.IsNotExist(err)
}

func GetRecords(c *gin.Context) {
	mutex.Lock()
	defer mutex.Unlock()

	if !fileExists() {
		c.JSON(http.StatusOK, gin.H{"message": "No file found"})
		return
	}

	file, err := os.Open(csvFilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open CSV file"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	data, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read CSV file"})
		return
	}

	records := make([]models.Record, 0)
	for _, row := range data {
		if len(row) < 3 {
			continue
		}
		records = append(records, models.Record{SiteID: row[0], FixletID: row[1],Name: row[2],Criticality: row[3],RelevantComputerCount: row[4]})
	}
	
	c.JSON(http.StatusOK, records)
}

func AddRecord(c *gin.Context) {
	mutex.Lock()
	defer mutex.Unlock()

	var newRecord models.Record
	if err := c.ShouldBindJSON(&newRecord); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	file, err := os.OpenFile(csvFilePath, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open CSV file"})
		return
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	if err := writer.Write([]string{newRecord.SiteID, newRecord.FixletID, newRecord.Name, newRecord.Criticality, newRecord.RelevantComputerCount}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write record"})
		return
	}
	writer.Flush()

	c.JSON(http.StatusCreated, newRecord)
}

func UpdateRecord(c *gin.Context) {
	mutex.Lock()
	defer mutex.Unlock()

	id := c.Param("id")
	var updatedRecord models.Record
	if err := c.ShouldBindJSON(&updatedRecord); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}

	if !fileExists() {
		c.JSON(http.StatusNotFound, gin.H{"error": "No file found"})
		return
	}

	file, err := os.Open(csvFilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open CSV file"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	data, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read CSV file"})
		return
	}

	updated := false
	for i, row := range data {
		if len(row) > 0 && row[0] == id {
			data[i] = []string{updatedRecord.SiteID, updatedRecord.FixletID, updatedRecord.Name, updatedRecord.Criticality, updatedRecord.RelevantComputerCount}
			updated = true
			break
		}
	}

	if !updated {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}

	file, err = os.Create(csvFilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open CSV file"})
		return
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	if err := writer.WriteAll(data); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write to CSV file"})
		return
	}

	c.JSON(http.StatusOK, updatedRecord)
}

func DeleteRecord(c *gin.Context) {
	mutex.Lock()
	defer mutex.Unlock()

	id := c.Param("id")

	if !fileExists() {
		c.JSON(http.StatusNotFound, gin.H{"error": "No file found"})
		return
	}

	file, err := os.Open(csvFilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open CSV file"})
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	data, err := reader.ReadAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read CSV file"})
		return
	}

	newData := make([][]string, 0)
	deleted := false
	for _, row := range data {
		if len(row) > 0 && row[0] == id {
			deleted = true
			continue
		}
		newData = append(newData, row)
	}

	if !deleted {
		c.JSON(http.StatusNotFound, gin.H{"error": "Record not found"})
		return
	}

	file, err = os.Create(csvFilePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to open CSV file"})
		return
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	if err := writer.WriteAll(newData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to write to CSV file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Record deleted"})
}

func UploadCSV(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to retrieve file"})
		return
	}

	if err := c.SaveUploadedFile(file, csvFilePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully"})
}

func RemoveCSV(c *gin.Context) {
	mutex.Lock()
	defer mutex.Unlock()

	if !fileExists() {
		c.JSON(http.StatusNotFound, gin.H{"error": "No file found"})
		return
	}

	if err := os.Remove(csvFilePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "File removed successfully"})
}
