import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// Ensure default theme is dark before the app mounts
try {
  const saved = localStorage.getItem("theme");
  const initial = saved || "dark";
  document.documentElement.classList.add(initial);
} catch (e) {}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
