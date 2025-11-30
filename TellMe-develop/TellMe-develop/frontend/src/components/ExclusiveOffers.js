import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./ExclusiveOffers.css";

const BASE_URL = "http://127.0.0.1:8000";
const API_URL = `${BASE_URL}/api/services/offers/`;

const ExclusiveOffers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOffer, setSelectedOffer] = useState(null);
    const [date, setDate] = useState("");
    const [slot, setSlot] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const response = await axios.get(API_URL);
                let data = [];

                if (response.data && Array.isArray(response.data.results)) {
                    data = response.data.results;
                } else if (Array.isArray(response.data)) {
                    data = response.data;
                }

                const activeOffers = data.filter(offer => offer.is_active);
                setOffers(activeOffers);
            } catch {
                setError("Failed to load offers");
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    const handleConfirmBooking = () => {
        if (!date || !slot) return alert("Please select date and time");

        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
            setSelectedOffer(null);
            setDate("");
            setSlot("");
        }, 2000);
    };

    if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
    if (error) return <p style={{ textAlign: "center", color: "red" }}>{error}</p>;

    return (
        <section className="exclusive-offers">
            <h2>Exclusive Offers, Just for You</h2>

            <div className="offers-container">
                {offers.map((offer) => {
                    const imageUrl = offer.image?.startsWith("http")
                        ? offer.image
                        : `${BASE_URL}${offer.image}`;

                    return (
                        <div className="offer-card" key={offer.id}>
                            {imageUrl && <img src={imageUrl} alt={offer.title} className="offer-image" />}

                            <div className="offer-info">
                                <h3>{offer.title}</h3>
                                {offer.subtitle && <p><strong>{offer.subtitle}</strong></p>}
                                {offer.description && <p>{offer.description}</p>}
                                <p>Validity: {offer.start_date} to {offer.end_date}</p>

                                <button onClick={() => setSelectedOffer(offer)}>
                                    Book now
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 🔥 Booking Popup */}
            {selectedOffer && (
                <div className="booking-overlay">
                    <div className="booking-box">
                        <h2>Book — {selectedOffer.title}</h2>

                        <label>Select Date</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

                        <label>Select Time Slot</label>
                        <div className="slot-container">
                            {["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "6:00 PM"].map((t) => (
                                <button
                                    key={t}
                                    className={slot === t ? "slot active" : "slot"}
                                    onClick={() => setSlot(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="booking-actions">
                            <button className="confirm" onClick={handleConfirmBooking}>
                                Confirm Booking
                            </button>
                            <button className="cancel" onClick={() => setSelectedOffer(null)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔥 Booking success message */}
            {showToast && (
                <div className="toast-success">
                    🎉 Booking Confirmed Successfully!
                </div>
            )}
        </section>
    );
};

export default ExclusiveOffers;
