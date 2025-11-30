import React, { useState } from "react";
import "./Booking.css"; // CSS file for styles

const Booking = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const dates = [
    { day: "Mon", date: "08" },
    { day: "Tue", date: "09" },
    { day: "Wed", date: "10" },
    { day: "Thu", date: "11" },
    { day: "Fri", date: "12" },
    { day: "Sat", date: "13" },
  ];

  const times = [
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM",
    "6:00 PM",
  ];

  const handleBookNow = () => setShowModal(true);

  const handleProceed = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time before proceeding!");
      return;
    }
    alert(`✅ Booking confirmed for ${selectedDate.day} ${selectedDate.date} at ${selectedTime}`);
    setShowModal(false);
  };

  return (
    <div className="booking-container">
      <h2>Electric Cement Mixer</h2>

      <div className="card">
        <img
          src="https://cdn.pixabay.com/photo/2018/05/23/20/01/construction-3420428_1280.jpg"
          alt="Cement Mixer"
        />
        <h4>Electric Cement Mixer</h4>
        <div className="features">
          • 50L capacity <br />• Electric motor
        </div>
        <div className="rating">⭐ 4.8 | 2 km away</div>
        <button onClick={handleBookNow}>Book now</button>
      </div>

      {showModal && (
        <div className="modal" onClick={(e) => e.target.className === "modal" && setShowModal(false)}>
          <div className="modal-content">
            <h3>Select rental date</h3>
            <div className="date-list">
              {dates.map((d, index) => (
                <div
                  key={index}
                  className={`date-btn ${
                    selectedDate?.date === d.date ? "active" : ""
                  }`}
                  onClick={() => setSelectedDate(d)}
                >
                  {d.day}
                  <br />
                  {d.date}
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: "10px" }}>Select time</h3>
            <div className="time-list">
              {times.map((t, index) => (
                <div
                  key={index}
                  className={`time-btn ${selectedTime === t ? "active" : ""}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </div>
              ))}
            </div>

            <button className="proceed" onClick={handleProceed}>
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
