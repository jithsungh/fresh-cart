import React, { useState, useEffect, useCallback } from "react";
import "./styles/poAddToList.css";
import { useUser } from "./UserContext";
import { db } from "./firebase-config";
import { collection, getDocs } from "firebase/firestore";
import { Button, TextField } from "@mui/material";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createNewList,
  incrementItem,
  decrementItem,
  addItemToList,
} from "./functions/listFunctions";

const PoAddToList = ({ onClose, itemId }) => {
  const { uid } = useUser();
  const [lists, setLists] = useState([]);
  const [newListName, setNewListName] = useState("");

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
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to fetch lists. Please try again later.");
    }
  }, [uid]);

  // Add a new list
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

  // Add an item to a list
  const handleAddItem = async (listId) => {
    try {
      await addItemToList(uid, listId, itemId, 1);
      toast.success("Item added to the list!");
      fetchLists(); // Refresh lists to reflect the update
    } catch (error) {
      console.error("Error adding item to list:", error);
      toast.error("Failed to add item. Please try again.");
    }
  };

  // Increment item quantity
  const handleIncrement = async (listId) => {
    try {
      await incrementItem(uid, listId, itemId);
      fetchLists(); // Refresh lists
    } catch (error) {
      console.error("Error incrementing item quantity:", error);
      toast.error("Failed to increment quantity. Please try again.");
    }
  };

  // Decrement item quantity
  const handleDecrement = async (listId) => {
    try {
      await decrementItem(uid, listId, itemId);
      fetchLists(); // Refresh lists
    } catch (error) {
      console.error("Error decrementing item quantity:", error);
      toast.error("Failed to decrement quantity. Please try again.");
    }
  };

  // Close the popup
  const close = () => {
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return (
    <div className="poAddToListContainer">
      <div className="header">
        <h1 className="title">Add to List</h1>
        <i id="close" className="bx bx-x" onClick={close}></i>
      </div>
      <div className="body">
        <div className="new-list">
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
        </div>

        <div className="lists">
          {lists.length > 0 ? (
            lists.map((list) => {
              const itemQuantity = list.items?.[itemId]?.quantity || 0; // Get quantity from items object

              return (
                <div className="list" key={list.id}>
                  <p>{list.name}</p>
                  {itemQuantity ? (
                    <div className="quantity-controls">
                      <button
                        className="decrement-button"
                        onClick={() => handleDecrement(list.id)}
                      >
                        -
                      </button>
                      <button >{itemQuantity}</button>
                      <button 
                        className="increment-button"
                        
                        onClick={() => handleIncrement(list.id)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => handleAddItem(list.id)}
                    >
                      Add
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-lists">
              <p>No lists to show. 📝</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoAddToList;
