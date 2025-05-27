import { Platform, PermissionsAndroid, Alert, NativeModules } from 'react-native';

const { ManageExternalStorage } = NativeModules;

export const requestStoragePermission = async () => {
  console.log('Requesting storage permission...');
  console.log('Platform:', Platform.OS, 'Version:', Platform.Version);

  if (Platform.OS !== 'android') {
    console.log('Not Android, returning true');
    return true;
  }

  try {
    // For Android 13 (API level 33) and above
    if (Platform.Version >= 33) {
      console.log('Requesting READ_MEDIA_AUDIO permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        {
          title: 'Audio Permission',
          message: 'Voice Command App needs access to audio files to play commands.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      console.log('READ_MEDIA_AUDIO permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    // For Android 11/12 (API level 30/31/32)
    else if (Platform.Version >= 30) {
      if (ManageExternalStorage) {
        const hasPermission = await ManageExternalStorage.hasPermission();
        if (hasPermission) return true;
        // Open settings for user to grant permission
        Alert.alert(
          'Grant All Files Access',
          'To use this feature, please grant "All files access" to LRAD in the next screen.\n\n1. Tap "Allow" or enable the switch for LRAD.\n2. Return to this app and retry.\n\nIf you do not grant access, audio features will not work.',
          [
            { text: 'Go to Settings', onPress: () => ManageExternalStorage.requestPermission() },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return false;
      } else {
        console.warn('ManageExternalStorage native module not available');
        return false;
      }
    } else {
      // For Android 10 (API level 29) and below
      console.log('Requesting WRITE_EXTERNAL_STORAGE permission');
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'Voice Command App needs access to storage to play audio commands.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      console.log('WRITE_EXTERNAL_STORAGE permission result:', granted);
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  } catch (err) {
    console.error('Error requesting storage permission:', err);
    return false;
  }
};

export const checkStoragePermission = async () => {
  console.log('Checking storage permission...');
  console.log('Platform:', Platform.OS, 'Version:', Platform.Version);

  if (Platform.OS !== 'android') {
    console.log('Not Android, returning true');
    return true;
  }

  try {
    if (Platform.Version >= 33) {
      console.log('Checking READ_MEDIA_AUDIO permission');
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO
      );
      console.log('READ_MEDIA_AUDIO check result:', result);
      return result;
    } else if (Platform.Version >= 30) {
      if (ManageExternalStorage) {
        const hasPermission = await ManageExternalStorage.hasPermission();
        return hasPermission;
      } else {
        console.warn('ManageExternalStorage native module not available');
        return false;
      }
    } else {
      console.log('Checking WRITE_EXTERNAL_STORAGE permission');
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      );
      console.log('WRITE_EXTERNAL_STORAGE check result:', result);
      return result;
    }
  } catch (err) {
    console.error('Error checking storage permission:', err);
    return false;
  }
}; 