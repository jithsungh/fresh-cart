import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, styled } from "@mui/material";
import { OtpInput } from "reactjs-otp-input";
import { firebase } from "./firebase-config";
import "./styles/login.css";
import { useUser } from "./UserContext";
import { ToastContainer, toast } from "react-toastify";
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
function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [usePhone, setUsePhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useUser();

  const navigate = useNavigate();

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
      alert("Please enter a valid 10-digit phone number.");
      setLoading(false);
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
    window.confirmationResult
      .confirm(otp)
      .then(async (result) => {
        console.log(result);
        const user = result.user; // Get the user object

        // Check if the user exists in the database
        const userRef = firebase.firestore().collection("users").doc(user.uid);
        const doc = await userRef.get();

        if (doc.exists) {
          // User exists, set the UID in the UserContext
          login(user.uid);
          setLoading(false);
          toast.success("Login successful");
          // Optionally, navigate to a different page after successful login
          navigate("/home"); // Example: Navigate to home page
        } else {
          // User does not exist, alert and navigate to register page
          setLoading(false);
          toast.warn("User not found. Please register.");
          navigate("/signup");
        }
      })
      .catch((error) => {
        setLoading(false);
        console.log(error);
        toast.error("Failed to verify OTP");
      });
  };

  const NavigateToRegister = () => {
    navigate("/signup");
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

  return (
    <>
      <div className="login-container">
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

        <div className="logincard">
          <div className="image">
            <img src="fclg.png" alt="" />
          </div>
          <div className="form">
            <h1>Login</h1>
            <FormOTP>
              {!showOtp && (
                <FormInput>
                  <div className="mobile">
                    <TextField
                      className="mobile-input"
                      variant="outlined"
                      label="Phone Number"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "#137e2c", // Default border color
                          },
                          "&:hover fieldset": {
                            borderColor: "#e01b49", // Hover border color
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#137e2c", // Focus border color
                          },
                        },
                      }}
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
                      onClick={() => setShowOtp(false)}
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
              Don't have an account?{" "}
              <span className="register" onClick={NavigateToRegister}>
                Register
              </span>
            </p>
          </div>
        </div>
      </div>
      <div id="sign-in-button"></div>
    </>
  );
}

export default Login;
