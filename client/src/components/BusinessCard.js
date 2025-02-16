// src/components/BusinessCard.js
import React from 'react';
import './BusinessCard.css'; // This will import your CSS for styling
import { FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa'; // Import icons

function BusinessCard({ name, address, rating, latitude, longitude, phone }) {
  const handleGetDirections = () => {
    if (latitude && longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
    } else {
      console.warn('No valid coordinates for this business.');
    }
  };

  const handleCall = () => {
    if (phone) {
      window.open(`tel:${phone}`);
    } else {
      console.warn('No phone number available.');
    }
  };

  return (
    <div className="business-card">
      <h3>{name}</h3>
      <p><FaMapMarkerAlt style={{ marginRight: '5px' }} /> {address}</p>
      <p>Rating: {rating}</p>

      {phone && (
        <p>
          <FaPhoneAlt style={{ marginRight: '5px' }} />
          <a href={`tel:${phone}`}>{phone}</a>
        </p>
      )}

      <div className="buttons">
        <button onClick={handleGetDirections}>
          <FaMapMarkerAlt style={{ marginRight: '5px' }} />
          Get Directions
        </button>
        {phone && (
          <button onClick={handleCall}>
            <FaPhoneAlt style={{ marginRight: '5px' }} />
            Call
          </button>
        )}
      </div>
    </div>
  );
}

export default BusinessCard;