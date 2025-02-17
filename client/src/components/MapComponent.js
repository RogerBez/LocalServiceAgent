import React, { useEffect, useRef } from 'react';

function MapComponent({ latitude, longitude, businesses }) {
  const mapRef = useRef(null);
  let map = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      console.log("✅ Google Maps API is available");

      if (!map.current) {
        map.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 12,
        });
      } else {
        map.current.setCenter({ lat: latitude, lng: longitude });
      }

      // ✅ Check if `AdvancedMarkerElement` exists before using it
      if (window.google.maps.marker && window.google.maps.marker.AdvancedMarkerElement) {
        console.log("✅ Using AdvancedMarkerElement");
      } else {
        console.warn("⚠️ AdvancedMarkerElement not available, using regular Marker");
      }

      const markers = [];

      // 📌 User's location marker
      const userMarker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map.current,
        title: "You are here",
        icon: {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        },
      });
      markers.push(userMarker);

      // 📌 Business markers
      if (Array.isArray(businesses) && businesses.length > 0) {
        businesses.forEach((biz) => {
          if (biz.latitude && biz.longitude) {
            const marker = new window.google.maps.Marker({
              position: { lat: biz.latitude, lng: biz.longitude },
              map: map.current,
              title: biz.name,
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                  <div>
                      <h4>${biz.name}</h4>
                      <p>${biz.address || "No address available"}</p>
                      <p>Rating: ${biz.rating || "No rating"}</p>
                      <a href="https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}" target="_blank">Get Directions</a>
                  </div>
              `,
            });

            marker.addListener("click", () => {
              infoWindow.open(map.current, marker);
            });

            markers.push(marker);
          } else {
            console.warn(`⚠️ Skipping business without location: ${biz.name}`);
          }
        });
      } else {
        console.warn("⚠️ No businesses to display on the map.");
      }
    } else {
      console.warn("❌ Google Maps API is not loaded.");
    }
  }, [latitude, longitude, businesses]); // ✅ UseEffect dependencies

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
}

export default MapComponent;
