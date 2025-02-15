// src/components/BusinessCard.js
import React from 'react';
import './BusinessCard.css'; // This will import your CSS for styling

const BusinessCard = ({ name, address, rating }) => {
  return (
    <div className="business-card">
      <h2>{name}</h2>
      <p>{address}</p>
      <p>Rating: {rating}</p>
    </div>
  );
};

export default BusinessCard;
