export async function requireGeolocation({
  timeoutMs = 12000,
  enableHighAccuracy = true,
} = {}) {
  if (!('geolocation' in navigator)) {
    throw new Error('Location is not supported on this device/browser.');
  }

  return await new Promise((resolve, reject) => {
    const opts = {
      enableHighAccuracy,
      timeout: timeoutMs,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        if (err?.code === 1) {
          reject(new Error('Location permission is required to login.'));
          return;
        }
        reject(new Error('Unable to fetch your location. Please enable GPS/location and try again.'));
      },
      opts
    );
  });
}

