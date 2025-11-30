import React, { useEffect, useState, useContext } from "react";
import "./Venders.css";
import { AuthContext } from "../context/AuthContext";   // ✅ Correct import

import locationIcon from "../assets/icons/location.png";

const BASE_URL = "http://127.0.0.1:8000/api/services";

// ------------ API CALLS ----------------
async function fetchVendors() {
  const res = await fetch(`${BASE_URL}/grocery/vendors/`);
  return await res.json();
}

async function fetchVendorItems(slug) {
  const res = await fetch(`${BASE_URL}/grocery/vendors/${slug}/items/`);
  return await res.json();
}

async function createBooking(payload) {
  const token = localStorage.getItem("access");

  const res = await fetch(`${BASE_URL}/grocery/book/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(payload),
  });

  return await res.json();
}

// ------------ COMPONENT ----------------
const VendorItems = () => {
  const { user } = useContext(AuthContext);   // ✅ No error

  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [cart, setCart] = useState([]);
  const [chosenQty, setChosenQty] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);

  const qtyOptions = [
    { label: "½ kg", value: 0.5 },
    { label: "1 kg", value: 1 },
    { label: "1½ kg", value: 1.5 },
    { label: "3 kg", value: 3 },
    { label: "5 kg", value: 5 },
  ];

  // Load vendors
  useEffect(() => {
    fetchVendors().then((data) => setVendors(data));
  }, []);

  // Open popup & load items
  const openVendorPopup = async (vendor) => {
    setSelectedVendor(vendor);
    setOpenPopup(true);
    setLoadingItems(true);

    const data = await fetchVendorItems(vendor.slug);
    setItems(data);
    setLoadingItems(false);
  };

  // Add to cart
  const addToCart = (item, qty) => {
    if (!qty) return alert("Please select quantity");

    setCart((prev) => {
      const exists = prev.find((c) => c.id === item.id);
      if (exists) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, qty } : c
        );
      }
      return [...prev, { ...item, qty }];
    });
  };

  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce(
    (sum, i) => sum + i.qty * i.price_per_kg,
    0
  );

  // BOOKING API
  const proceedToBook = async () => {
    if (!cart.length) return alert("Cart is empty");
    if (!user) return alert("Please login first");

    const payload = {
      vendorId: selectedVendor.id,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        qty: i.qty,
        price: i.price_per_kg,
      })),
      totalQty,
      totalPrice,
    };

    const response = await createBooking(payload);

    if (response.booking_id) {
      alert("Booking Successful! Order ID: " + response.booking_id);
      setCart([]);
      setOpenPopup(false);
    } else {
      alert("Booking failed");
      console.log("ERR:", response);
    }
  };

  return (
    <div className="vendor-wrapper">
      <h2>🛍️ Nearby Vendors</h2>

      <div className="vendor-list">
        {vendors.map((v) => (
          <div
            key={v.id}
            className="vendor-card"
            onClick={() => openVendorPopup(v)}
          >
            <img src={v.image_url} alt={v.name} />
            <h3>{v.name}</h3>

            <div className="vendor-info-vertical">
              <div className="vendor-rating-row">
                <span className="vendor-rating">⭐ {v.rating}</span>
              </div>

              <div className="vendor-location-row">
                <img src={locationIcon} className="vendor-loc-icon" />
                <span>{v.distance}</span>
              </div>
            </div>

            <button className="book-btn">View Items</button>
          </div>
        ))}
      </div>

      {/* Popup */}
      {openPopup && selectedVendor && (
        <div className="new-popup-bg" onClick={() => setOpenPopup(false)}>
          <div className="new-popup" onClick={(e) => e.stopPropagation()}>
            {/* Search Bar */}
            <div className="popup-top-bar">
              <input
                className="new-search"
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="new-close" onClick={() => setOpenPopup(false)}>
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="new-main">
              <div className="right-items-list">
                {loadingItems ? (
                  <p>Loading...</p>
                ) : (
                  items
                    .filter((i) =>
                      i.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((item) => (
                      <div key={item.id} className="item-row">
                        <div className="item-left">
                          <img src={item.image_url} className="item-img" />
                          <div>
                            <h4>{item.name}</h4>
                            <p className="price">₹{item.price_per_kg}/kg</p>
                          </div>
                        </div>

                        <div className="item-right">
                          <select
                            className="qty-select"
                            value={chosenQty[item.id] || ""}
                            onChange={(e) =>
                              setChosenQty({
                                ...chosenQty,
                                [item.id]: Number(e.target.value),
                              })
                            }
                          >
                            <option value="">Qty</option>
                            {qtyOptions.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>

                          <button
                            className="add-btn"
                            onClick={() => addToCart(item, chosenQty[item.id])}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Summary */}
            <div className="summary">
              <p>Total Quantity: {totalQty} kg</p>
              <p>Total Price: ₹{totalPrice}</p>

              <button className="proceed-btn" onClick={proceedToBook}>
                Proceed To Book
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorItems;
