// components/MapComponent.js
import React, { useEffect, useRef } from 'react';

function MapComponent({ businesses }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.google && businesses.length > 0) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: businesses[0].latitude, lng: businesses[0].longitude },
        zoom: 13,
      });

      businesses.forEach((biz) => {
        const marker = new window.google.maps.Marker({
          position: { lat: biz.latitude, lng: biz.longitude },
          map: map,
          title: biz.name,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div>
              <h4>${biz.name}</h4>
              <p>${biz.address}</p>
              <p>Rating: ${biz.rating}</p>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}" target="_blank">Get Directions</a>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });
      });
    }
  }, [businesses]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
}

export default MapComponent;
