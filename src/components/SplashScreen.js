import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { fonts } from '../theme/fonts';
const SplashScreen = ({ onFinish }) => {
  const [firstOpacity, setFirstOpacity] = useState(0);
  const [secondOpacity, setSecondOpacity] = useState(0);

  useEffect(() => {
    console.log('SplashScreen mounted');
    
    // First text appears immediately
    setFirstOpacity(1);
    
    // Second text appears after delay
    setTimeout(() => {
      setSecondOpacity(1);
    }, 1500);

    // Finish after delay
    setTimeout(() => {
      onFinish();
    }, 4000);

    return () => {
      console.log('SplashScreen cleanup');
    };
  }, [onFinish]);

  console.log('Render - First opacity:', firstOpacity, 'Second opacity:', secondOpacity);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000080" barStyle="light-content" />
      <View style={styles.content}>
        <Text style={[styles.firstText, { opacity: firstOpacity }]}>
          LRAD
        </Text>
        <Text style={[styles.secondText, { opacity: secondOpacity }]}>
          INDIAN NAVY
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000080',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstText: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: fonts.regular,
  },
  secondText: {
    fontSize: 36,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 20,
    fontFamily: fonts.regular,
  },
});

export default SplashScreen; 