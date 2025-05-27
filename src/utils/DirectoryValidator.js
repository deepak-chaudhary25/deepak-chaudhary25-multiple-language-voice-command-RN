import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

const REQUIRED_FILES_COUNT = 65;
const ALL_LANGUAGES = [
  'Arabic', 'Bahasa', 'Bengali', 'Burmese', 'Chinese', 'Dari', 'Dutch',
  'English', 'French', 'German', 'Gujarati', 'Hebrew', 'Hindi', 'Italian',
  'Japanese', 'Kannada', 'Korean', 'Malayalam', 'Marathi', 'Oriya', 'Persian',
  'Polish', 'Portuguese', 'Russian', 'Sinhala', 'Somali', 'Spanish', 'Swahili',
  'Tamil', 'Telugu', 'Thai', 'Urdu', 'Vietnamese'
];

// Helper function to normalize language names
const normalizeLanguageName = (name) => name.toLowerCase().trim();

export const validateDirectory = async (directoryPath) => {
  const errors = [];
  const invalidFiles = {};
  const missingFiles = {};
  const languageStatus = {};

  try {
    console.log('Validating directory:', directoryPath);
    
    // Check if the directory exists
    const exists = await RNFS.exists(directoryPath);
    if (!exists) {
      errors.push(`Directory does not exist: ${directoryPath}`);
      return {
        isValid: false,
        errors,
        invalidFiles,
        missingFiles,
        languageStatus
      };
    }

    // Initialize missingFiles for all languages
    ALL_LANGUAGES.forEach(lang => {
      missingFiles[lang] = [];
    });

    // Get all directories in the audio directory
    const directories = await RNFS.readDir(directoryPath);
    const languageDirs = directories.filter(dir => dir.isDirectory());
    
    // Create a map of normalized language names to their proper case
    const languageMap = new Map();
    ALL_LANGUAGES.forEach(lang => {
      languageMap.set(normalizeLanguageName(lang), lang);
    });

    // Check each language directory
    for (const dir of languageDirs) {
      const normalizedLang = normalizeLanguageName(dir.name);
      const properLang = languageMap.get(normalizedLang);
      
      if (!properLang) {
        console.log(`Unknown language directory: ${dir.name}`);
        continue;
      }

      console.log(`Checking ${properLang} path:`, dir.path);
      
      const files = await RNFS.readDir(dir.path);
      console.log(`${properLang} files found:`, files.length);
      
      const audioFiles = files.filter(file => 
        file.isFile() && (file.name.endsWith('.mp3') || file.name.endsWith('.wav'))
      );

      if (audioFiles.length !== REQUIRED_FILES_COUNT) {
        console.log(`${properLang} has ${audioFiles.length} files instead of ${REQUIRED_FILES_COUNT}`);
        languageStatus[properLang] = 'incomplete';
        
        const existingFiles = new Set(audioFiles.map(file => file.name));
        for (let i = 1; i <= REQUIRED_FILES_COUNT; i++) {
          const mp3FileName = `${i}.mp3`;
          const wavFileName = `${i}.wav`;
          if (!existingFiles.has(mp3FileName) && !existingFiles.has(wavFileName)) {
            missingFiles[properLang].push(mp3FileName);
          }
        }
      } else {
        languageStatus[properLang] = 'complete';
      }
    }

    // Check for missing languages
    for (const lang of ALL_LANGUAGES) {
      if (!languageStatus[lang]) {
        console.log(`${lang} directory not found, will use English as fallback`);
        languageStatus[lang] = 'fallback';
      }
    }

    // Ensure English is always available
    if (languageStatus['English'] !== 'complete') {
      errors.push('English audio files are required and must be complete');
    }

    const isValid = languageStatus['English'] === 'complete';
    return {
      isValid,
      errors,
      invalidFiles,
      missingFiles,
      languageStatus
    };
  } catch (error) {
    console.error('Error validating directory:', error);
    return {
      isValid: false,
      errors: [error.message],
      invalidFiles,
      missingFiles,
      languageStatus
    };
  }
};

export const getDefaultAudioDirectory = () => {
  if (Platform.OS === 'android') {
    return `${RNFS.ExternalDirectoryPath}/Audio`;
  }
  return `${RNFS.DocumentDirectoryPath}/Audio`;
};

export const createAudioDirectory = async (directoryPath) => {
  try {
    const exists = await RNFS.exists(directoryPath);
    if (!exists) {
      await RNFS.mkdir(directoryPath);
    }
    return true;
  } catch (error) {
    console.error('Error creating audio directory:', error);
    return false;
  }
}; 