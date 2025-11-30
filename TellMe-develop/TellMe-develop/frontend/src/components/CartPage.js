import React, { useState, useEffect } from 'react';
import './CartPage.css';

const initialCartItems = [
  {
    id: 1,
    title: "Front load cleaning",
    distance: "2 km away",
    image: "https://via.placeholder.com/55",
  },
  {
    id: 2,
    title: "Hair cut",
    distance: "2 km away",
    image: "https://via.placeholder.com/55",
  },
];

const CartPage = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [cartCount, setCartCount] = useState(initialCartItems.length);

  // Reset cart count when CartPage is viewed
  useEffect(() => {
    setCartCount(0);
  }, []);

  const removeItem = (id) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
  };

  const confirmBooking = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }
    alert(`Booking confirmed for ${cartItems.length} service(s)!`);
  };

  const editAddress = () => alert("Edit Address clicked");
  const editSlot = () => alert("Edit Slot clicked");

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h2>Your cart</h2>
        {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
      </div>

      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-left">
                <img src={item.image} alt={item.title} />
                <div className="cart-item-info">
                  <strong>{item.title}</strong>
                  <small>📍 {item.distance}</small>
                </div>
              </div>
              <button className="remove-btn" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
        </div>

        <div className="cart-details">
          <div className="cart-detail-block">
            <div>
              <strong>📍 Address</strong>
              <p>Home - 1234, main street, Indore</p>
            </div>
            <button className="edit-btn" onClick={editAddress}>Edit</button>
          </div>
          <div className="cart-detail-block">
            <div>
              <strong>🕒 Slot</strong>
              <p>Mon, Oct 08, 01:00 PM</p>
            </div>
            <button className="edit-btn" onClick={editSlot}>Edit</button>
          </div>
          <button className="confirm-btn" onClick={confirmBooking}>confirm booking</button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;