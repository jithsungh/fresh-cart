import React, { useState, useEffect, useCallback } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase-config";
import "./styles/address.css";
import { useUser } from "./UserContext";
import { deleteAddress } from "./functions/addressFunctions";
import AddAddress from "./addAddress";
import EditAddress from "./editAddress";

import { ToastContainer, toast } from "react-toastify";

const Address = () => {
  const [addr, setAddr] = useState([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null); // Address to edit
  const { uid } = useUser();
  const userId = uid;

  // Fetch user addresses
  const fetchDefAddr = useCallback(async () => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const addressIds = userData.addresses || [];

        if (addressIds.length === 0) {
          setAddr([]);
          return;
        }

        const addrList = [];
        for (const addrId of addressIds) {
          const addrDocRef = doc(db, "addresses", addrId);
          const addrDocSnapshot = await getDoc(addrDocRef);

          if (addrDocSnapshot.exists()) {
            addrList.push({
              addrId,
              ...addrDocSnapshot.data(),
            });
          }
        }

        setAddr(addrList);
      } else {
        console.error("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching user addresses:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchDefAddr();
  }, [fetchDefAddr]);

  // Handle delete address
  const handleDeleteAddress = async (addressId) => {
    const confirmation = window.confirm("Are you sure you want to delete this address?");
    if (confirmation) {
      try {
        await deleteAddress(userId, addressId);
        toast.success("Address deleted successfully!");
        fetchDefAddr(); // Refresh the address list
      } catch (error) {
        console.error("Error deleting address:", error);
        toast.error("Failed to delete address.");
      }
    }
  };

  // Open add address dialog
  const handleAddAddress = () => {
    setOpenAddDialog(true);
  };

  // Open edit address dialog
  const handleEditAddress = (address) => {
    setSelectedAddress(address);
    setOpenEditDialog(true);
  };

  return (
    <div className="address-container">
      <div className="header">
        <h1>Addresses</h1>
        <Button
          variant="contained"
          className="add-address-button"
          onClick={handleAddAddress}
        >
          Add New Address
        </Button>
      </div>
      <hr />

      <div className="body">
        {addr.map((address) => (
          <div className="address-card" key={address.addrId}>
            <div className="names">
              <p className="name">{address.name}</p>
              <p className="phone">{address.mobile}</p>
            </div>
            <div className="address-details">
              <div className="address-line-1">
                <p>{address.door_no}</p>
                <pre>, </pre>
                <p>{address.building_name}</p>
                <pre>, </pre>
                <p>{address.street_name}</p>
              </div>
              <div className="address-line-2">
                <p>{address.area}</p>
                <pre>, </pre>
                <p>{address.city}</p>
                <pre>, </pre>
                <p>{address.zip}</p>
              </div>
            </div>
            <div className="addr-edit-buttons">
              <Button
                variant="contained"
                className="Button"
                onClick={() => handleEditAddress(address.addrId)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                className="delete-button"
                onClick={() => handleDeleteAddress(address.addrId)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Dialog */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Add New Address</DialogTitle>
        <DialogContent>
          <AddAddress
            onClose={() => {
              setOpenAddDialog(false);
              fetchDefAddr();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Address Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Address</DialogTitle>
        <DialogContent>
          {selectedAddress && (
            <EditAddress
              addressId={selectedAddress}
              onClose={() => {
                setOpenEditDialog(false);
                fetchDefAddr();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Address;
