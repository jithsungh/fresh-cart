import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, styled } from "@mui/material";
import { OtpInput } from "reactjs-otp-input";
import { firebase, firestore } from "./firebase-config";
import "./styles/signup.css";
import { useUser } from "./UserContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const FormInput = styled(Box)({
  display: "flex",
  gap: "12px",
});
const FormOTP = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "24px",
});

function Signup() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [usePhone, setUsePhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { login } = useUser();

  const setupRecaptcha = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      "sign-in-button",
      {
        size: "invisible",
        defaultCountry: "IN",
      }
    );
  };

  const handleSendOTP = async () => {
    setLoading(true);
    if (phoneNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    const appVerify = window.recaptchaVerifier;
    const formattedPhone = `+91${phoneNumber}`;
    setUsePhone(formattedPhone);

    await firebase
      .auth()
      .signInWithPhoneNumber(formattedPhone, appVerify)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        setLoading(false);
        toast("OTP has been sent");
        setShowOtp(true);
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
        toast.error("Failed to send OTP");
      });
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    try {
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      toast("OTP verified");

      // Store user details in Firestore
      await firestore.collection("users").doc(user.uid).set({
        name,
        email,
        mobile: usePhone,
      });
      setLoading(false);
      toast("User registered successfully");
      login(user.uid);
      navigate("/home"); // Redirect to a dashboard or desired route
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast.error("Failed to verify OTP");
    }
  };

  const handleNext = () => {
    if (!name || !email) {
      toast.info("Please fill out all details");
      return;
    }
    setShowMobileForm(true);
  };

  useEffect(() => {
    setupRecaptcha();
  }, []);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,10}$/.test(value)) {
      setPhoneNumber(value);
    }
  };
  const NavigateToLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <div className="signup-container">
        {loading && (
          <div className="loader">
            <img src="loading.gif" alt="loading" />
          </div>
        )}
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
        <div className="signupcard">
          <div className="image">
            <img src="fclg.png" alt="" />
          </div>
          <div className="form">
            <h1>Register</h1>
            <FormOTP>
              {!showMobileForm && !showOtp && (
                <FormInput>
                  <div className="details">
                    <TextField
                      className="name"
                      variant="outlined"
                      label="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                      className="email"
                      variant="outlined"
                      label="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                      className="next-button"
                      variant="contained"
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  </div>
                </FormInput>
              )}

              {showMobileForm && !showOtp && (
                <FormInput>
                  <div className="mobile">
                    <TextField
                      className="mobile-input"
                      variant="outlined"
                      label="Phone Number"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                    />
                    <Button
                      className="send-otp-button"
                      variant="contained"
                      onClick={handleSendOTP}
                    >
                      Send OTP
                    </Button>
                  </div>
                </FormInput>
              )}

              {showOtp && (
                <FormInput>
                  <div className="otp">
                    <div className="message">
                      OTP has been sent to <i>{usePhone}</i>
                    </div>
                    <div
                      className="changeNumber"
                      onClick={() => {
                        setShowOtp(false);
                        setShowMobileForm(true);
                      }}
                    >
                      <span>Click here</span> to edit phone number
                    </div>
                    <OtpInput
                      value={otp}
                      onChange={setOtp}
                      numInputs={6}
                      separator={<pre></pre>}
                      className="otp-separator"
                    />
                    <div className="button">
                      <Button
                        className="verify-otp-button"
                        variant="contained"
                        onClick={handleVerifyOTP}
                      >
                        Verify
                      </Button>
                      <Button
                        className="resend-otp-button"
                        variant="contained"
                        onClick={handleSendOTP}
                      >
                        Resend
                      </Button>
                    </div>
                  </div>
                </FormInput>
              )}
            </FormOTP>
            <p>
              Already have an account?{" "}
              <span className="register" onClick={NavigateToLogin}>
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
      <div id="sign-in-button"></div>
    </>
  );
}

export default Signup;
