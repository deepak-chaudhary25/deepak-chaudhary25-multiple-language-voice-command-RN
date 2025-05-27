import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Modal,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { scaleWidth, scaleHeight, scaleFont, scaleSize } from '../utils/responsive';
import { validateDirectory, getDefaultAudioDirectory, createAudioDirectory } from '../utils/DirectoryValidator';
import { requestStoragePermission, checkStoragePermission } from '../utils/StoragePermission';
import RNFS from 'react-native-fs';
import { copyAudioFiles, verifyFileIntegrity } from '../utils/FileManager';
import FileCopyProgress from './FileCopyProgress';
import { pickDirectory } from '../utils/DirectoryPicker';

const languages = [
  { id: '1', name: 'Arabic' },
  { id: '2', name: 'Bahasa' },
  { id: '3', name: 'Bengali' },
  { id: '4', name: 'Burmese' },
  { id: '5', name: 'Chinese' },
  { id: '6', name: 'Dari' },
  { id: '7', name: 'Dutch' },
  { id: '8', name: 'English' },
  { id: '9', name: 'French' },
  { id: '10', name: 'German' },
  { id: '11', name: 'Gujarati' },
  { id: '12', name: 'Hebrew' },
  { id: '13', name: 'Hindi' },
  { id: '14', name: 'Italian' },
  { id: '15', name: 'Japanese' },
  { id: '16', name: 'Kannada' },
  { id: '17', name: 'Korean' },
  { id: '18', name: 'Malayalam' },
  { id: '19', name: 'Marathi' },
  { id: '20', name: 'Oriya' },
  { id: '21', name: 'Persian' },
  { id: '22', name: 'Polish' },
  { id: '23', name: 'Portuguese' },
  { id: '24', name: 'Russian' },
  { id: '25', name: 'Sinhala' },
  { id: '26', name: 'Somali' },
  { id: '27', name: 'Spanish' },
  { id: '28', name: 'Swahili' },
  { id: '29', name: 'Tamil' },
  { id: '30', name: 'Telugu' },
  { id: '31', name: 'Thai' },
  { id: '32', name: 'Urdu' },
  { id: '33', name: 'Vietnamese' },
];

