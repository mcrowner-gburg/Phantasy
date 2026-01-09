import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css"; // this must exist (can be empty at first)

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
