import React, { useEffect, useRef } from 'react';

function MapComponent({ latitude, longitude, businesses }) {
  const mapRef = useRef(null);
  let map = useRef(null);
  let userMarker = useRef(null);
  let markers = [];

  useEffect(() => {
    if (window.google) {
      console.log('Google Maps API is available');

      if (!map.current) {
        // Initialize the map only once
        map.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 12,
        });
      } else {
        // Re-center the map if latitude/longitude changes
        map.current.setCenter({ lat: latitude, lng: longitude });
      }

      // Add or update the user marker
      if (userMarker.current) {
        userMarker.current.setPosition({ lat: latitude, lng: longitude });
      } else {
        userMarker.current = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map.current,
          title: 'You are here',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
        });
      }

      // Clear existing business markers
      markers.forEach(marker => marker.setMap(null));
      markers = [];

      // Add markers for each business
      if (Array.isArray(businesses) && businesses.length > 0) {
        businesses.forEach(biz => {
          if (biz.geometry.location.lat && biz.geometry.location.lng) {
            const marker = new window.google.maps.Marker({
              position: { lat: biz.geometry.location.lat, lng: biz.geometry.location.lng },
              map: map.current,
              title: biz.name,
            });

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div>
                  <h4>${biz.name}</h4>
                  <p>${biz.formatted_address}</p>
                  <p>Rating: ${biz.rating || 'N/A'}</p>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=${biz.geometry.location.lat},${biz.geometry.location.lng}" target="_blank">Get Directions</a>
                </div>
              `,
            });

            marker.addListener('click', () => infoWindow.open(map.current, marker));
            markers.push(marker);
          }
        });
      } else {
        console.warn('No businesses to display on the map.');
      }
    } else {
      console.warn('Google Maps API is not loaded.');
    }
  }, [latitude, longitude, businesses]);

  return window.google ? (
    <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: '8px' }} />
  ) : (
    <p>Map is not available. Please try again later.</p>
  );
}

export default MapComponent;
