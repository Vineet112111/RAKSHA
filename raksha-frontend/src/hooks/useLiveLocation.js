import { useEffect, useRef } from 'react';
import { useSOS } from '../context/SOSContext';

export default function useLiveLocation() {
  const { activeSOS, sendLiveLocation } = useSOS();
  const latestCoordsRef = useRef(null);
  const watchIdRef = useRef(null);
  const intervalIdRef = useRef(null);

  useEffect(() => {
    if (!activeSOS) {
      cleanup();
      return;
    }

    // Start watching position
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy, speed } = position.coords;
          latestCoordsRef.current = { latitude, longitude, accuracy, speed };
          console.log('[GEOLOCATION WATCH] GPS position updated:', latitude, longitude);
        },
        (error) => {
          console.warn('[GEOLOCATION WARN] GPS access error. Using simulated coordinates.', error.message);
          
          // If geolocation fails or is denied, initialize seed coordinate
          if (!latestCoordsRef.current) {
            latestCoordsRef.current = {
              latitude: 19.0760, // Mumbai Central
              longitude: 72.8777,
              accuracy: 10,
              speed: 5
            };
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      // Start 5-second location broadcasting interval
      intervalIdRef.current = setInterval(() => {
        // If we don't have coords (even mock ones), set initial seed
        if (!latestCoordsRef.current) {
          latestCoordsRef.current = {
            latitude: 19.0760,
            longitude: 72.8777,
            accuracy: 15,
            speed: 0,
          };
        } else if (latestCoordsRef.current && !navigator.geolocation) {
          // If we are simulating, drift the coordinates slightly to show live movement in the hackathon demo!
          latestCoordsRef.current = {
            latitude: latestCoordsRef.current.latitude + (Math.random() - 0.5) * 0.0005,
            longitude: latestCoordsRef.current.longitude + (Math.random() - 0.5) * 0.0005,
            accuracy: 8,
            speed: 4,
          };
        } else {
          // Even with GPS permission, we can add minor simulated drift for demonstrations if the device is stationary
          latestCoordsRef.current = {
            ...latestCoordsRef.current,
            latitude: latestCoordsRef.current.latitude + (Math.random() - 0.5) * 0.0001,
            longitude: latestCoordsRef.current.longitude + (Math.random() - 0.5) * 0.0001,
          };
        }

        const { latitude, longitude, accuracy, speed } = latestCoordsRef.current;
        sendLiveLocation(latitude, longitude, accuracy, speed);
      }, 5000);
    } else {
      console.error('[GEOLOCATION ERROR] Geolocation is not supported by this browser.');
    }

    return () => cleanup();
  }, [activeSOS]);

  const cleanup = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      console.log('[GEOLOCATION WATCH] Cleared GPS watcher');
    }
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
      console.log('[GEOLOCATION WATCH] Cleared broadcast interval');
    }
  };
}
