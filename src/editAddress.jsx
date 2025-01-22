import React, { useState, useEffect, useCallback } from "react";
import { Button, TextField } from "@mui/material";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { GeoPoint } from "firebase/firestore";
import { db } from "./firebase-config"; // Import your Firestore instance
import "./styles/addAddress.css";

const EditAddress = ({ addressId, onClose }) => {
  const [addressData, setAddressData] = useState(null);
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
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [markerPosition, setMarkerPosition] = useState(null);
  const [infoWindowOpen, setInfoWindowOpen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load address details for editing
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const addressRef = doc(db, "addresses", addressId);
        const addressSnap = await getDoc(addressRef);

        if (addressSnap.exists()) {
          const data = addressSnap.data();
          setAddressData(data);
          setName(data.name);
          setPhone(data.mobile);
          setDoorno(data.door_no);
          setBuilding(data.building_name);
          setStreet(data.street_name);
          setLandmark(data.landmark);
          setArea(data.area);
          setCity(data.city);
          setZip(data.zip);
          setLat(data.location.latitude);
          setLng(data.location.longitude);
          setMapCenter({
            lat: data.location.latitude,
            lng: data.location.longitude,
          });
          setMarkerPosition({
            lat: data.location.latitude,
            lng: data.location.longitude,
          });
        } else {
          console.error("No such address found!");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
      }
    };

    fetchAddress();
  }, [addressId]);

  // Dynamically load the Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google) {
        setMapLoaded(true);
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

    return () => {
      const script = document.querySelector(
        `script[src^="https://maps.googleapis.com/maps/api/js"]`
      );
      if (script) {
        script.remove();
      }
    };
  }, []);

  const handleEditAddress = async () => {
    if (lat && lng) {
      const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;

      try {
        const addressRef = doc(db, "addresses", addressId);
        await updateDoc(addressRef, {
          name,
          mobile: phone,
          door_no: doorno,
          building_name: building,
          street_name: street,
          landmark,
          area,
          city,
          zip,
          location: new GeoPoint(lat, lng),
          mapUrl,
        });

        console.log("Address updated successfully!");
        onClose();
      } catch (error) {
        console.error("Error updating address:", error);
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
    setLat(lat);
    setLng(lng);
    setMarkerPosition({ lat, lng });
    setMapCenter({ lat, lng });

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
      {mapLoaded && addressData ? (
        <>
          <div className="form-input-address">
            <h1>Edit Address</h1>
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
              className="edit-address-button"
              color="primary"
              onClick={handleEditAddress}
            >
              Save Changes
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

export default EditAddress;
