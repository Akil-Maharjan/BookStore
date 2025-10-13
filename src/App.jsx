import React from "react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import AppRoutes from "./router.jsx";
import "./index.css";
import AuthBootstrap from "./components/AuthBootstrap.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

function App() {
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <AuthBootstrap />
        <ScrollToTop behavior="smooth" />
        <Navbar />
        <main className="min-h-screen flex-1">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </>
  );
}

export default App;
