import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Outlet,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

/* GLOBAL COMPONENTS */
import Header from "./components/Header";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

/* HOME PAGE SECTIONS */
import HeroSection from "./components/HeroSection";
import ServiceCategories from "./components/ServiceCategories";
import ExclusiveOffers from "./components/ExclusiveOffers";
import TodaysDeals from "./components/TodaysDeals";
import RecentlyAddedServices from "./components/RecentlyAddedServices";
import SecurityBanner from "./components/SecurityBanner";
import MostBooked from "./components/MostBooked";

/* DEAL DETAILS */
import DealDetails from "./components/DealDetails";

/* AUTH */
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/ProfilePage";
import Protected from "./utils/Protected";

/* CART */
import CartPage from "./components/CartPage";

/* SOS */
import CarPooling from "./pages/CarPooling";

/* HEALTH CARE */
import Healthcare from "./pages/Healthcare";
import Nearby from "./pages/Nearby";

/* HOME SERVICES */
import ApplianceRepair from "./pages/ApplianceService";
import PlumbingService from "./pages/PlumbingService";
import CleaningService from "./pages/CleaningService";
import InstallationService from "./pages/InstallationService";

/* MOST BOOKED */
import BikeWash from "./pages/BikeWash";
import CarWash from "./pages/CarWash";
import ElectricInstallation from "./pages/ElectricInstallation";
import ElectricRepair from "./pages/ElectricRepair";

/* OTHER */
import ElectricServices from "./pages/ElectricServices";
import Trainer from "./pages/Trainer";

/* RENT MACHINES */
import DrillPage from "./pages/DrillPage";
import CementMixerPage from "./pages/CementMixerPage";
import DieselGeneratorPage from "./pages/DieselGeneratorPage";
import ConcreteBreakerPage from "./pages/ConcreteBreakerPage";

/* DAILY NEEDS */
import Fruits from "./pages/VendorItems";
import Vegetables from "./pages/VendorItems";
import Dairy from "./pages/Dairy";
import Snacks from "./pages/Snacks";

/* FORMS */
import VehicleForm from "./pages/VehicleForm";
import MobileLaptopForm from "./pages/MobileLaptopForm";
import LandForm from "./pages/LandForm";
import FlatForm from "./pages/FlatForm";
import OtherForm from "./pages/OtherForm";

/* PROVIDER DETAILS */
import ProviderDetails from "./pages/ProviderDetails";

/* ⭐ NEW Vendor Auth Screens */
import VendorRegister from "./pages/VendorRegister";
import VendorLogin from "./pages/VendorLogin";
import ProviderCreate from "./pages/ProviderCreate";

/* ⭐ NEW Forget / Reset Password */
import VendorForgotPassword from "./pages/VendorForgotPassword";
import VendorResetPassword from "./pages/VendorForgotPassword";

import MostBookedDetails from "./pages/MostBookedDetails";

/* --------------------------- HIDE HEADER LOGIC --------------------------- */
function LayoutWithHeader() {
  const location = useLocation();
  const hideHeaderRoutes = [
    "/vendor/login",
    "/vendor/register",
    "/vendor/forgot-password",
    "/vendor/reset-password"
  ];

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
      <main className="content">
        <Outlet />
      </main>
      {!hideHeaderRoutes.includes(location.pathname) && <Footer />}
    </>
  );
}

/* --------------------------- MAIN APP ----------------------------------- */

function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <Loader />;

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Layout with header/footer */}
          <Route element={<LayoutWithHeader />}>
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <ServiceCategories />
                  <ExclusiveOffers />
                  <TodaysDeals />
                  <RecentlyAddedServices />
                  <SecurityBanner />
                  <MostBooked />
                </>
              }
            />

            {/* Dealer Details */}
            <Route path="/deal/:slug" element={<DealDetails />} />
            <Route path="/provider/:id/:slug" element={<ProviderDetails />} />

            {/* After vendor registers */}
            <Route path="/vendor/create-profile" element={<ProviderCreate />} />

            {/* All remaining routes with header */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/profile"
              element={
                <Protected>
                  <Profile />
                </Protected>
              }
            />

            <Route path="/cart" element={<CartPage />} />

            <Route path="/sos/car-pooling" element={<CarPooling />} />

            <Route path="/health-care/homeservice/home" element={<Healthcare />} />
            <Route path="/health-care/physio" element={<Nearby type="physio" />} />
            <Route path="/health-care/dentist" element={<Nearby type="dentist" />} />

            <Route path="/appliance-repair/:service" element={<ApplianceRepair />} />
            <Route path="/plumbing-service" element={<PlumbingService />} />
            <Route path="/cleaning-service" element={<CleaningService />} />
            <Route path="/installation-service" element={<InstallationService />} />

            <Route path="/vehicle-care/bike-wash" element={<BikeWash />} />
            <Route path="/vehicle-care/car-wash" element={<CarWash />} />
            <Route path="/electric-installation" element={<ElectricInstallation />} />
            <Route path="/electric-repair" element={<ElectricRepair />} />

            <Route path="/electric-services" element={<ElectricServices />} />
            <Route path="/trainer-services" element={<Trainer />} />

            <Route path="/rent-machines/drill" element={<DrillPage />} />
            <Route path="/rent-machines/cement-mixer" element={<CementMixerPage />} />
            <Route path="/rent-machines/diesel-generator" element={<DieselGeneratorPage />} />
            <Route path="/rent-machines/concrete-breaker" element={<ConcreteBreakerPage />} />

            <Route path="/daily-needs/fruits" element={<Fruits />} />
            <Route path="/daily-needs/vegetables" element={<Vegetables />} />
            <Route path="/daily-needs/dairy" element={<Dairy />} />
            <Route path="/daily-needs/moreother" element={<Snacks />} />

            <Route path="/barcode/vehicle/bike" element={<VehicleForm type="bike" />} />
            <Route path="/barcode/vehicle/car" element={<VehicleForm type="car" />} />
            <Route path="/barcode/electronics/mobile" element={<MobileLaptopForm deviceType="mobile" />} />
            <Route path="/barcode/electronics/laptop" element={<MobileLaptopForm deviceType="laptop" />} />
            <Route path="/barcode/property/land" element={<LandForm />} />
            <Route path="/barcode/property/flat" element={<FlatForm />} />
            <Route path="/barcode/more/more" element={<OtherForm />} />


            <Route path="/most-booked/:id/:slug" element={<MostBookedDetails />} />
          </Route>

          {/* ------------------- Pages WITHOUT Header & Footer ------------------ */}
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/vendor/register" element={<VendorRegister />} />
          <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
          <Route path="/vendor/reset-password/:token" element={<VendorResetPassword />} />

          {/* FALLBACK */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
