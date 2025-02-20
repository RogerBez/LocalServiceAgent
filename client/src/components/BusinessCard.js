import React, { useState } from "react";
import { FaStar, FaRegStar, FaPhoneAlt, FaWhatsapp, FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";

const BusinessCard = ({ biz }) => {
  const [expanded, setExpanded] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const toggleAccordion = () => setExpanded(!expanded);
  const toggleBookmark = () => setBookmarked(!bookmarked);

  // Format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone) => phone?.replace(/\D/g, "");

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 transition hover:shadow-xl text-left">
      
      {/* Business Logo */}
      {biz.logo && (
        <img
          src={biz.logo}
          alt={`${biz.name} logo`}
          className="w-16 h-16 object-contain mb-2 mx-auto"
        />
      )}

      {/* Bookmark Icon */}
      <div className="float-right cursor-pointer" onClick={toggleBookmark}>
        {bookmarked ? <FaStar color="#f39c12" /> : <FaRegStar color="#ccc" />}
      </div>

      <h2 className="text-xl font-bold text-gray-800">{biz.name}</h2>
      <p className="text-sm text-gray-600">
        ⭐ {biz.aggregatedReviews ? biz.aggregatedReviews : "No"} reviews &nbsp;
        ({biz.rating ? biz.rating : "No rating"})
      </p>

      {/* Distance Handling */}
      {biz.distance && !isNaN(biz.distance) ? (
  <p className="text-sm text-gray-600">
    <strong>Distance:</strong> {parseFloat(biz.distance).toFixed(2)} km
  </p>
) : (
  <p className="text-sm text-gray-600">
    <strong>Distance:</strong> N/A
  </p>
)}

      <p className="text-gray-600 mt-2">{biz.address}</p>

      {/* Contact & Website */}
      <div className="mt-3 flex flex-wrap gap-2">
        {biz.phone && (
          <a href={`tel:${biz.phone}`} className="text-blue-600 flex items-center gap-1 hover:underline">
            <FaPhoneAlt /> {biz.phone}
          </a>
        )}
        {biz.phone && (
          <a
            href={`https://wa.me/${formatPhoneForWhatsApp(biz.phone)}?text=Hi, I saw your listing on Local Service Finder`}
            className="text-green-600 flex items-center gap-1 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp /> WhatsApp
          </a>
        )}
        {biz.website && (
          <a href={biz.website} className="text-blue-600 flex items-center gap-1 hover:underline" target="_blank" rel="noopener noreferrer">
            🌐 Visit Website
          </a>
        )}
      </div>

      {/* Business Image */}
      {biz.photo && (
        <img
          src={biz.photo}
          alt={`Image of ${biz.name}`}
          className="w-full object-cover rounded-lg"
          style={{ objectFit: "cover", height: "200px", borderRadius: "8px" }}
        />
      )}

      {/* Get Directions Button */}
      <div className="mt-4">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 px-4 py-2 rounded-lg font-medium hover:bg-blue-600"
          style={{ color: "#ffffff", backgroundColor: "#2196F3" }} // Force white text
        >
          📍 Get Directions
        </a>
      </div>

      {/* Mini Map */}
      {biz.latitude && biz.longitude && (
        <div className="mt-3">
          <img
            src={`https://maps.googleapis.com/maps/api/staticmap?center=${biz.latitude},${biz.longitude}&zoom=15&size=280x150&maptype=roadmap&markers=color:red%7C${biz.latitude},${biz.longitude}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
            alt="Mini Map"
            className="w-full h-auto rounded-lg"
          />
        </div>
      )}

      {/* Accordion for More Details */}
      <div className="mt-4">
        <button onClick={toggleAccordion} className="text-sm text-blue-600 underline focus:outline-none">
          {expanded ? "Show Less" : "Show More"}
        </button>
        {expanded && (
          <div className="mt-2">
            {/* Opening Hours */}
            <div className="text-gray-600 mt-2">
              <strong>Opening Hours:</strong>
              {biz.opening_hours ? (
                <ul className="list-disc ml-4 mt-1">
                  {biz.opening_hours.split(/\r?\n|, /).map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1">N/A</p>
              )}
            </div>

            {/* Additional Details */}
            <p className="text-gray-600 mt-2">
              <strong>Category:</strong> {biz.category || "N/A"}
            </p>

            {/* Social Media Links */}
            {biz.socialLinks && (
              <div className="mt-2 flex gap-2">
                {biz.socialLinks.facebook && (
                  <a href={biz.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                    <FaFacebook size={20} />
                  </a>
                )}
                {biz.socialLinks.instagram && (
                  <a href={biz.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600">
                    <FaInstagram size={20} />
                  </a>
                )}
                {biz.socialLinks.twitter && (
                  <a href={biz.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400">
                    <FaTwitter size={20} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BusinessCards = ({ businesses }) => {
  if (!businesses || businesses.length === 0) {
    return <p className="text-center text-gray-500 text-lg">No results found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold text-center mb-4">🔎 Search Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((biz, index) => (
          <BusinessCard key={index} biz={biz} />
        ))}
      </div>
    </div>
  );
};

export default BusinessCards;
