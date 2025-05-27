import TrackPlayer, { Event, State, Capability } from 'react-native-track-player';

// This function sets up the TrackPlayer service
export const setupPlayer = async () => {
  try {
    await TrackPlayer.setupPlayer({
      // Add these options to handle foreground service properly
      autoHandleInterruptions: true,
      waitForBuffer: true,
    });
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: 'StopPlaybackAndRemoveNotification',
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      // Add notification options
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      // Add notification options
      notificationOptions: {
        stopWithApp: true,
        alwaysPausable: true,
      },
    });
  } catch (error) {
    console.log('Error setting up player:', error);
  }
};

// This function adds tracks to the player
export const addTracks = async (tracks) => {
  try {
    await TrackPlayer.reset();
    await TrackPlayer.add(tracks);
  } catch (error) {
    console.log('Error adding tracks:', error);
  }
};

// This function plays a specific track
export const playTrack = async (trackId) => {
  try {
    await TrackPlayer.skip(trackId);
    await TrackPlayer.play();
  } catch (error) {
    console.log('Error playing track:', error);
  }
};

/ This function toggles play/pause
export const togglePlayback = async () => {
  try {
    const state = await TrackPlayer.getState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
    return state !== State.Playing;
  } catch (error) {
    console.log('Error toggling playback:', error);
    return false;
  }
};

// This function gets the current track
export const getCurrentTrack = async () => {
  try {
    return await TrackPlayer.getCurrentTrack();
  } catch (error) {
    console.log('Error getting current track:', error);
    return null;
  }
};

// This function gets the playback state
export const getPlaybackState = async () => {
  try {
    return await TrackPlayer.getState();
  } catch (error) {
    console.log('Error getting playback state:', error);
    return null;
  }
};

// This function seeks to a specific position
export const seekTo = async (position) => {
  try {
    await TrackPlayer.seekTo(position);
  } catch (error) {
    console.log('Error seeking to position:', error);
  }
};

// This function gets the current position
export const getPosition = async () => {
  try {
    return await TrackPlayer.getPosition();
  } catch (error) {
    console.log('Error getting position:', error);
    return 0;
  }
};

// This function gets the duration of the current track
export const getDuration = async () => {
  try {
    return await TrackPlayer.getDuration();
  } catch (error) {
    console.log('Error getting duration:', error);
    return 0;
  }
};

// This function sets the volume
export const setVolume = async (volume) => {
  try {
    await TrackPlayer.setVolume(volume);
  } catch (error) {
    console.log('Error setting volume:', error);
  }
}; 