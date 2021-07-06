export default function getDemoProps() {
  return {
    domain: process.env.DAILY_DOMAIN || null,
    // Check that both domain and key env vars are set
    isConfigured: !!process.env.DAILY_DOMAIN && !!process.env.DAILY_API_KEY,
    // Have we predefined a room to use?
    predefinedRoom: process.env.DAILY_ROOM || '',
    // Manual or automatic track subscriptions
    subscribeToTracksAutomatically: !process.env.MANUAL_TRACK_SUBS,
  };
}
