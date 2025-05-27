import TrackPlayer, { Capability, Event, State, AppKilledPlaybackBehavior } from 'react-native-track-player';
import RNFS from 'react-native-fs';
import { getDefaultAudioDirectory } from '../utils/DirectoryValidator';

// Define audio file structure (using file paths instead of requires)
const getAudioFilePath = (language, fileNumber) => {
  const baseDir = getDefaultAudioDirectory();
  const extension = language === 'English' ? '.mp3' : '.wav';
  return `${baseDir}/${language}/${fileNumber}${extension}`;
};

class AudioService {
  static isInitialized = false;

  static async setupPlayer() {
    try {
    if (this.isInitialized) {
        console.log('Player already initialized');
      return;
    }

      console.log('Setting up player...');
      await TrackPlayer.setupPlayer({
        autoHandleInterruptions: true,
        waitForBuffer: true,
      });

      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
        progressUpdateEventInterval: 1,
      });

      this.isInitialized = true;
      console.log('Player setup completed successfully');
    } catch (error) {
      if (error.message === 'The player has already been initialized via setupPlayer.') {
        console.log('Player was already initialized');
        this.isInitialized = true;
        return;
      }
      console.error('Error setting up player:', error);
        throw error;
    }
  }

  static async loadAudioFiles(language, category, commands) {
    try {
      const tracks = [];
      const startIndex = category === 'Introduction' ? 1 : category === 'Caution' ? 31 : 50;
      const endIndex = category === 'Introduction' ? 30 : category === 'Caution' ? 49 : 65;

      for (let i = startIndex; i <= endIndex; i++) {
        const filePath = getAudioFilePath(language, i);
        const exists = await RNFS.exists(filePath);
        
        if (!exists) {
          console.warn(`Audio file not found: ${filePath}`);
          continue;
        }

        tracks.push({
          id: `${language}-${category}-${i}`,
          url: `file://${filePath}`,
          title: commands[i - 1] || `Command ${i}`,
          artist: language,
          category: category,
        });
      }

      await TrackPlayer.reset();
      await TrackPlayer.add(tracks);
      return tracks;
    } catch (error) {
      console.error('Error loading audio files:', error);
      throw error;
    }
  }

  static async playTrack(trackId, language, category, title) {
    try {
      // Extract the file number from the trackId
      let fileNumber;
      if (typeof trackId === 'string' && trackId.includes('-')) {
        fileNumber = trackId.split('-')[2];
      } else {
        fileNumber = trackId;
      }

      if (!fileNumber) {
        throw new Error('Invalid track ID format');
      }

      // Try to play the requested language first
      let filePath = getAudioFilePath(language, fileNumber);
      let exists = await RNFS.exists(filePath);
      
      // If the requested language file doesn't exist, try the other format
      if (!exists) {
        // Try the other format
        const alternatePath = filePath.endsWith('.mp3') 
          ? filePath.replace('.mp3', '.wav')
          : filePath.replace('.wav', '.mp3');
        
        exists = await RNFS.exists(alternatePath);
        if (exists) {
          filePath = alternatePath;
        } else {
          // If neither format exists, fallback to English
          console.log(`Audio file not found for ${language}, falling back to English`);
          filePath = getAudioFilePath('English', fileNumber);
          exists = await RNFS.exists(filePath);
          
          if (!exists) {
            // Try English in the other format
            const englishAlternatePath = filePath.endsWith('.mp3')
              ? filePath.replace('.mp3', '.wav')
              : filePath.replace('.wav', '.mp3');
            
            exists = await RNFS.exists(englishAlternatePath);
            if (exists) {
              filePath = englishAlternatePath;
            } else {
              throw new Error(`Audio file not found for English fallback: ${filePath}`);
            }
          }
        }
      }

      console.log('Playing audio file:', filePath);

      const track = {
        id: `${language}-${category}-${fileNumber}`,
        url: `file://${filePath}`,
        title: title,
        artist: language,
        category: category,
      };

      await TrackPlayer.reset();
      await TrackPlayer.add(track);
      await TrackPlayer.play();
    } catch (error) {
      console.error('Error playing track:', error);
      throw error;
    }
  }

  static async togglePlayback() {
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      throw error;
    }
  }

  static async skipToNext() {
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
        console.error('Error skipping to next:', error);
        throw error;
    }
  }

  static async skipToPrevious() {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
        console.error('Error skipping to previous:', error);
        throw error;
    }
  }

  static async cleanup() {
    try {
        await TrackPlayer.reset();
        this.isInitialized = false;
    } catch (error) {
      console.error('Error cleaning up player:', error);
      throw error;
    }
  }
}

export default AudioService;