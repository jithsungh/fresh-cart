import { useState, useEffect, useCallback } from "react";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  doc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/checkout.css";
import { useUser } from "./UserContext";
import AddAddress from "./addAddress";
import ProtectedRoute from "./ProtectedRoute";
import { UserProvider } from "./UserContext"; // Import the UserProvider

function Checkout() {
  const { uid } = useUser();
  const userId = uid;

  const navigate = useNavigate();
  const shippingCost = 210;
  const [loading, setLoading] = useState(false); // To track loading state
  const [addr, setAddr] = useState([]);
  const [user, setUser] = useState({});
  const [addAddr, setAddAddr] = useState(false);

  const location = useLocation();
  const { checkoutItems, visited, backPath } = location.state || {};
  const [items, setItems] = useState(checkoutItems || []);

  // Handle case where state is undefined

  const handleAddAddressClose = () => {
    setAddAddr(false); // Close the AddAddress component
    toast.success("Address added successfully!");
    fetchDefAddr(); // Refresh the address list
  };

  useEffect(() => {
    if (!visited) {
      navigate("/home");
    }
  });

  // const [address, setAddress] = useState("");
  // const [pincode, setPincode] = useState("")
  // const [phoneNumber, setPhoneNumber] = useState("")

  const fetchDefAddr = useCallback(async () => {
    try {
      setLoading(true);
      // Reference the user's document
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const addressIds = userData.addresses || []; // Get the array of address IDs

        if (addressIds.length === 0) {
          console.log("No addresses found for this user.");
          setAddr([]); // Ensure the address state is cleared
          return;
        }

        // Fetch the address details for each address ID
        const addrList = [];
        for (const addrId of addressIds) {
          const addrDocRef = doc(db, "addresses", addrId);
          const addrDocSnapshot = await getDoc(addrDocRef);

          if (addrDocSnapshot.exists()) {
            addrList.push({
              addrId, // Address document ID
              ...addrDocSnapshot.data(), // Address data
            });
          } else {
            console.error(`Address with ID ${addrId} does not exist.`);
          }
        }

        setAddr(addrList);
      } else {
        console.error("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching user addresses:", error);
    }
    finally {
      setLoading(false);
    }
  }, [userId]);

  const handleAddressChange = async (event) => {
    const selectedAddrId = event.target.value; // Get the selected address ID
    if (!selectedAddrId) return;

    try {
      // Update the user's default address in the users collection
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, {
        def_addr: selectedAddrId, // Set the default address ID
      });

      // Update the user state to reflect the change
      setUser((prevUser) => ({
        ...prevUser,
        def_addr: selectedAddrId, // Update the def_addr field in the user state
      }));

      // Optionally, show a success message or toast notification
      toast.success("Default address updated successfully.");
    } catch (error) {
      console.error("Error updating default address:", error);
      toast.error("Failed to update default address.");
    }
  };

  const fetchUserDetails = useCallback(async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(userData); // Store the fetched data in the user state
      } else {
        console.error("No such user document!");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  }, [userId]);

  const handleIncrement = (userId, itemId) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.itemId === itemId
          ? { ...item, quantity: item.quantity + 1 } // Increment quantity by 1
          : item
      )
    );
  };

  const handleDecrement = (userId, itemId) => {
    setItems(
      (prevItems) =>
        prevItems
          .map((item) =>
            item.itemId === itemId
              ? { ...item, quantity: item.quantity - 1 } // Decrement quantity by 1
              : item
          )
          .filter((item) => item.quantity > 0) // Remove items with quantity 0
    );
  };

  // Fetch items on component mount
  useEffect(() => {
    fetchDefAddr();
  }, [fetchDefAddr]);
  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  useEffect(() => {
    console.log("Fetched User Data:", user);
  }, [user]);

  const calculateTotalPrice = (items) => {
    if (!items || items.length === 0) {
      return 0; // Return 0 if the cart is empty
    }
    let totalPrice = 0;

    items.map(
      (item) => (totalPrice += parseFloat(item.price) * parseInt(item.quantity))
    );

    return totalPrice;
  };
  const calculateTotalQuantity = (items) => {
    if (!items || items.length === 0) {
      return 0; // Return 0 if the cart is empty
    }
    let count = 0;

    items.map((item) => (count += parseInt(item.quantity)));

    return count;
  };
  const totalPrice = calculateTotalPrice(items);
  const totalQuantity = calculateTotalQuantity(items);
  console.log(totalQuantity);
  const total = calculateTotalPrice(items) + shippingCost;

  const emptyCart = async () => {
    try {
      // Reference the parent document (user)
      const userDocRef = doc(db, "users", userId);

      // Reference the cart subcollection
      const cartCollectionRef = collection(userDocRef, "cart");

      // Fetch all cart documents
      const cartSnapshot = await getDocs(cartCollectionRef);

      // Create an array of delete operations
      const deletePromises = cartSnapshot.docs.map((docSnapshot) =>
        deleteDoc(docSnapshot.ref)
      );

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      console.log("Cart emptied successfully!");
    } catch (error) {
      console.error("Error emptying the cart:", error);
    }
  };

  const handleOrderPlaced = async (orderId) => {
    toast("Order Placed Successfully: ", orderId);
    const orderData = {
      order_id: orderId,
    };
    try {
      // Reference the specific user's document
      const userDocRef = doc(db, "users", userId);

      // Reference the "orders" subcollection within the user's document
      const orderDocRef = collection(userDocRef, "orders");

      // Add the orderId as a document inside the "orders" subcollection
      const DocRef = await addDoc(orderDocRef, orderData);

      console.log(
        "Order ID added to user's orders subcollection successfully! ",
        DocRef.id
      );
    } catch (error) {
      console.error(
        "Error adding order ID to user's orders subcollection:",
        error
      );
    }
    navigate("/orderplaced", { state: { orderId } });

    // Update the page state
  };
  const handleProceedToPayment = async () => {
    const name = user.name;
    const address = user.def_addr;
    const email = user.email;
    const phoneNumber = user.mobile;

    if (name === "" || address === "" || phoneNumber === "") {
      return toast.error("All fields are required", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
    }

    var options = {
      key: "rzp_test_xETtRhXxTVDfcg",
      key_secret: "Ljjr4P2ywWbhjzGL9j6qfaRB",
      amount: parseInt(total * 100),
      currency: "INR",
      order_receipt: "order_rcptid_" + name,
      name: "Fresh Cart",
      description: "for testing purpose",
      image:
        "https://res.cloudinary.com/dwhf3iqim/image/upload/v1735541097/fclg_njfu3p.png",
      prefill: {
        //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
        name: name, //your customer's name
        email: email,
        contact: phoneNumber, //Provide the customer's phone number for better conversion rates
      },
      handler: async function (response) {
        // console.log(response)
        toast.success("Payment Successful");
        const paymentId = response.razorpay_payment_id;
        // store in firebase
        const orderInfo = {
          ordered_items: items.reduce((acc, item) => {
            acc[item.itemId] = { quantity: item.quantity }; // Store each itemId as a key and its quantity as an object
            return acc;
          }, {}),
          addr_id: user.def_addr,
          name,
          mobile: phoneNumber,
          amount: totalPrice.toFixed(2),
          total: total.toFixed(2),
          date: new Date(),
          email: user.email,
          userid: userId,
          paymentId,
          paymentStatus: "Success",
        };

        try {
          const result = await addDoc(
            collection(db, "pending_orders"),
            orderInfo
          );
          console.log("order placed successfully: ", result.id);
          if (backPath === "/cart") {
            await emptyCart();
          }

          await handleOrderPlaced(result.id);
        } catch (error) {
          console.log(error);
        }
      },
      notes: {
        address: "Vijayawada",
      },

      theme: {
        color: "#28a745",
      },
    };
    var pay = new window.Razorpay(options);
    pay.open();
    console.log(pay);
  };
  if (!items) {
    console.error("No items found in state. Redirecting to cart.");
    navigate(backPath || "/cart"); // Redirect to cart if items are not available
    return null; // Prevent rendering
  }

  return (
    <div className="checkout-container">
      {addAddr && (
        <UserProvider>
          <ProtectedRoute>
            <AddAddress onClose={handleAddAddressClose} />
          </ProtectedRoute>
        </UserProvider>
      )}
      {loading && (
        <div className="loader">
          <img src="loading.gif" alt="loading" />
        </div>
      )}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="navigate-buttons">
        <button
          className="backtocart"
          onClick={() => navigate(backPath || "/cart")}
        >
          Back
        </button>
        <button className="proceedtopayment" onClick={handleProceedToPayment}>
          Proceed to Payment
        </button>
      </div>
      <div className="select-address">
        <div className="box1">
          <div className="text">Select Address</div>
          <button
            className="addAddress-button"
            onClick={() => setAddAddr(true)}
          >
            Add New Address
          </button>
        </div>

        <div className="address-container-checkout">
          <select
            id="Addresses"
            value={user.def_addr || ""} // Set the value to the user's default address ID
            onChange={handleAddressChange} // Handle address change
          >
            {addr.map((address) => (
              <option key={address.addrId} value={address.addrId}>
                {`${address.name}, ${address.door_no}, ${address.building_name}, ${address.area}, ${address.city} - ${address.zip}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="review">
        <div className="text">Review Your Order</div>

        <div className="review-container">
          {items.map((item) => (
            <div key={item.itemId} className="review-item">
              <div className="images-container">
                {item.images &&
                  item.images.map((image, index) =>
                    image ? (
                      <img
                        key={index}
                        src={image}
                        alt={`${item.item_name} ${index}`}
                        className="item-image"
                      />
                    ) : null
                  )}
              </div>
              <div className="item-details">
                <span className="name">{item.item_name}</span>
                <div className="price">
                  <span className="cost">
                    ₹{parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="item-buttons">
                <div className="edit-cart">
                  <button
                    className="decrement-quantity"
                    onClick={() => handleDecrement(userId, item.item_id)}
                  >
                    -
                  </button>
                  <div className="quantity">{item.quantity}</div>
                  <button
                    className="increment-quantity"
                    onClick={() => handleIncrement(userId, item.item_id)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="item-total">
                <span className="total">
                  ₹{parseFloat(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bill-details">
        <div className="text">Bill Details</div>
        <div className="bill-container">
          <div className="bill-item">
            <span className="name">Subtotal</span>
            <span className="cost">₹{totalPrice.toFixed(2)}</span>
          </div>
          <div className="bill-item">
            <span className="name">Shipping</span>
            <span className="cost">₹{parseFloat(shippingCost).toFixed(2)}</span>
          </div>
          <hr className="seperator" />
          <div className="bill-item">
            <span className="name">Total to be paid</span>
            <span className="total">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="navigate-buttons">
        <button className="backtocart" onClick={() => navigate(backPath || "/cart")}>
          Back
        </button>
        <button className="proceedtopayment" onClick={handleProceedToPayment}>
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

export default Checkout;
