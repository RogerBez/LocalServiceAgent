import React, { useEffect, useRef } from 'react';

function MapComponent({ latitude, longitude, businesses }) {
  const mapRef = useRef(null);
  let map = useRef(null); // Store the map instance
  let markers = []; // Store markers to clear them on updates

  useEffect(() => {
    if (window.google) {
      console.log('Google Maps API is available');

      // Initialize or re-center the map
      if (!map.current) {
        map.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 12,
        });
      } else {
        map.current.setCenter({ lat: latitude, lng: longitude });
      }

      // Clear previous markers
      markers.forEach(marker => marker.setMap(null));
      markers = []; // Reset the markers array

      // Add a marker for the user's current location
      const userMarker = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map.current,
        title: 'You are here',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });
      markers.push(userMarker);

      // Add markers for businesses
      if (Array.isArray(businesses) && businesses.length > 0) {
        businesses.forEach(biz => {
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
                  <p>${biz.address ? biz.address : 'Address not available'}</p>
                  <p>Rating: ${biz.rating ? biz.rating : 'N/A'}</p>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}" target="_blank">Get Directions</a>
                </div>
              `,
            });

            marker.addListener('click', () => infoWindow.open(map.current, marker));
            markers.push(marker);
          } else {
            console.warn(`Business ${biz.name} does not have valid latitude/longitude.`);
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
    <div ref={mapRef} style={{ height: '500px', width: '100%', borderRadius: '8px' }} />
  ) : (
    <p>Map is not available. Please try again later.</p>
  );
}

export default MapComponent;
