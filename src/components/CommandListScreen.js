import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import TrackPlayer, {
  useProgress,
  State,
  useTrackPlayerEvents,
  Event,
  RepeatMode,
} from 'react-native-track-player';
import { useLanguage } from '../context/LanguageContext';
import AudioService from '../services/AudioService';
import { scaleWidth, scaleHeight, scaleFont, scaleSize } from '../utils/responsive';
import { fonts } from '../theme/fonts';
// Commands data - fixed for all languages
const commandsData = {
  Hindi: {
    Introduction: [
      { id: '1', text: 'This is Indian Naval Warship' },
      { id: '2', text: 'What is your last port of call' },
      { id: '3', text: 'What is your next port of call and date of arrival' },
      { id: '4', text: 'What is your international call sign' },
      { id: '5', text: 'What is flag of your vessel' },
      { id: '6', text: 'What is name and nationality of your master' },
      { id: '7', text: 'Indicate the number and nationality of crew and passenger on-board' },
      { id: '8', text: 'Turn on your Radio and speak to us on Channel 16' },
      { id: '9', text: 'What is the purpose of your Voyage' },
      { id: '10', text: 'Do you have permission to enter this area' },
      { id: '11', text: 'Answer my questions "Yes" or "No"' },
      { id: '12', text: 'Do you require help' },
      { id: '13', text: 'What is your "GPS" position' },
      { id: '14', text: 'In case your Radio is not working, wave your flag' },
      { id: '15', text: 'Do you have machinery breakdown' },
      { id: '16', text: 'Thank you for Co-operation Bon Voyage' },
      { id: '17', text: 'Can you hear us? If Yes wave your hands' },
      { id: '18', text: 'What is your cargo' },
      { id: '19', text: 'Indicate number of women and children on-board' },
      { id: '20', text: 'What is your Gross/Net tonnage and endurance of your ship' },
      { id: '21', text: 'Be prepared to receive Indian Naval Boarding Party' },
      { id: '22', text: 'Medical help is on the way' },
      { id: '23', text: 'Hello! Do you understand English' },
      { id: '24', text: 'Which language do you speak' },
      { id: '25', text: 'I do not understand your language' },
      { id: '26', text: 'What is your country' },
      { id: '27', text: 'What port or country did you began your voyage' },
      { id: '28', text: 'This is Indian Navy' },
      { id: '29', text: 'This is Indian Coast Guard' },
      { id: '30', text: 'This is Indian Police' },
    ],
    Caution: [
      { id: '31', text: 'Stop your vessel' },
      { id: '32', text: 'Do not panic. This is a routine inspection' },
      { id: '33', text: 'Prepare to be boarded. Lower your pilot ladder' },
      { id: '34', text: 'Alter your course to --- speed ---' },
      { id: '35', text: 'You are in a firing area, inform other boats also' },
      { id: '36', text: 'Be ready for inspection' },
      { id: '37', text: 'Anchor the ship and come up on Radio Channel 16' },
      { id: '38', text: 'Do you have any explosives or weapons on-board' },
      { id: '39', text: 'Open up your containers to speed up search' },
      { id: '40', text: 'Are there any empty containers on-board' },
      { id: '41', text: 'Does anybody require any medical help' },
      { id: '42', text: 'Turn on lights and be ready for inspection' },
      { id: '43', text: 'Show us the crew and cargo manifest' },
      { id: '44', text: 'Do you have any hazardous material' },
      { id: '45', text: 'Indicate the number of personnel on watch and their location' },
      { id: '46', text: 'Bring all people on the deck' },
      { id: '47', text: 'Do you have any permit to enter this area' },
      { id: '48', text: 'Show us the port clearance papers' },
      { id: '49', text: 'Is it a fuel Cargo' },
    ],
    Warning: [
      { id: '50', text: 'This is a Warning! Stop your vessel or we will fire on you' },
      { id: '51', text: 'Stop your vessel and assemble all your crew on the foxle' },
      { id: '52', text: 'We will now fire on your vessel' },
      { id: '53', text: 'You are in Indian territorial waters, alter course and clear away' },
      { id: '54', text: 'Your vessel is detained for search' },
      { id: '55', text: 'Your vessel is liable for search' },
      { id: '56', text: 'Stop your vessel! You are entering the Indian Territorial Waters' },
      { id: '57', text: 'This is the Final Warning! Stop your Vessel and Co-operate with us' },
      { id: '58', text: 'You are too close to my ship. Move Back' },
      { id: '59', text: 'Switch on your upper deck lights' },
      { id: '60', text: 'Do not close me. Alter course to starboard' },
      { id: '61', text: 'Do not approach my ship closer than 500 feet' },
      { id: '62', text: 'Stop! You will be shot' },
      { id: '63', text: 'Stop! This is a restricted zone' },
      { id: '64', text: 'Warning! Keep your hands behind your head and co-operate! It\'s a routine checkup' },
      { id: '65', text: 'Turn off your engine and surrender' },
    ],
  },
};

