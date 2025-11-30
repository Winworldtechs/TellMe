# Payment successful hone ke baad
payment_data = {
    "user_id": user.id,
    "amount": 15000,
    "status": "success",
    "order_id": order.id
}

# Notification Service ko call karega
send_notification_payload = {
    "user_email": "aman12@gmail.com",
    "category": "Payment",
    "title": "Payment Successful",
    "message": "Aapki Rs. 15,000 ki payment safal ho gayi hai.",
    "payload": payment_data
}

# Yah function Notification Service ko data bhejta hai
notification_service.send_notification(send_notification_payload)