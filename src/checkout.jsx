import { useState, useEffect, useCallback } from "react";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { incrementCartItem } from "./functions/incrementCartItem";
import { decrementCartItem } from "./functions/decrementCartItem";
import {
  doc,
  collection,
  getDocs,
  addDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/checkout.css";
import { useUser } from "./UserContext";

function Checkout() {
  const { uid } = useUser();
  const userId = uid;

  const navigate = useNavigate();
  const shippingCost = 210;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true); // To track loading state
  const [addr, setAddr] = useState([]);
  const [user, setUser] = useState({});

  const location = useLocation();
  const cartVisited = location.state || false;

  useEffect(() => {
    if (!cartVisited) {
      navigate("/cart");
    }
  });

  // const [address, setAddress] = useState("");
  // const [pincode, setPincode] = useState("")
  // const [phoneNumber, setPhoneNumber] = useState("")

  const fetchDefAddr = useCallback(async () => {
    try {
      // Reference the user's addresses subcollection
      const userAddressesRef = collection(
        doc(db, "users", userId),
        "addresses"
      );
      const userAddressesSnapshot = await getDocs(userAddressesRef);

      if (userAddressesSnapshot.empty) {
        console.log("No addresses found for this user.");
        setAddr([]); // Ensure the address state is cleared
        return;
      }

      const addrList = [];

      // Loop through each document in the user's addresses subcollection
      for (const userAddrDoc of userAddressesSnapshot.docs) {
        const { addr_id: addrId } = userAddrDoc.data();

        if (addrId) {
          // Fetch the address details from the main addresses collection
          const addrDocRef = doc(db, "user_address", addrId);
          const addrDocSnapshot = await getDoc(addrDocRef);

          if (addrDocSnapshot.exists()) {
            addrList.push({
              addrId, // Address document ID from the main addresses collection
              ...addrDocSnapshot.data(), // Address data
            });
          } else {
            console.error(
              `Address with ID ${addrId} does not exist in the "addresses" collection.`
            );
          }
        } else {
          console.error("Address document does not have an addr_id field.");
        }
      }

      // Update the state with the fetched address list
      setAddr(addrList);
    } catch (error) {
      console.error("Error fetching user addresses:", error);
    }
  }, [userId]);

  const fetchItems = useCallback( async () => {
    try {
      setLoading(true); // Start loading

      // Reference the user's cart subcollection
      const cartCollectionRef = collection(doc(db, "users", userId), "cart");
      const cartSnapshot = await getDocs(cartCollectionRef);

      if (cartSnapshot.empty) {
        console.log("Cart is empty.");
        setItems([]);
        return;
      }

      const itemsList = [];

      // Fetch item details for each item in the cart
      for (const cartDoc of cartSnapshot.docs) {
        const cartData = cartDoc.data();
        const itemId = cartData.item_id;

        if (itemId) {
          const itemDocRef = doc(db, "items", itemId);
          const itemDocSnapshot = await getDoc(itemDocRef);

          if (itemDocSnapshot.exists()) {
            itemsList.push({
              cartId: cartDoc.id, // Cart document ID
              ...cartData, // Data from the cart (e.g., quantity)
              ...itemDocSnapshot.data(), // Data from the items collection
            });
          } else {
            console.error(
              `Item with ID ${itemId} does not exist in the "items" collection.`
            );
          }
        } else {
          console.error("Cart item does not have an item_id field.");
        }
      }

      setItems(itemsList);
      console.log(itemsList);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false); // End loading
    }
  }, [userId]);

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

  const handleIncrement = (userId, itemId, setItems) => {
    incrementCartItem(userId, itemId, setItems);
  };
  const handleDecrement = async (userId, itemId, setItems) => {
    decrementCartItem(userId, itemId, setItems);
  };

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
    fetchDefAddr();
  }, [fetchItems, fetchDefAddr]);
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
          ordered_items: items.map((item) => ({
            item_id: item.item_id,
            quantity: item.quantity,
          })),
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
          await emptyCart();
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

  return (
    <div className="checkout-container">
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
        <button className="backtocart" onClick={() => navigate("/cart")}>
          Back to Cart
        </button>
        <button className="proceedtopayment" onClick={handleProceedToPayment}>
          Proceed to Payment
        </button>
      </div>
      <div className="select-address">
        <div className="box1">
          <div className="text">Select Address</div>
          <button className="addAddress">Add New Address</button>
        </div>

        <div className="address-container">
          <select id="Addresses">
            {addr.map((address) => (
              <option key={address.addrId}>
                {`${address.name}, ${address.door_no}, ${address.building_name}, ${address.area}, ${address.city} - ${address.zip_code}`}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="review">
        <div className="text">Review Your Order</div>

        <div className="review-container">
          {items.map((item) => (
            <div key={item.cartId} className="review-item">
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
                    onClick={() =>
                      handleDecrement(userId, item.item_id, setItems)
                    }
                  >
                    -
                  </button>
                  <div className="quantity">{item.quantity}</div>
                  <button
                    className="increment-quantity"
                    onClick={() =>
                      handleIncrement(userId, item.item_id, setItems)
                    }
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
        <button className="backtocart" onClick={() => navigate("/cart")}>
          Back to Cart
        </button>
        <button className="proceedtopayment" onClick={handleProceedToPayment}>
          Proceed to Payment
        </button>
      </div>
    </div>
  );
}

export default Checkout;
