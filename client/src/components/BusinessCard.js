import React from "react";

const BusinessCards = ({ businesses }) => {
  if (!businesses || businesses.length === 0) {
    return <p className="text-center text-gray-500 text-lg">No results found.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold text-center mb-4">🔎 Search Results</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map((biz, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg p-4 transition hover:shadow-xl"
          >
            {/* Business Image */}
            {biz.image && (
              <img
                src={biz.image}
                alt={biz.name}
                className="w-full h-40 object-cover rounded-lg"
              />
            )}

            {/* Business Name & Rating */}
            <div className="mt-3">
              <h3 className="text-xl font-bold text-gray-800">{biz.name}</h3>
              <p className="text-sm text-gray-600">
                ⭐ {biz.rating} / 5 ({biz.reviews || "No"} reviews)
              </p>
            </div>

            {/* Address */}
            <p className="text-gray-600 mt-2">{biz.address}</p>

            {/* Phone & Website */}
            <div className="mt-3 flex flex-col space-y-2">
              {biz.phone && (
                <a
                  href={`tel:${biz.phone}`}
                  className="text-blue-600 font-medium hover:underline"
                >
                  📞 {biz.phone}
                </a>
              )}
              {biz.website && (
                <a
                  href={biz.website}
                  className="text-blue-600 font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🌐 Visit Website
                </a>
              )}
            </div>

            {/* Get Directions */}
            <div className="mt-4">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600"
              >
                📍 Get Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessCards;
