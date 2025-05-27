import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { scaleWidth, scaleHeight, scaleFont, scaleSize } from '../utils/responsive';

const HomeScreen = ({ navigation }) => {
  const handleStartPress = () => {
    navigation.navigate('CommandsScreen');
  };

  return (
    <ImageBackground 
      source={require('../assets/images/lrad.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <StatusBar backgroundColor="#000080" barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>LRAD INDIAN NAVY</Text>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <TouchableOpacity 
            style={[styles.button, styles.blueButton]}
            onPress={handleStartPress}
          >
            <Text style={styles.buttonTextmain}>LRAD INDIAN NAVY</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={[styles.button, styles.grayButton]}>
            <Text style={styles.buttonText}>ADMIN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.grayButton]}>
            <Text style={styles.buttonText}>SETTING</Text>
          </TouchableOpacity> */}
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
  },
  header: {
    height: scaleHeight(98), // 10% of reference height (984)
    backgroundColor: '#000080',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: scaleFont(25),
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(20),
    gap: scaleSize(20),
  },
  button: {
    height: scaleHeight(80),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaleSize(4),
    elevation: 2,
  },
  blueButton: {
    backgroundColor: '#003357',
    borderRadius: scaleSize(10),
  },
  grayButton: {
    backgroundColor: '#F4F4FB',
  },
  buttonText: {
    fontSize: scaleFont(20),
    fontWeight: 'bold',
    color: '#000080',
  },
  buttonTextmain: {
    fontSize: scaleFont(25),
    fontWeight: 'bold',
    color: '#fff',
  }
});

export default HomeScreen;