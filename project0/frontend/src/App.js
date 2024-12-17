import React, { useEffect, useState } from "react";
import axios from "axios";
import './App.css'
function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("http://localhost:8080/api/message")
            .then(response => {
                setMessage(response.data.message);
            })
            .catch(error => {
                console.error("Error fetching data:", error);
            });
    }, []);

    return (
        <div>
            <h1>React + Gin Example</h1>
            <p>Message from Backend: {message}</p>
        </div>
    );
}

export default App;
