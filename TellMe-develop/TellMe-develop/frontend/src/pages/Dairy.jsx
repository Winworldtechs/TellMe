import React, { useState } from "react";
import "../styles/DailyNeeds.css";
import dairyImg from "../assets/images/dairy.png";

// PRODUCT IMAGES
import milkImg from "../assets/images/milk.png";
import gheeImg from "../assets/images/ghee.png";
import biscuitImg from "../assets/images/biscuit.png";
import chipsImg from "../assets/images/chips.png";

// LOCATION ICON
import locationIcon from "../assets/icons/location.png";

const Dairy = () => {
  const [openPopup, setOpenPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chosenQty, setChosenQty] = useState({});
  const [cart, setCart] = useState([]);

  const products = [
    {
      id: 1,
      name: "Milk",
      type: "Dairy",
      pricePer: 60,
      image: milkImg,
      qtyOptions: [
        { label: "½ L", value: 0.5 },
        { label: "1 L", value: 1 },
        { label: "2 L", value: 2 },
      ],
    },
    {
      id: 2,
      name: "Ghee",
      type: "Dairy",
      pricePer: 500,
      image: gheeImg,
      qtyOptions: [
        { label: "250g", value: 0.25 },
        { label: "500g", value: 0.5 },
        { label: "1 Kg", value: 1 },
      ],
    },
    {
      id: 3,
      name: "Biscuit",
      type: "Snack",
      pricePer: 10,
      image: biscuitImg,
      qtyOptions: [
        { label: "1 Pc", value: 1 },
        { label: "2 Pc", value: 2 },
        { label: "5 Pc", value: 5 },
      ],
    },
    {
      id: 4,
      name: "Chips",
      type: "Snack",
      pricePer: 20,
      image: chipsImg,
      qtyOptions: [
        { label: "1 Pc", value: 1 },
        { label: "2 Pc", value: 2 },
        { label: "5 Pc", value: 5 },
      ],
    },
  ];

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (item, qty) => {
    if (!qty) return;
    setCart((prev) => [...prev, { ...item, qty }]);
  };

  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.qty * i.pricePer, 0);

  return (
    <div className="daily-container">
      <h2>Dairy Products</h2>

      <div className="daily-card">
        <img src={dairyImg} alt="Dairy" />

        <div className="daily-info">
          <h3>Pure Dairy Items</h3>
          <p>Fresh milk, cheese, butter and ghee.</p>

          {/* Location */}
          <div className="dn-location">
            <img src={locationIcon} alt="location" className="dn-loc-icon" />
            <span>1.2 km away</span>
          </div>

          <div className="dn-rating">
            <span className="star">⭐</span>
            <span className="rate-value">4.8</span>
          </div>

          <p className="price">₹60 / litre</p>

          <button onClick={() => setOpenPopup(true)}>Book Now</button>
        </div>
      </div>

      {/* POPUP */}
      {openPopup && (
        <div className="dn-popup-bg" onClick={() => setOpenPopup(false)}>
          <div className="dn-popup" onClick={(e) => e.stopPropagation()}>

            {/* Top Bar */}
            <div className="dn-top-bar">
              <input
                type="text"
                className="dn-popup-search"
                placeholder="Search Dairy / Snacks"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button className="dn-close" onClick={() => setOpenPopup(false)}>
                ✕
              </button>
            </div>

            <div className="dn-main">
              {/* LEFT SIDE */}
              <div className="dn-left">
                <h4>Categories</h4>
                <p>Dairy</p>
                <p>Snacks</p>
              </div>

              {/* RIGHT SIDE - LIST VIEW */}
              <div className="dn-right">
                {filteredProducts.map((item) => (
                  <div key={item.id} className="dn-item-row">
                    <div className="dn-item-left">
                      <img src={item.image} alt={item.name} className="dn-item-img" />

                      <div className="dn-item-info">
                        <h4>{item.name}</h4>
                        <p className="dn-price">₹{item.pricePer}</p>

                        <div className="dn-qty-row">
                          {item.qtyOptions.map((o) => (
                            <label key={o.value} className="dn-qty-option">
                              <input
                                type="radio"
                                name={`qty-${item.id}`}
                                checked={chosenQty[item.id] === o.value}
                                onChange={() =>
                                  setChosenQty({ ...chosenQty, [item.id]: o.value })
                                }
                              />
                              {o.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      className="dn-add-btn"
                      onClick={() => addToCart(item, chosenQty[item.id])}
                    >
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY */}
            <div className="dn-summary">
              <p>Total Qty: {totalQty}</p>
              <p>Total Price: ₹{totalPrice}</p>

              <button className="dn-proceed-btn">Proceed To Book</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dairy;
