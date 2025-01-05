import React, { useState, useCallback, useEffect } from "react";
import { Button, TextField } from "@mui/material";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import {
  doc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
} from "firebase/firestore";
import { GeoPoint } from "firebase/firestore";
import { db } from "./firebase-config"; // Import your Firestore instance
import "./styles/addAddress.css";
import { useUser } from "./UserContext";

const AddAddress = ({ onClose }) => {
  const { uid } = useUser();
  const userId = uid;
  const [doorno, setDoorno] = useState("");
  const [building, setBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [area, setArea] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [landmark, setLandmark] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore
  const [markerPosition, setMarkerPosition] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false); // Track if map is loaded

  // Dynamically load the Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google) {
        setMapLoaded(true); // Google Maps is already loaded
        return;
      }

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
      script.async = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = (e) => console.error("Error loading Google Maps API", e);
      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    // Cleanup: Remove the script when the component unmounts
    return () => {
      const script = document.querySelector(
        `script[src^="https://maps.googleapis.com/maps/api/js"]`
      );
      if (script) {
        script.remove();
      }
    };
  }, []);

  // Get user's current location and update map center
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setLat(userLat);
          setLng(userLng);
          setMapCenter({ lat: userLat, lng: userLng });
        },
        (error) => {
          console.error("Error getting user's location", error);
          // Fallback to default location if geolocation fails
          setMapCenter({ lat: 12.9716, lng: 77.5946 });
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Fallback to default location if geolocation is not supported
      setMapCenter({ lat: 12.9716, lng: 77.5946 });
    }
  }, []);

  const handleAddAddress = async () => {
    if (lat && lng) {
      // Generate the Google Maps URL
      const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      try {
        // Add the address to the "addresses" collection
        const addressRef = collection(db, "addresses");
        const newAddressDoc = await addDoc(addressRef, {
          user_id: userId,
          role: "user",
          name,
          mobile: phone,
          door_no: doorno,
          building_name: building,
          street_name: street,
          landmark,
          area,
          city,
          zip,
          location: new GeoPoint(lat, lng), // GeoPoint
          mapUrl, // Store the generated map URL
        });

        console.log("Address added successfully!");

        // Add the address ID to the user's "addresses" array
        const userRef = doc(db, "users", userId); // Replace userId with the actual user ID
        await updateDoc(userRef, {
          addresses: arrayUnion(newAddressDoc.id), // Add only the address ID
        });
        onClose();

        console.log("Address ID added to user's addresses array!");
      } catch (error) {
        console.error("Error adding address:", error);
      }
    }
  };

  const onMapClick = useCallback((e) => {
    if (!e.latLng) {
      console.error("latLng not found in click event");
      return;
    }

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    console.log("Map clicked at:", { lat, lng });

    setLat(lat);
    setLng(lng);
    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });

    // Reverse geocode the coordinates to get the address
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const components = results[0].address_components;

        components.forEach((component) => {
          if (component.types.includes("locality"))
            setCity(component.long_name);
          if (component.types.includes("postal_code"))
            setZip(component.long_name);
          if (component.types.includes("sublocality"))
            setArea(component.long_name);
        });
      } else {
        console.error("Geocoding failed:", status);
      }
    });
  }, []);

  return (
    <div className="addAddress">
      {mapLoaded ? (
        <>
          <div className="form-input-address">
            <h1>Add Address</h1>
            <div className="two-row">
              <TextField
                className="address-input"
                label="Name"
                variant="outlined"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                className="address-input"
                label="Phone"
                variant="outlined"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="two-row-two">
              <TextField
                className="address-input"
                label="Door no/ Flat no"
                variant="outlined"
                value={doorno}
                onChange={(e) => setDoorno(e.target.value)}
              />
              <TextField
                className="address-input"
                label="Building Name"
                variant="outlined"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
              />
            </div>
            <TextField
              className="address-input"
              label="Street Name"
              variant="outlined"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />
            <TextField
              className="address-input"
              label="Landmark"
              variant="outlined"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
            <TextField
              className="address-input"
              label="Area"
              variant="outlined"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
            <div className="two-row-three">
              <TextField
                className="address-input"
                label="City"
                variant="outlined"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <TextField
                className="address-input"
                label="Zip Code"
                variant="outlined"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
              />
            </div>

            <Button
              variant="contained"
              className="add-address-button"
              color="primary"
              onClick={handleAddAddress}
            >
              Add Address
            </Button>
          </div>
          <div className="map">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={mapCenter}
              zoom={12}
              onClick={onMapClick}
            >
              {markerPosition && (
                <Marker
                  position={markerPosition}
                  onClick={() => setInfoWindowOpen(!infoWindowOpen)}
                />
              )}
              {infoWindowOpen && markerPosition && (
                <InfoWindow position={markerPosition}>
                  <div>
                    <h4>Location Details</h4>
                    <p>Latitude: {lat}</p>
                    <p>Longitude: {lng}</p>
                    <p>City: {city}</p>
                    <p>Area: {area}</p>
                    <p>Zip Code: {zip}</p>
                    <p>
                      <a
                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Google Maps
                      </a>
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          </div>
        </>
      ) : (
        <div className="loader">
          <img src="loading.gif" alt="loading" />
        </div>
      )}
    </div>
  );
};

export default AddAddress;
