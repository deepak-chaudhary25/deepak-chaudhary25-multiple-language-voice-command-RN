import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, BackHandler, Alert, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import HomeScreen from './src/components/HomeScreen';
import CommandsScreen from './src/components/CommandsScreen';
import CommandListScreen from './src/components/CommandListScreen';
import SplashScreen from './src/components/SplashScreen';
import { LanguageProvider } from './src/context/LanguageContext';
import { fonts } from './src/theme/fonts';
import { requestStoragePermission, checkStoragePermission } from './src/utils/StoragePermission';
import { validateDirectory, getDefaultAudioDirectory, createAudioDirectory } from './src/utils/DirectoryValidator';
import { copyAudioFiles } from './src/utils/FileManager';
import { pickDirectory } from './src/utils/DirectoryPicker';

// Set default text component to use Sonorous font
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = { fontFamily: fonts.regular };

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [screenParams, setScreenParams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Starting app initialization...');
      
      // Check storage permission
      setStatus('Checking storage permissions...');
      const hasPermission = await checkStoragePermission();
      console.log('Permission check result:', hasPermission);

      if (!hasPermission) {
        console.log('Requesting permission...');
        const granted = await requestStoragePermission();
        console.log('Permission request result:', granted);

        if (!granted) {
          Alert.alert(
            'Storage Permission Required',
            'Voice Command App needs storage permission to access audio commands.',
            [
              {
                text: 'Grant Permission',
                onPress: async () => {
                  const granted = await requestStoragePermission();
                  if (granted) {
                    initializeApp();
                  }
                }
              }
            ]
          );
          return;
        }
      }

      // Get default audio directory
      setStatus('Checking audio directory...');
      const audioDir = getDefaultAudioDirectory();
      console.log('Audio directory:', audioDir);
      
      // Create directory if it doesn't exist
      await createAudioDirectory(audioDir);

      // Validate directory structure
      const validationResult = await validateDirectory(audioDir);
      console.log('Validation result:', validationResult);
      
      if (!validationResult.isValid) {
        // Prompt user to select source directory
        Alert.alert(
          'Audio Commands Required',
          'Please select the directory containing your voice command audio files.',
          [
            {
              text: 'Select Directory',
              onPress: handleSelectSourceDirectory
            }
          ]
        );
        return;
      }

      // If we get here, everything is set up correctly
      console.log('Initialization complete');
      setCurrentScreen('Home');
    } catch (error) {
      console.error('Initialization error:', error);
      Alert.alert(
        'Error',
        'Failed to initialize app: ' + error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSourceDirectory = async () => {
    try {
      setIsLoading(true);
      setStatus('Selecting source directory...');
      
      const result = await pickDirectory();
      console.log('Directory picker result:', result);
      
      if (result.success) {
        setStatus('Copying audio files...');
        const copyResult = await copyAudioFiles(result.path, (progress) => {
          setStatus(`Copying files: ${Math.round(progress.progress)}%`);
        });

        if (!copyResult.success) {
          Alert.alert(
            'Error',
            `Failed to copy files: ${copyResult.error}`,
            [{ text: 'OK' }]
          );
          return;
        }

        // Validate copied files
        const validationResult = await validateDirectory(getDefaultAudioDirectory());
        if (!validationResult.isValid) {
          Alert.alert(
            'Warning',
            'Some files may not have been copied correctly. Please check the audio directory.',
            [{ text: 'OK' }]
          );
          return;
        }

        // If we get here, everything is set up correctly
        setCurrentScreen('Home');
      } else if (result.error !== 'User cancelled directory selection') {
        Alert.alert(
          'Error',
          `Failed to select directory: ${result.error}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error selecting directory:', error);
      Alert.alert(
        'Error',
        'Failed to select directory: ' + error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const navigationProps = {
    navigate: (screenName, params) => {
      setCurrentScreen(screenName);
      if (params) {
        setScreenParams(params);
      }
    },
    goBack: () => {
      if (currentScreen === 'CommandListScreen') {
        setCurrentScreen('CommandsScreen');
      } else if (currentScreen === 'CommandsScreen') {
        setCurrentScreen('Home');
      } else if (currentScreen === 'Home') {
        // Show exit confirmation when on Home screen
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Exit',
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
      }
    },
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigationProps.goBack();
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [currentScreen]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen onFinish={() => setCurrentScreen('Home')} />;
      case 'Home':
        return <HomeScreen navigation={navigationProps} />;
      case 'CommandsScreen':
        return <CommandsScreen navigation={navigationProps} />;
      case 'CommandListScreen':
        return <CommandListScreen navigation={navigationProps} route={{ params: screenParams }} />;
      default:
        return <HomeScreen navigation={navigationProps} />;
    }
  };

  return (
    <LanguageProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#000080" barStyle="light-content" />
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000080" />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ) : (
          renderScreen()
        )}
      </SafeAreaView>
    </LanguageProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 20,
    fontSize: 16,
    color: '#000080',
    textAlign: 'center',
  },
});

export default App; 