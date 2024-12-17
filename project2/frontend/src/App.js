// App.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
    const [message, setMessage] = useState("");

    useEffect(() => {
        axios.get("/api/message")
            .then(response => {
                setMessage(response.data.message);
                console.log(response.data)
            })
            .catch(error => {
                console.error("Error fetching data:", error);
                setMessage("Unable to fetch the message. Please try again later.");
            });
    }, []);

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Welcome</h1>
            </header>
            <main className="app-main">
                <p className="app-message">{message}</p>
            </main>
            <footer className="app-footer">
                <p>Powered by React & Go</p>
            </footer>
        </div>
    );
}

export default App;
