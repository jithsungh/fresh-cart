import React, { useEffect, useState } from "react";
import "./styles/account.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./profile";
import Address from "./address";
import Orders from "./orders";
import Lists from "./lists";
import CustomerCare from "./customerCare";

const Account = () => {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      icon: <i class="bx bx-user-circle"></i>,
      label: "Profile",
    },
    {
      id: "my-addresses",
      icon: <i class="bx bxs-map"></i>,
      label: "My Addresses",
    },
    {
      id: "my-orders",
      icon: <i class="bx bxs-package"></i>,
      label: "My Orders",
    },
    {
      id: "my-lists",
      icon: <i class="bx bxs-receipt"></i>,
      label: "My Lists",
    },
    {
      id: "customercare",
      icon: <i class="bx bxs-conversation"></i>,
      label: "Customer Care",
    },
  ];

  const changeBackground = (name) => {
    setActiveTab(name);

    // Reset styles for all tabs
    tabs.forEach((tab) => {
      const element = document.getElementById(tab.id);
      if (element) {
        element.style.backgroundColor = "white";
        element.style.color = "black";
        element.style.margin = "20px";
      } else {
        console.error(`Element with id "${tab.id}" not found.`);
      }
    });

    // Apply styles to the active tab
    const activeElement = document.getElementById(name);
    if (activeElement) {
      activeElement.style.backgroundColor = "#28a745";
      activeElement.style.color = "white";
      activeElement.style.margin = "20px 0px 20px 40px";
    } else {
      console.error(`Element with id "${name}" not found.`);
    }
  };

  useEffect(() => {
    changeBackground(activeTab);
  });
  
  return (
    <div className="account">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="navigation-bar">
        {tabs.map((tab) => (
          <div key={tab.id} className={tab.id}>
            <div
              id={tab.id}
              className={`tab ${tab.id === activeTab ? "active" : ""}`}
              onClick={() => changeBackground(tab.id)}
            >
              <span>
                {tab.icon} {tab.label}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="account-container">
        {activeTab === "profile" && <Profile />}
        {activeTab === "my-addresses" && <Address />}
        {activeTab === "my-orders" && <div className="order--container"><Orders /></div>}
        {activeTab === "my-lists" && <Lists />}
        {activeTab === "customercare" && <CustomerCare />}
      </div>
    </div>
  );
};

export default Account;
