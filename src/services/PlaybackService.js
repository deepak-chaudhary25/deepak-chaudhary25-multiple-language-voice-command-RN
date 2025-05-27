import TrackPlayer, { Event, AppKilledPlaybackBehavior } from 'react-native-track-player';

// This is the playback service that runs in the background
export const PlaybackService = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });
  
  // Add these event listeners for better handling
  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.destroy();
  });
  
  TrackPlayer.addEventListener(Event.RemoteJumpForward, (event) => {
    TrackPlayer.seekTo(TrackPlayer.getPosition() + event.interval);
  });
  
  TrackPlayer.addEventListener(Event.RemoteJumpBackward, (event) => {
    TrackPlayer.seekTo(TrackPlayer.getPosition() - event.interval);
  });
}; 