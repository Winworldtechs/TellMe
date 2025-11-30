import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { FiMapPin } from "react-icons/fi";
import "./DealDetails.css";

const DealDetails = () => {
  const { state: deal } = useLocation();

  const [isInterested, setIsInterested] = useState(false);
  const [message, setMessage] = useState("");

  const markInterested = () => {
    fetch(`http://127.0.0.1:8000/api/deals/deals/${deal.id}/interested/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        setIsInterested(true);
        setMessage(data.message);

        setTimeout(() => setMessage(""), 3000);
      });
  };

  return (
    <div className="deal-details">

      {/* Toast */}
      {message && <div className="toast">{message}</div>}

      <div className="deal-left">

        {/* ⭐ Title moved ABOVE image */}
        <h2 className="deal-title">{deal.title}</h2>

        {/* Image */}
        <img className="deal-img" src={deal.image} alt={deal.title} />
        {/* ⭐ Description section */}
        {deal.description && (
          <div className="deal-desc">
            {deal.description}
          
        {/* Location */}
        <p className="distance">
          <FiMapPin className="loc-icon" /> 1.5 km away
        </p>

        </div>
        )}

        {/* Button */}
        <button
          className={isInterested ? "interest-btn active" : "interest-btn"}
          onClick={markInterested}
          disabled={isInterested}
        >
          {isInterested ? "Interested ✓" : "Interested"}
        </button>
      </div>

    </div>
  );
};

export default DealDetails;
