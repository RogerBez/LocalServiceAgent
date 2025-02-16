import React, { useEffect, useRef } from 'react';

function MapComponent({ latitude, longitude, businesses }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.google && businesses.length > 0) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 12,
      });

      console.log('Google Maps API is available');
      
      // Add a marker for the user's current location
      new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: 'You are here',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });

      // Add markers for each business
      businesses.forEach((biz) => {
        console.log('Business:', biz.name, 'Latitude:', biz.latitude, 'Longitude:', biz.longitude);

        if (biz.latitude && biz.longitude) {
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
        } else {
          console.warn(`Business ${biz.name} does not have valid latitude/longitude.`);
        }
      });
    } else {
      console.warn('Google Maps API is not loaded or there are no businesses.');
    }
  }, [latitude, longitude, businesses]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
}

export default MapComponent;
