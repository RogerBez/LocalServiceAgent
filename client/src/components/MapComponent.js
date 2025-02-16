import React, { useEffect, useRef } from 'react';

function MapComponent({ latitude, longitude, businesses }) {
  const mapRef = useRef(null);

  useEffect(() => {
    console.log('Businesses received in MapComponent:', businesses);
    if (window.google) {
      console.log('Google Maps API is available');
      
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 12,
      });

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
      if (businesses.length > 0) {
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
            console.log(`Business ${biz.name} does not have valid latitude/longitude.`);
          }
        });
      } else {
        console.log('No businesses to display on the map.');
      }
    } else {
      console.log('Google Maps API is not loaded.');
    }
  }, [latitude, longitude, businesses]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%' }} />;
}

export default MapComponent;
