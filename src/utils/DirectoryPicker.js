import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export const pickDirectory = async () => {
  try {
    if (Platform.OS === 'android') {
      // For Android, we'll use the SAF (Storage Access Framework)
      const result = await DocumentPicker.pickDirectory({
        mode: 'open',
      });

      if (result && result.uri) {
        // For Android, we need to handle the content URI
        const path = result.uri;
        console.log('Selected directory URI:', path);
        
        // Convert content URI to file path
        let filePath = path;
        if (path.startsWith('content://')) {
          // Extract the path from the content URI
          const pathMatch = path.match(/primary%3A(.*)/);
          if (pathMatch && pathMatch[1]) {
            filePath = `/storage/emulated/0/${decodeURIComponent(pathMatch[1])}`;
            console.log('Converted file path:', filePath);
          }
        }
        
        return {
          success: true,
          path: filePath
        };
      }
    } else {
      // For iOS, use the standard document picker
      const result = await DocumentPicker.pickDirectory();
      if (result && result.uri) {
        return {
          success: true,
          path: result.uri
        };
      }
    }

    return {
      success: false,
      error: 'No directory selected'
    };
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      return {
        success: false,
        error: 'User cancelled directory selection'
      };
    }
    console.error('Directory picker error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}; 