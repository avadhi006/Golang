package models

type Record struct {
	SiteID   string `json:"siteid"`
	FixletID  string `json:"fixletid"`
	Name string `json:"name"`
	Criticality string `json:"criticality"`
	RelevantComputerCount string `json:"relevantcomputercount"`
}