// Function to get commands - always use Hindi text
const getCommandsForLanguage = (category) => {
  // Convert the category name to title case to match the data structure
  const categoryName = category?.charAt(0).toUpperCase() + category?.slice(1).toLowerCase();
  console.log('Category name being searched:', categoryName);
  console.log('Available categories:', Object.keys(commandsData.Hindi));
  return commandsData.Hindi[categoryName] || [];
};

const CommandListScreen = ({ navigation, route }) => {
  const { selectedLanguage } = useLanguage();
  const { category } = route.params;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null);
  const [repeatOn, setRepeatOn] = useState(false);
  const progress = useProgress(100); // Smooth animation
  
  // Log the incoming category
  console.log('Route params category:', category);
  console.log('Category name:', category?.name);
  
  const commands = getCommandsForLanguage(category?.name);
  
  // Log the commands being loaded
  console.log('Loaded commands:', commands);

  // Handle playback state changes and auto-stop
  useTrackPlayerEvents([Event.PlaybackState, Event.PlaybackTrackChanged], async (event) => {
    if (event.type === Event.PlaybackState) {
      setIsPlaying(event.state === State.Playing);
      if (event.state === State.Stopped || event.state === State.None) {
        setIsPlaying(false);
        // Keep currentTrackIndex to allow replaying
      }
    } else if (event.type === Event.PlaybackTrackChanged && event.nextTrack == null) {
      console.log('[CommandListScreen] PlaybackTrackChanged:', { repeatOn, currentTrackIndex });
      if (!repeatOn) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        setIsPlaying(false);
        // Keep currentTrackIndex to allow replaying
      }
      // Repeat handled by TrackPlayer.setRepeatMode
    }
  });

  useEffect(() => {
    console.log('[CommandListScreen] Mounting component');
    console.log('[CommandListScreen] Selected Language:', selectedLanguage?.name);
    console.log('[CommandListScreen] Selected Category:', category?.name);
    console.log('[CommandListScreen] Available Commands:', commands);

    const setup = async () => {
      try {
        await AudioService.setupPlayer();
        await TrackPlayer.setRepeatMode(RepeatMode.Off); // Initialize repeat mode
        console.log('[CommandListScreen] Player setup successfully');
      } catch (error) {
        console.error('[CommandListScreen] Setup error:', error);
        Alert.alert('Error', 'Failed to initialize audio player. Please try again.', [
          { text: 'OK' },
        ]);
      }
    };

    setup();

    return () => {
      console.log('[CommandListScreen] Component unmounting, cleaning up...');
      TrackPlayer.setRepeatMode(RepeatMode.Off); // Reset repeat on unmount
      AudioService.cleanup();
    };
  }, [selectedLanguage, category]);

  const handlePlayCommand = async (index) => {
    try {
      const command = commands[index];
      await TrackPlayer.stop(); // Stop any current playback
      await TrackPlayer.reset(); // Clear queue
      await AudioService.playTrack(
        command.id,
        selectedLanguage?.name || 'English',
        category?.name,
        command.text
      );
      setCurrentTrackIndex(index);
      console.log('[CommandListScreen] Playing command:', command.text);
    } catch (error) {
      console.error('[CommandListScreen] Playback error:', error);
      Alert.alert(
        'Playback Error',
        'Unable to play this command. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const togglePlayback = async () => {
    if (currentTrackIndex === null) {
      console.log('[CommandListScreen] No track selected to toggle');
      return;
    }
    try {
      const state = await TrackPlayer.getState();
      if (state === State.Playing) {
        await TrackPlayer.pause();
        console.log('[CommandListScreen] Paused playback');
      } else {
        // Play or replay the current command
        const command = commands[currentTrackIndex];
        await TrackPlayer.stop();
        await TrackPlayer.reset();
        await AudioService.playTrack(
          command.id,
          selectedLanguage?.name || 'English',
          category?.name,
          command.text
        );
        console.log('[CommandListScreen] Playing command:', command.text);
      }
    } catch (error) {
      console.error('[CommandListScreen] Error toggling playback:', error);
      Alert.alert(
        'Playback Error',
        'Unable to control playback. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const playNext = async () => {
    try {
      if (currentTrackIndex === null || currentTrackIndex >= commands.length - 1) {
        console.log('[CommandListScreen] No next track available');
        return;
      }
      const nextIndex = currentTrackIndex + 1;
      await handlePlayCommand(nextIndex);
    } catch (error) {
      console.error('[CommandListScreen] Error playing next track:', error);
      Alert.alert(
        'Playback Error',
        'Unable to play next command. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const playPrevious = async () => {
    try {
      if (currentTrackIndex === null || currentTrackIndex <= 0) {
        console.log('[CommandListScreen] No previous track available');
        return;
      }
      const prevIndex = currentTrackIndex - 1;
      await handlePlayCommand(prevIndex);
    } catch (error) {
      console.error('[CommandListScreen] Error playing previous track:', error);
      Alert.alert(
        'Playback Error',
        'Unable to play previous command. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleShuffle = async () => {
    try {
      if (commands.length === 0) {
        console.log('[CommandListScreen] No commands available for shuffle');
        return;
      }
      const randomIndex = Math.floor(Math.random() * commands.length);
      await handlePlayCommand(randomIndex);
      console.log('[CommandListScreen] Shuffled to command index:', randomIndex);
    } catch (error) {
      console.error('[CommandListScreen] Error shuffling:', error);
      Alert.alert(
        'Playback Error',
        'Unable to shuffle commands. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleRepeat = async () => {
    try {
      const newRepeatOn = !repeatOn;
      setRepeatOn(newRepeatOn);
      await TrackPlayer.setRepeatMode(newRepeatOn ? RepeatMode.Track : RepeatMode.Off);
      console.log('[CommandListScreen] Repeat toggled:', newRepeatOn);
    } catch (error) {
      console.error('[CommandListScreen] Error toggling repeat:', error);
      Alert.alert('Error', 'Unable to toggle repeat mode.', [{ text: 'OK' }]);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.commandItem}>
      {currentTrackIndex === index && (
        <View
          style={[
            styles.progressFill,
            { width: `${(progress.position / progress.duration) * 100 || 0}%` },
          ]}
        />
      )}
      <TouchableOpacity
        style={styles.commandTouchable}
        onPress={() => handlePlayCommand(index)}
      >
        <View style={styles.commandContent}>
          <Text style={styles.commandText}>{item.text}</Text>
        </View>
        <View style={styles.playButtonContainer}>
          <Image
            source={
              isPlaying && currentTrackIndex === index
                ? require('../assets/images/icons/pause.png')
                : require('../assets/images/icons/play.png')
            }
            style={styles.icon}
            resizeMode="contain"
            onError={() => console.log('[CommandListScreen] Error loading icon for command:', item.id)}
          />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000080" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('CommandsScreen')}
        >
          <Image
            source={require('../assets/images/icons/back.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Image
            source={require('../assets/images/icons/home.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.backButtonText}>HOME</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {selectedLanguage?.name?.toUpperCase()} {category?.name?.toUpperCase()}
        </Text>

        
      </View>

      {/* Command List */}
      <FlatList
        data={commands}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Audio Player Controls */}
      <View style={styles.playerContainer}>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.mainControlButton} onPress={playPrevious}>
            <Image
              source={require('../assets/images/icons/previous.png')}
              style={styles.secondaryControlIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryControlButton} onPress={handleShuffle}>
            <Image
              source={require('../assets/images/icons/shuffle.png')}
              style={styles.secondaryControlIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainControlButton} onPress={togglePlayback}>
            <Image
              source={
                isPlaying
                  ? require('../assets/images/icons/pause.png')
                  : require('../assets/images/icons/play.png')
              }
              style={styles.mainControlIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryControlButton} onPress={toggleRepeat}>
            <Image
              source={
                repeatOn
                  ? require('../assets/images/icons/repeat_on.png')
                  : require('../assets/images/icons/repeat_off.png')
              }
              style={styles.secondaryControlIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.mainControlButton} onPress={playNext}>
            <Image
              source={require('../assets/images/icons/next.png')}
              style={styles.secondaryControlIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  header: {
    height: scaleHeight(98), // 10% of reference height (984)
    backgroundColor: '#000080',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(5),
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: scaleFont(30),
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: scaleSize(15),
    width: scaleWidth(70),
    height: scaleHeight(70),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(198, 192, 213, 0.44)',
    borderRadius: scaleSize(20),
  },
  homeButton: {
    marginLeft: scaleSize(5),
    width: scaleWidth(70),
    height: scaleHeight(70),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(198, 192, 213, 0.44)',
    borderRadius: scaleSize(20),
  },
  listContainer: {
    padding: scaleSize(16),
    paddingBottom: scaleHeight(100),
  },
  commandItem: {
    backgroundColor: '#fff',
    borderRadius: scaleSize(8),
    marginBottom: scaleHeight(8),
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(64, 82, 182, 0.3)',
    borderRadius: scaleSize(8),
  },
  commandTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: scaleSize(16),
    zIndex: 1,
  },
  commandContent: {
    flex: 1,
    marginRight: scaleWidth(8),
  },
  commandText: {
    fontSize: scaleFont(20),
    color: '#333333',
    fontFamily: fonts.regular,
    fontWeight: 'bold',
  },
  playButtonContainer: {
    width: scaleWidth(50),
    height: scaleHeight(50),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaleSize(20),
    zIndex: 2,
  },
  icon: {
    width: scaleWidth(40),
    height: scaleHeight(40),
  },
  playerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#003357',
    padding: scaleSize(16),
    paddingBottom: scaleHeight(32),
    borderTopLeftRadius: scaleSize(15),
    borderTopRightRadius: scaleSize(15),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(8),
  },
  secondaryControlButton: {
    width: scaleWidth(40),
    height: scaleHeight(40),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: scaleSize(24),
    marginHorizontal: scaleWidth(4),
  },
  mainControlButton: {
    width: scaleWidth(56),
    height: scaleHeight(56),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: scaleSize(30),
    marginHorizontal: scaleWidth(4),
  },
  secondaryControlIcon: {
    width: scaleWidth(20),
    height: scaleHeight(20),
  },
  mainControlIcon: {
    width: scaleWidth(50),
    height: scaleHeight(50),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    fontFamily: fonts.regular,
  },
});

export default CommandListScreen;