import React from "react";
import "./styles/customerCare.css";
import { Button } from "@mui/material";

const CustomerCare = () => {
  return (
    <div className="customerCare-container">
      <div className="header">
        <h1>Customer Care</h1>
        <pre> </pre>
        <h3> we are here to help you</h3>
      </div>
      <hr />
      <div className="body">
        <p>
          If you have any questions, concerns, or feedback, our customer care
          team is here to help. We value your input and strive to provide
          exceptional customer service. Please feel free to reach out to us. Our
          dedicated team is always available to address your inquiries and
          address your concerns.
        </p>

        <div className="reachus">
          <h2>Reach Us</h2>
          <div className="buttons">
            <a href="mailto:jithsunghsai@gamil.com">
              <Button variant="contained" className="mail-us">
                <i class="bx bx-mail-send"></i>
                <pre> </pre>Email us
              </Button>
            </a>
            <a href="tel:+917032909135">
              <Button variant="contained" className="call-us">
                <i class="bx bx-phone-call"></i>
                <pre> </pre>Call us
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCare;
