import React from "react";
import "./Loader.css";

function Loader() {
  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <p className="loader-text">Loading your services...</p>
    </div>
  );
}

export default Loader;