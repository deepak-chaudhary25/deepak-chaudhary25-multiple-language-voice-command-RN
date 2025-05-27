import RNFS from 'react-native-fs';
import { getDefaultAudioDirectory } from './DirectoryValidator';

const ALL_LANGUAGES = [
  'Arabic', 'Bahasa', 'Bengali', 'Burmese', 'Chinese', 'Dari', 'Dutch',
  'English', 'French', 'German', 'Gujarati', 'Hebrew', 'Hindi', 'Italian',
  'Japanese', 'Kannada', 'Korean', 'Malayalam', 'Marathi', 'Oriya', 'Persian',
  'Polish', 'Portuguese', 'Russian', 'Sinhala', 'Somali', 'Spanish', 'Swahili',
  'Tamil', 'Telugu', 'Thai', 'Urdu', 'Vietnamese'
];

// Helper function to normalize language names
const normalizeLanguageName = (name) => name.toLowerCase().trim();

export const copyAudioFiles = async (sourcePath, onProgress) => {
  try {
    const audioDir = getDefaultAudioDirectory();

    // Create base audio directory if it doesn't exist
    await RNFS.mkdir(audioDir);

    let totalFiles = 0;
    let copiedFiles = 0;

    // Create a map of normalized language names to their proper case
    const languageMap = new Map();
    ALL_LANGUAGES.forEach(lang => {
      languageMap.set(normalizeLanguageName(lang), lang);
    });

    // Get all directories in the source directory
    const sourceDirs = await RNFS.readDir(sourcePath);
    const languageDirs = sourceDirs.filter(dir => dir.isDirectory());

    // First, count total files to copy
    for (const dir of languageDirs) {
      const normalizedLang = normalizeLanguageName(dir.name);
      const properLang = languageMap.get(normalizedLang);
      
      if (!properLang) {
        console.log(`Skipping unknown language directory: ${dir.name}`);
        continue;
      }

      const files = await RNFS.readDir(dir.path);
      totalFiles += files.length;
    }

    // Copy files for each language
    for (const dir of languageDirs) {
      const normalizedLang = normalizeLanguageName(dir.name);
      const properLang = languageMap.get(normalizedLang);
      
      if (!properLang) {
        continue;
      }

      const targetLangPath = `${audioDir}/${properLang}`;
      await RNFS.mkdir(targetLangPath);

      const files = await RNFS.readDir(dir.path);
      for (const file of files) {
        if (file.isFile() && (file.name.endsWith('.mp3') || file.name.endsWith('.wav'))) {
          const targetPath = `${targetLangPath}/${file.name}`;
          await RNFS.copyFile(file.path, targetPath);
          copiedFiles++;
          
          if (onProgress) {
            onProgress({
              progress: (copiedFiles / totalFiles) * 100,
              currentFile: file.name,
              language: properLang
            });
          }
        }
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error copying audio files:', error);
    return { success: false, error: error.message };
  }
};

export const verifyFileIntegrity = async (directoryPath) => {
  try {
    const directories = await RNFS.readDir(directoryPath);
    const languageDirs = directories.filter(dir => dir.isDirectory());

    // Create a map of normalized language names to their proper case
    const languageMap = new Map();
    ALL_LANGUAGES.forEach(lang => {
      languageMap.set(normalizeLanguageName(lang), lang);
    });

    const results = {};
    for (const dir of languageDirs) {
      const normalizedLang = normalizeLanguageName(dir.name);
      const properLang = languageMap.get(normalizedLang);
      
      if (!properLang) {
        console.log(`Skipping unknown language directory: ${dir.name}`);
        continue;
      }

      const files = await RNFS.readDir(dir.path);
      const audioFiles = files.filter(file => 
        file.isFile() && (file.name.endsWith('.mp3') || file.name.endsWith('.wav'))
      );
      results[properLang] = audioFiles.length;
    }

    return results;
  } catch (error) {
    console.error('Error verifying file integrity:', error);
    throw error;
  }
};

export const getDirectorySize = async (directoryPath) => {
  try {
    const exists = await RNFS.exists(directoryPath);
    if (!exists) {
      return 0;
    }

    let totalSize = 0;
    const files = await RNFS.readDir(directoryPath);
    
    for (const file of files) {
      if (file.isDirectory()) {
        totalSize += await getDirectorySize(file.path);
      } else {
        const stats = await RNFS.stat(file.path);
        totalSize += stats.size;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error getting directory size:', error);
    return 0;
  }
}; 