import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';

import LinearGradient from 'react-native-linear-gradient';
import { 
  togglePlayback, 
  seekTo, 
  getPosition, 
  getDuration, 
  setVolume 
} from '../services/TrackPlayerService';

const { width } = Dimensions.get('window');

const MusicPlayer = ({ 
  currentSong, 
  isPlaying, 
  onPlayPause,
  onNext,
  onPrevious,
  totalSongs,
  currentIndex 
}) => {
  const [volume, setVolumeState] = useState(0.5);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // Update progress every second
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(async () => {
        try {
          const currentPosition = await getPosition();
          const currentDuration = await getDuration();
          setPosition(currentPosition);
          setDuration(currentDuration);
          setProgress(currentDuration > 0 ? currentPosition / currentDuration : 0);
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const handleVolumeChange = async (value) => {
    try {
      setVolumeState(value);
      await setVolume(value);
    } catch (error) {
      console.error('Error changing volume:', error);
      Alert.alert(
        'Error',
        'Failed to change volume. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleProgressChange = async (value) => {
    try {
      setProgress(value);
      const newPosition = value * duration;
      await seekTo(newPosition);
    } catch (error) {
      console.error('Error seeking to position:', error);
      Alert.alert(
        'Error',
        'Failed to seek to position. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handlePlayPause = async () => {
    try {
      const newIsPlaying = await togglePlayback();
      onPlayPause(newIsPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
      Alert.alert(
        'Error',
        'Failed to toggle playback. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <LinearGradient
      colors={['#1a1a2e', '#16213e', '#0f3460']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.mainContent}>
        <View style={styles.songInfo}>
          <Image 
            source={currentSong?.artwork} 
            style={styles.albumArt} 
            defaultSource={require('../assets/images/default-album.png')}
          />
          <View style={styles.textInfo}>
            <Text style={styles.title} numberOfLines={1}>{currentSong?.title || 'No song selected'}</Text>
            <Text style={styles.artist} numberOfLines={1}>{currentSong?.artist || ''}</Text>
            <Text style={styles.language}>{currentSong?.language || ''}</Text>
          </View>
          <View style={styles.controls}>
          <TouchableOpacity 
            onPress={onPrevious} 
            style={styles.controlButton}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>⏮</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handlePlayPause} 
            style={styles.playButton}
            activeOpacity={0.8}
          >
            <View style={styles.playButtonInner}>
              <Text style={styles.playButtonText}>
                {isPlaying ? "⏸" : "▶"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onNext} 
            style={styles.controlButton}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>⏭</Text>
          </TouchableOpacity>
        </View>
        
        </View>
        <View style={styles.progressContainer}>
        <Slider
          style={styles.progressBar}
          value={progress}
          onValueChange={handleProgressChange}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#333"
          thumbTintColor="#1DB954"
        />
       
      </View>
        
        
        {/* <View style={styles.volumeContainer}>
          <Text style={styles.volumeIcon}>🔈</Text>
          <Slider
            style={styles.volumeSlider}
            value={volume}
            onValueChange={handleVolumeChange}
            minimumValue={0}
            maximumValue={1}
            minimumTrackTintColor="#1DB954"
            maximumTrackTintColor="#333"
            thumbTintColor="#1DB954"
          />
          <Text style={styles.volumeIcon}>🔊</Text>
        </View> */}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderWidth: 0.5,
    borderRadius: 25,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressContainer: {
    marginBottom: 1,
  },
  progressBar: {
    width: '100%',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  timeText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  mainContent: {
    flexDirection: 'column',
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  albumArt: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  textInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  artist: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  language: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    textTransform: 'uppercase',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  controlButton: {
    borderRadius: 30,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    marginHorizontal: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 30,
    color: '#1DB954',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 8,
  },
  volumeIcon: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default MusicPlayer; 