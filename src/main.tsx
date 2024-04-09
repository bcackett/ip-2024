import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import NavBar from "./elements/NavBar";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
require("dotenv").config();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <NavBar />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);