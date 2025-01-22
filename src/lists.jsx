import React, { useState, useEffect, useCallback} from "react";
import "./styles/lists.css";
import { collection, doc, getDocs, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "./firebase-config";
import { useUser } from "./UserContext";
import { ToastContainer, toast } from "react-toastify";
import {
  createNewList,
  incrementItem,
  decrementItem,
  deleteList,
  deleteItemFromList,
} from "./functions/listFunctions";
import "react-toastify/dist/ReactToastify.css";
import { Button, TextField } from "@mui/material";

const Lists = () => {
  const { uid } = useUser();
  const [lists, setLists] = useState([]);
  const [activeList, setActiveList] = useState(null);
  const [newListName, setNewListName] = useState("");
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  // Fetch existing lists
  const fetchLists = useCallback( async () => {
    try {
      const listsRef = collection(db, `users/${uid}/lists`);
      const listsSnapshot = await getDocs(listsRef);
      const listsData = listsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLists(listsData);
      if (listsData.length > 0) {
        setActiveList(listsData[0]); // Set the first list as active
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to fetch lists. Please try again later.");
    }
  }, [uid]);
  const handleCreateNewList = async () => {
    if (!newListName.trim()) {
      toast.error("List name cannot be empty.");
      return;
    }

    try {
      await createNewList(uid, newListName);
      setNewListName(""); // Clear input
      fetchLists(); // Refresh lists
    } catch (error) {
      console.error("Error creating new list:", error);
      toast.error("Failed to create list. Please try again.");
    }
  };

  // Fetch item details for the active list
  const fetchItems = async (list) => {
    try {
      const itemDetails = await Promise.all(
        Object.keys(list.items).map(async (itemId) => {
          const itemRef = doc(db, `items/${itemId}`);
          const itemSnapshot = await getDoc(itemRef);
          if (itemSnapshot.exists()) {
            return {
              itemId,
              ...itemSnapshot.data(),
              quantity: list.items[itemId].quantity,
            };
          } else {
            console.warn(`Item with ID ${itemId} not found.`);
            return null;
          }
        })
      );
      setItems(itemDetails.filter((item) => item !== null));
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to fetch items. Please try again later.");
    }
  };

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  useEffect(() => {
    if (activeList) {
      fetchItems(activeList);
    }
  }, [activeList]);

  // Increment item quantity
  const handleIncrement = async (list2, itemId) => {
    try {
      await incrementItem(uid, list2.id, itemId);

      // Update the lists state directly
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === list2.id
            ? {
                ...list,
                items: {
                  ...list.items,
                  [itemId]: {
                    ...list.items[itemId],
                    quantity: list.items[itemId].quantity + 1,
                  },
                },
              }
            : list
        )
      );

      // Update the items state directly
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.itemId === itemId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } catch (error) {
      console.error("Error incrementing item quantity:", error);
      toast.error("Failed to increment quantity. Please try again.");
    }
  };

  const handleDecrement = async (listId, itemId) => {
    try {
      // Perform the decrement operation
      await decrementItem(uid, listId, itemId);

      // Update the lists state directly
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: Object.fromEntries(
                  Object.entries(list.items)
                    .map(([key, value]) =>
                      key === itemId
                        ? value.quantity > 1
                          ? [key, { ...value, quantity: value.quantity - 1 }]
                          : null // Remove the item if quantity is 0
                        : [key, value]
                    )
                    .filter(Boolean) // Remove null entries
                ),
              }
            : list
        )
      );

      // Update the items state directly
      setItems(
        (prevItems) =>
          prevItems
            .map((item) =>
              item.itemId === itemId
                ? item.quantity > 1
                  ? { ...item, quantity: item.quantity - 1 }
                  : null // Remove the item if quantity is 0
                : item
            )
            .filter(Boolean) // Remove null entries
      );
    } catch (error) {
      console.error("Error decrementing item quantity:", error);
      toast.error("Failed to decrement quantity. Please try again.");
    }
  };

  const handleDeleteItem = async (listId, itemId) => {
    try {
      await deleteItemFromList(uid, listId, itemId);

      // Update the lists state directly
      setLists((prevLists) =>
        prevLists.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: Object.keys(list.items).reduce((newItems, key) => {
                  if (key !== itemId) {
                    newItems[key] = list.items[key];
                  }
                  return newItems;
                }, {}),
              }
            : list
        )
      );

      // Update the items state directly
      setItems((prevItems) =>
        prevItems.filter((item) => item.itemId !== itemId)
      );
    } catch (error) {
      console.error("Error deleting item from list:", error);
      toast.error("Failed to delete item. Please try again.");
    }
  };
  const handleProceedToCheckout = async () => {
    if (Object.keys(items).length === 0) {
      navigate("/lists"); // Redirect to cart page if empty
    } else {
      console.log("cart items: ", items);
      navigate("/checkout", {
        state: { checkoutItems: items, visited: true, backPath: "/lists" }, // Only pass serializable data
      });
    }
  };
  return (
    <div className="list-container">
      <ToastContainer />
      <div className="nav-bar">
        <h1>Lists</h1>
        <section className="create-new-list">
          <TextField
            label="Create new List"
            variant="outlined"
            size="small"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateNewList}
          >
            Create
          </Button>
        </section>
        <div className="list">
          {lists.map((list) => (
            <div
              key={list.id}
              className={`list-item ${
                activeList && list.id === activeList.id ? "active" : ""
              }`}
              style={{
                backgroundColor:
                  activeList && list.id === activeList.id ? "green" : "white",
                color:
                  activeList && list.id === activeList.id ? "white" : "black",
                cursor: "pointer",
              }}
              onClick={() => setActiveList(list)}
            >
              {list.name}
            </div>
          ))}
        </div>
      </div>

      <div className="body-list">
        {activeList ? (
          <>
            <div className="bodyhead">
              <h1>{activeList.name}</h1>
              <div className="buttons">
                <Button
                  variant="contained"
                  color="success"
                  className="ptcheckout"
                  onClick={handleProceedToCheckout}
                >
                  proceed to checkout
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  className="delete-list"
                  onClick={() => {
                    const confirmDelete = window.confirm(
                      "Are you sure you want to delete this list?"
                    );
                    if (confirmDelete) {
                      deleteList(uid, activeList.id);
                      fetchLists();
                    }
                  }}
                >
                  Delete list
                </Button>
              </div>
            </div>
            <hr />
            <div className="list-items">
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
                        onClick={() => handleDecrement(activeList, item.itemId)}
                      >
                        -
                      </button>
                      <div className="quantity">{item.quantity}</div>
                      <button
                        className="increment-quantity"
                        onClick={() => handleIncrement(activeList, item.itemId)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    className="delete"
                    onClick={() => handleDeleteItem(activeList.id, item.itemId)}
                  >
                    Delete
                  </button>
                  {/*<div className="item-total">
                    <span className="total">
                      ₹{parseFloat(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>*/}
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Select a list to view its items.</p>
        )}
      </div>
    </div>
  );
};

export default Lists;
