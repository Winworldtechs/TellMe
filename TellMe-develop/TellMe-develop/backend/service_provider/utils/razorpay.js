export const startRazorpayPayment = async (orderId) => {
  try {
    // 1️⃣ Backend — Create Razorpay Order
    const res = await fetch(`http://127.0.0.1:8000/api/barcodes/orders/${orderId}/create_razorpay_order/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    });

    const data = await res.json();

    if (!data.razorpay_order_id) {
      alert("Failed to initiate payment");
      return;
    }

    // 2️⃣ Razorpay Options
    const options = {
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      name: "Smart Barcode",
      description: "Barcode Purchase Payment",
      order_id: data.razorpay_order_id,

      handler: async function (response) {
        // 3️⃣ Verify Payment API
        const verifyRes = await fetch(
          `http://127.0.0.1:8000/api/barcodes/orders/${orderId}/verify_payment/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
            body: JSON.stringify(response),
          }
        );

        const verifyData = await verifyRes.json();
        alert(verifyData.message || "Payment verified!");
      },

      theme: {
        color: "#3399cc",
      },
    };

    // 4️⃣ Open Razorpay Popup
    const paymentWindow = new window.Razorpay(options);
    paymentWindow.open();

  } catch (error) {
    console.error(error);
    alert("Payment error occurred");
  }
};
