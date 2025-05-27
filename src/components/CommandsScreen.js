import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLanguage } from '../context/LanguageContext';
import LanguageDropdown from './LanguageDropdown';
import { fonts } from '../theme/fonts';

import { scaleWidth, scaleHeight, scaleFont, scaleSize } from '../utils/responsive';

const commandCategories = [
  { id: '1', name: 'INTRODUCTION' },
  { id: '2', name: 'CAUTION' },
  { id: '3', name: 'WARNING' },
  
];

const CommandsScreen = ({ navigation }) => {
  const { selectedLanguage } = useLanguage();

  const handleCategorySelect = (category) => {
    console.log('Selected category:', category);
    navigation.navigate('CommandListScreen', {
      category: {
        ...category,
        name: category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase()
      }
    });
  };

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryItem}
      onPress={() => handleCategorySelect(item)}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
      <Icon name="chevron-right" size={scaleFont(24)} color="#000080" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000080" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require('../assets/images/icons/back.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Image
            source={require('../assets/images/icons/home.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.backButtonText}>HOME</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <LanguageDropdown />

        </View>
      </View>

      {/* Categories List */}
      <FlatList
        data={commandCategories}
        renderItem={renderCategoryItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F4FB',
  },
  header: {
    height: scaleHeight(98), // 10% of reference height (984)
    backgroundColor: '#000080',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scaleWidth(5),
    elevation: 4,
    marginBottom: scaleSize(20),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(5),
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: scaleFont(30),
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontWeight: 'bold',
  },
  backButton: {
    marginRight: scaleSize(15),
    width: scaleWidth(70),
    height: scaleHeight(70),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(198, 192, 213, 0.44)',
    borderRadius: scaleSize(20),
  },
  homeButton: {
    marginLeft: scaleSize(5),
    width: scaleWidth(70),
    height: scaleHeight(70),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(198, 192, 213, 0.44)',
    borderRadius: scaleSize(20),
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(20),
    paddingHorizontal: scaleWidth(20),
    backgroundColor: '#F4F4FB',
  },
  categoryText: {
    fontSize: scaleFont(25),
    color: '#000080',
    fontWeight: '500',
    flex: 1,
  },
  separator: {
    height: scaleHeight(1),
    backgroundColor: '#E0E0E0',
  },
  icon: {
    width: scaleWidth(40),
    height: scaleHeight(40),
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFont(18),
    fontWeight: 'bold',
    fontFamily: fonts.regular,
  },
});

export default CommandsScreen;