const LanguageDropdown = () => {
  const { selectedLanguage, setSelectedLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState(languages);
  const [isValidating, setIsValidating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copyProgress, setCopyProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(null);

  useEffect(() => {
    checkAndValidateDirectory();
  }, []);

  const checkAndValidateDirectory = async () => {
    try {
      setIsValidating(true);
      
      // Check storage permission
      const hasPermission = await checkStoragePermission();
      if (!hasPermission) {
        const granted = await requestStoragePermission();
        if (!granted) {
          Alert.alert(
            'Storage Permission Required',
            'Please grant storage permission to access audio files.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Get default audio directory
      const audioDir = getDefaultAudioDirectory();
      
      // Create directory if it doesn't exist
      await createAudioDirectory(audioDir);

      // Validate directory structure
      const validationResult = await validateDirectory(audioDir);
      
      if (!validationResult.isValid) {
        // Prompt user to select source directory
        Alert.alert(
          'Audio Files Required',
          'Please select the directory containing your audio files.',
          [
            {
              text: 'Select Directory',
              onPress: handleSelectSourceDirectory
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error validating audio directory:', error);
      Alert.alert(
        'Error',
        'Failed to validate audio directory: ' + error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredLanguages(languages);
    } else {
      const filtered = languages.filter((lang) =>
        lang.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLanguages(filtered);
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    setSearchQuery('');
    setFilteredLanguages(languages);
  };

  const handleCopyFiles = async (sourcePath) => {
    try {
      setIsCopying(true);
      setCopyProgress(0);
      setCurrentFile(null);
      setCurrentLanguage(null);

      const result = await copyAudioFiles(sourcePath, (progress) => {
        setCopyProgress(progress.progress);
        setCurrentFile(progress.currentFile);
        setCurrentLanguage(progress.language);
      });

      if (!result.success) {
        Alert.alert(
          'Error',
          `Failed to copy files: ${result.error}`,
          [{ text: 'OK' }]
        );
      } else {
        // Validate copied files
        const validationResult = await validateDirectory(getDefaultAudioDirectory());
        if (!validationResult.isValid) {
          Alert.alert(
            'Warning',
            'Some files may not have been copied correctly. Please check the audio directory.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error copying files:', error);
      Alert.alert(
        'Error',
        'Failed to copy files: ' + error.message,
        [{ text: 'OK' }]
      );
    } finally {
      setIsCopying(false);
    }
  };

  const handleCancelCopy = () => {
    setIsCopying(false);
    setCopyProgress(0);
    setCurrentFile(null);
    setCurrentLanguage(null);
  };

  const handleSelectSourceDirectory = async () => {
    try {
      const result = await pickDirectory();
      if (result.success) {
        await handleCopyFiles(result.path);
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
    }
  };

  const renderLanguageItem = ({ item }) => (
    <TouchableOpacity
      style={styles.languageItem}
      onPress={() => handleLanguageSelect(item)}
    >
      <Text style={styles.languageText}>{item.name}</Text>
      {selectedLanguage?.id === item.id && (
        <Image
          source={require('../assets/images/icons/check.png')}
          style={styles.checkIcon}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isValidating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#000080" />
          <Text style={styles.loadingText}>Validating audio files...</Text>
        </View>
      )}

      <FileCopyProgress
        visible={isCopying}
        progress={copyProgress}
        currentFile={currentFile}
        language={currentLanguage}
        onCancel={handleCancelCopy}
      />

      {/* <TouchableOpacity
        style={styles.sourceDirectoryButton}
        onPress={handleSelectSourceDirectory}
      >
        <Text style={styles.sourceDirectoryText}>Select Audio Source</Text>
      </TouchableOpacity> */}

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.selectedLanguage}>
          {selectedLanguage?.name || 'SELECT\nLANGUAGE'}
        </Text>
        {/* <Image
          source={require('../assets/images/icons/lan.png')}
          style={styles.languageIcon}
          resizeMode="contain"
        /> */}
        <Image
          source={require('../assets/images/icons/arrow.png')}
          style={styles.arrowIcon}
          resizeMode="contain"
          color="fff"
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Image
                source={require('../assets/images/icons/search.png')}
                style={styles.searchIcon}
                resizeMode="contain"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="SEARCH LANGUAGES..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={handleSearch}
                autoCapitalize="none"
              />
            </View>

            {/* Language List */}
            <FlatList
              data={filteredLanguages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.id}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No languages found</Text>
              }
              style={styles.languageList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '70%',
    marginLeft: scaleWidth(25),
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(12),
    height: scaleHeight(70),
    backgroundColor: 'rgba(198, 192, 213, 0.44)',
    borderRadius: scaleSize(20),
    //marginHorizontal: scaleWidth(10),
    minWidth: scaleWidth(20),
  },
  // languageIcon: {
  //   width: scaleWidth(30),
  //   height: scaleHeight(30),
  //   marginRight: scaleWidth(8),
  // },
  arrowIcon: {
    width: scaleWidth(24),
    height: scaleHeight(24),
  },
  checkIcon: {
    width: scaleWidth(30),
    height: scaleHeight(30),
  },
  selectedLanguage: {
    color: '#FFFFFF',
    fontSize: scaleFont(20),
    marginRight: scaleWidth(5),
    fontWeight: 'bold',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: Dimensions.get('window').width * 0.8,
    maxHeight: Dimensions.get('window').height * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(8),
    padding: scaleSize(16),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4FB',
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleWidth(12),
    marginBottom: scaleSize(16),
  },
  searchIcon: {
    width: scaleWidth(35),
    height: scaleHeight(35),
    marginRight: scaleWidth(8),
  },
  searchInput: {
    flex: 1,
    height: scaleHeight(60),
    fontSize: scaleFont(25),
    color: '#000080',
  },
  languageList: {
    maxHeight: Dimensions.get('window').height * 0.8,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(12),
    paddingHorizontal: scaleWidth(8),
  },
  languageText: {
    fontSize: scaleFont(25),
    color: '#000080',
  },
  separator: {
    height: scaleHeight(1),
    backgroundColor: '#E0E0E0',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: scaleFont(20),
    color: '#999',
    marginTop: scaleHeight(20),
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: scaleHeight(10),
    fontSize: scaleFont(16),
    color: '#000080',
    fontWeight: 'bold',
  },
  // sourceDirectoryButton: {
  //   backgroundColor: '#000080',
  //   padding: scaleSize(10),
  //   borderRadius: scaleSize(8),
  //   marginBottom: scaleHeight(10),
  //   alignItems: 'center',
  // },
  // sourceDirectoryText: {
  //   color: '#FFFFFF',
  //   fontSize: scaleFont(16),
  //   fontWeight: 'bold',
  // },
});

export default LanguageDropdown;