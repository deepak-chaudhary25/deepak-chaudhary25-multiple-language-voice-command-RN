import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { scaleWidth, scaleHeight, scaleFont, scaleSize } from '../utils/responsive';
import { validateDirectory, getDefaultAudioDirectory, createAudioDirectory } from '../utils/DirectoryValidator';
import { requestStoragePermission, checkStoragePermission } from '../utils/StoragePermission';
import { copyAudioFiles } from '../utils/FileManager';
import { pickDirectory } from '../utils/DirectoryPicker';
import RNFS from 'react-native-fs';

const InitializationScreen = ({ onInitializationComplete }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');
  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    console.log('InitializationScreen mounted');
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Starting initialization...');
      setStatus('Checking storage permissions...');
      
      // Check storage permission
      const hasPermission = await checkStoragePermission();
      console.log('Permission check result:', hasPermission);
      setPermissionStatus(hasPermission);

      if (!hasPermission) {
        console.log('Requesting permission...');
        const granted = await requestStoragePermission();
        console.log('Permission request result:', granted);
        setPermissionStatus(granted);

        if (!granted) {
          Alert.alert(
            'Storage Permission Required',
            'Voice Command App needs storage permission to access audio commands.',
            [
              {
                text: 'Grant Permission',
                onPress: async () => {
                  const granted = await requestStoragePermission();
                  console.log('Permission granted after retry:', granted);
                  setPermissionStatus(granted);
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
      onInitializationComplete();
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
        onInitializationComplete();
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

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000080" />
          <Text style={styles.statusText}>{status}</Text>
          {permissionStatus !== null && (
            <Text style={styles.permissionText}>
              Permission Status: {permissionStatus ? 'Granted' : 'Denied'}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSelectSourceDirectory}
          >
            <Text style={styles.buttonText}>Select Audio Source Directory</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  statusText: {
    marginTop: scaleHeight(20),
    fontSize: scaleFont(16),
    color: '#000080',
    textAlign: 'center',
  },
  permissionText: {
    marginTop: scaleHeight(10),
    fontSize: scaleFont(14),
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: scaleSize(20),
  },
  button: {
    backgroundColor: '#000080',
    padding: scaleSize(15),
    borderRadius: scaleSize(8),
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(16),
    fontWeight: 'bold',
  },
});

export default InitializationScreen; 