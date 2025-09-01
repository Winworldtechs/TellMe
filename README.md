# 📱 TellMe – Service Providing App

## ✅ Objective
To develop a mobile application that connects users with nearby service providers across various categories like home services, vehicle maintenance, salons, and doctors. It also includes features like barcode-linked vehicle contact, vendor promotions, and easy registration for service providers.

---

## 🧩 Key Features

### 👤 User Login
- Login via Google Authentication for quick and secure access.

### 🗂️ Main Service Categories
- Home Services – Plumbing, Electrical, Carpentry, etc.
- Nearby Services – Location-based discovery.
- Car Service Center
- Bike Service Center
- Car Washing Center
- Bike Washing Center
- Car Pulling / Roadside Assistance Service 🚗⚡
- Salon Services
- Doctor Appointment Booking
- Home Appliance Repair – AC, Refrigerator, Washing Machine, etc.

### 🧾 Barcode Feature
- Each vehicle can be linked with a unique barcode.
- On scanning the barcode:
  - Users can contact the vehicle owner.
  - Send pre-listed notifications (Inquiry, Emergency Help, Offers).
- Users can order a custom barcode for their vehicle from the app.

### 💥 Great Deal – Vendor Promotion (In User App)
- Vendors/Users can post their products or services for sale or promotion.
- Includes:
  - Picture
  - Product/Service Name
  - Description
  - Contact Details
- Displayed under a section called **Great Deal** visible to all users.

### 🧑‍🔧 Service Provider Registration
- Service providers can register through the app using a simple form.
- **Details Collected:**
  - Business/Provider Name
  - Category of Service (e.g., Car Wash, Salon, Plumbing)
  - Location (via map or manual input)
  - Contact Number
  - Service Description
  - Upload ID Proof / Business License
  - Upload Profile Image or Logo
- **Status:**
  - Admin approval required before services go live.
  - After Approval:
    - Can receive customer bookings
    - Appear in Nearby Services based on location
    - Can promote deals in Great Deal section

### 💰 Paid Promotions for Service Providers
- Service providers can subscribe to a monthly plan to promote their services.
- Promotion Post Includes:
  - Image
  - Product/Service Name
  - Description
  - Contact Number
- Visible to all users in the **Great Deal** section.

---

## 🚀 End-to-End Project Plan – (React.js + Node.js)

### 📌 Phase 1: Project Setup
1. **Environment Setup**
   - Install: Node.js, npm/yarn, VSCode, Git, Postman, MongoDB/MySQL, Docker (optional).
   - Repositories:
     - `service-app-backend` (Node.js + Express)
     - `service-app-frontend` (React.js)

2. **Project Structure**

**Backend (Node.js + Express)**
```
service-app-backend/
 ┣ src/
 ┃ ┣ config/        # DB, env config
 ┃ ┣ controllers/   # Request handlers
 ┃ ┣ models/        # DB Schemas
 ┃ ┣ routes/        # API endpoints
 ┃ ┣ middleware/    # Auth, logger
 ┃ ┗ utils/         # Helpers
 ┣ tests/
 ┣ index.js
 ┗ package.json
```

**Frontend (React.js)**
```
service-app-frontend/
 ┣ src/
 ┃ ┣ components/   # Reusable UI
 ┃ ┣ pages/        # Home, Services, Deals
 ┃ ┣ services/     # API calls
 ┃ ┣ context/      # Auth, global state
 ┃ ┣ assets/       # Icons, images
 ┃ ┗ App.js
 ┣ public/
 ┗ package.json
```

---

### 📌 Phase 2: Database Design (MongoDB Example)
**Collections**
- Users: id, name, email, phone, google_auth_id, role, vehicles[]
- Services: id, category, subCategory, name, description, location, contact, vendor_id
- Barcodes: id, vehicle_id, user_id, barcode_number, status
- Deals: id, user_id, title, description, picture_url, contact_number, status
- Bookings: id, user_id, service_id, status (pending/confirmed/completed)
- SOS Requests: id, user_id, vehicle_id, location, type (pull/repair), status

---

### 📌 Phase 3: API Design
**Base URL:** `/api/v1/`

- **Auth**
  - `POST /auth/google` → Login with Google
  - `GET /auth/me` → Get user profile

- **User**
  - `PUT /user/:id` → Update profile
  - `GET /user/:id` → Get user details

- **Service Provider**
  - `POST /service/register` → Vendor registration
  - `GET /service/categories` → List categories
  - `GET /service/nearby` → Nearby services (location filter)

- **Barcode**
  - `POST /barcode/order` → Order new vehicle barcode
  - `GET /barcode/:number` → Scan barcode → fetch owner + contact

- **Deals**
  - `POST /deals` → Create promotion
  - `GET /deals` → Get all deals

- **SOS / Car Pulling**
  - `POST /sos/request` → Request car pulling/repair help
  - `GET /sos/nearby` → Fetch nearby SOS requests

---

### 📌 Phase 4: Frontend Development
**Pages**
- Login/Signup (Google login)
- Home Dashboard (Services & Categories)
- Service Provider Registration (form)
- Barcode Section (order + scan barcode)
- Deals Section (promote services/items)
- SOS/Car Pulling (request + helpers nearby)

**Libraries**
- Auth: Firebase Auth (Google login)
- API: Axios
- State: Context API / Redux
- Maps: Google Maps API / Leaflet.js
- Barcode: react-qr-scanner / jsbarcode

---

### 📌 Phase 5: Deployment
- **Backend:** AWS EC2 / Render / Railway / Heroku (NGINX proxy)
- **Database:** MongoDB Atlas / AWS RDS
- **Frontend:** Vercel / Netlify / AWS S3 + CloudFront
- **CI/CD:** GitHub Actions, ESLint, Jest

---

### 📌 Phase 6: Usage Flow
1. User logs in with Google.
2. Browse services by category or nearby search.
3. Book service → stored in Bookings.
4. Order barcode → linked with vehicle.
5. Scan barcode → fetch owner & contact.
6. Great Deals section → promotions visible.
7. SOS request → notifies nearby helpers/vendors.

---

### 📌 Phase 7: Roles & Responsibilities
- **Backend Developer:** Setup APIs, DB models.
- **Frontend Developer:** Build UI, integrate APIs.
- **DevOps/Deployment:** Setup servers, CI/CD pipelines.
- **Tester (QA):** Validate APIs, UI, and app flows.

---

## 📌 Tech Stack
- **Frontend:** React.js, TailwindCSS (optional), Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB / MySQL
- **Auth:** Firebase Authentication (Google)
- **Hosting:** AWS / Vercel / Netlify
