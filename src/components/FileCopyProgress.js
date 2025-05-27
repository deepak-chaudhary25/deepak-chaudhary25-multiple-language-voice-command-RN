import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { scaleWidth, scaleHeight, scaleFont, scaleSize } from '../utils/responsive';

const FileCopyProgress = ({ visible, progress, currentFile, language, onCancel }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Copying Audio Files</Text>
          
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          
          {currentFile && (
            <Text style={styles.fileText}>
              Copying: {language}/{currentFile}
            </Text>
          )}
          
          <ActivityIndicator
            size="large"
            color="#000080"
            style={styles.spinner}
          />
          
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(20),
    padding: scaleSize(30),
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: scaleFont(24),
    color: '#000080',
    fontWeight: 'bold',
    marginBottom: scaleHeight(20),
  },
  progressContainer: {
    width: '100%',
    height: scaleHeight(20),
    backgroundColor: '#F4F4FB',
    borderRadius: scaleSize(10),
    overflow: 'hidden',
    marginBottom: scaleHeight(10),
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#000080',
    borderRadius: scaleSize(10),
  },
  progressText: {
    fontSize: scaleFont(18),
    color: '#000080',
    fontWeight: 'bold',
    marginBottom: scaleHeight(10),
  },
  fileText: {
    fontSize: scaleFont(16),
    color: '#666666',
    marginBottom: scaleHeight(20),
  },
  spinner: {
    marginBottom: scaleHeight(20),
  },
  cancelButton: {
    backgroundColor: '#F4F4FB',
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(10),
    borderRadius: scaleSize(10),
  },
  cancelButtonText: {
    fontSize: scaleFont(16),
    color: '#000080',
    fontWeight: 'bold',
  },
});

export default FileCopyProgress; 