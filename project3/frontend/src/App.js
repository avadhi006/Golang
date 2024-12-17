import React, { useEffect, useState } from "react";

import axios from "axios";

import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Snackbar,
  Alert,
  Box,
  Grid,
  Paper
} from "@mui/material";

function App() {
  const [records, setRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    siteid: "",
    fixletid: "",
    name: "",
    criticality: "",
    relevantcomputercount: "",
  });

  const [editRecord, setEditRecord] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [csvUploaded, setCsvUploaded] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.get("/api/records");
      if (response.data && response.data.length > 0) {
        setRecords(response.data);
        setCsvUploaded(true);
      } else {
        setRecords([]);
        setCsvUploaded(false);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const addRecord = async () => {
    try {
      await axios.post("/api/records", newRecord);
      fetchRecords();
      setNewRecord({
        siteid: "",
        fixletid: "",
        name: "",
        criticality: "",
        relevantcomputercount: "",
      });
      showSnackbar("Record added successfully!");
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  const deleteRecord = async (id) => {
    try {
      await axios.delete(`/api/records/${id}`);
      fetchRecords();
      showSnackbar("Record deleted successfully!");
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleUpdateRecord = async () => {
    try {
      await axios.put(
        `/api/records/${editRecord.siteid}`,
        editRecord
      );
      fetchRecords();
      setOpenDialog(false);
      showSnackbar("Record updated successfully!");
    } catch (error) {
      console.error("Error updating record:", error);
    }
  };

  const handleUploadCSV = async (event) => {
    const formData = new FormData();
    formData.append("file", event.target.files[0]);

    try {
      await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchRecords();
      showSnackbar("CSV uploaded successfully!");
    } catch (error) {
      console.error("Error uploading CSV:", error);
    }
  };

  const handleRemoveCSV = async () => {
    try {
      await axios.delete("/api/remove");
      setCsvUploaded(false);
      setRecords([]);
      showSnackbar("CSV file removed successfully!");
    } catch (error) {
      console.error("Error removing CSV file:", error);
    }
  };

  const showSnackbar = (message) => {
    setSnackbarMessage(message);
    setOpenSnackbar(true);
  };

  return (
    <Container>
      <Typography variant="h3" gutterBottom align="center">
        CSV CRUD App
      </Typography>

      {!csvUploaded ? (
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Typography variant="h5" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body1" gutterBottom>
            Please upload a CSV file to view and manage records.
          </Typography>
          <Button variant="contained" color="secondary" component="label">
            Upload CSV
            <input type="file" hidden onChange={handleUploadCSV} />
          </Button>
        </Box>
      ) : (
        <>
          <Paper sx={{ padding: 2, marginBottom: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add New Record
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Site ID"
                  fullWidth
                  value={newRecord.siteid}
                  onChange={(e) => setNewRecord({ ...newRecord, siteid: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Fixlet ID"
                  fullWidth
                  value={newRecord.fixletid}
                  onChange={(e) => setNewRecord({ ...newRecord, fixletid: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Name"
                  fullWidth
                  value={newRecord.name}
                  onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Criticality"
                  fullWidth
                  value={newRecord.criticality}
                  onChange={(e) => setNewRecord({ ...newRecord, criticality: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Relevant Computer Count"
                  fullWidth
                  value={newRecord.relevantcomputercount}
                  onChange={(e) => setNewRecord({ ...newRecord, relevantcomputercount: e.target.value })}
                />
              </Grid>
            </Grid>
            <Box mt={2} display="flex" justifyContent="flex-end">
              <Button onClick={addRecord} variant="contained" color="primary">
                Add Record
              </Button>
            </Box>
          </Paper>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Site ID</TableCell>
                <TableCell>Fixlet ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Criticality</TableCell>
                <TableCell>Relevant Computer Count</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.siteid}>
                  <TableCell>{record.siteid}</TableCell>
                  <TableCell>{record.fixletid}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell>{record.criticality}</TableCell>
                  <TableCell>{record.relevantcomputercount}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setEditRecord(record);
                        setOpenDialog(true);
                      }}
                      variant="outlined"
                      color="primary"
                      style={{ marginRight: "10px" }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteRecord(record.siteid)}
                      variant="outlined"
                      color="secondary"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Box mt={2} display="flex" justifyContent="flex-end">
            <Button onClick={handleRemoveCSV} variant="contained" color="error">
              Remove CSV File
            </Button>
          </Box>
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Record</DialogTitle>
        <DialogContent>
          <TextField
            label="Site ID"
            fullWidth
            value={editRecord?.siteid || ""}
            onChange={(e) => setEditRecord({ ...editRecord, siteid: e.target.value })}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            label="Fixlet ID"
            fullWidth
            value={editRecord?.fixletid || ""}
            onChange={(e) => setEditRecord({ ...editRecord, fixletid: e.target.value })}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            label="Name"
            fullWidth
            value={editRecord?.name || ""}
            onChange={(e) => setEditRecord({ ...editRecord, name: e.target.value })}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            label="Criticality"
            fullWidth
            value={editRecord?.criticality || ""}
            onChange={(e) => setEditRecord({ ...editRecord, criticality: e.target.value })}
            style={{ marginBottom: "10px" }}
          />
          <TextField
            label="Relevant Computer Count"
            fullWidth
            value={editRecord?.relevantcomputercount || ""}
            onChange={(e) => setEditRecord({ ...editRecord, relevantcomputercount: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateRecord} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;
