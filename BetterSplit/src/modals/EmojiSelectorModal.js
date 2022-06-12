import {useTheme} from '@react-navigation/native';
import React from 'react';

import {View, Dimensions} from 'react-native';

import EmojiSelector, {Categories} from '../components/EmojiSelector';

import {Button, DefaultTheme} from 'react-native-paper';
const EmojiSelectorScreen = ({navigation}) => {
  const dim = Dimensions.get('window');
  let columnAmount = 5;
  if (dim.height < dim.width) {
    columnAmount = 10;
  }

  Dimensions.addEventListener('change', () => {
    navigation.pop();
  });

  return (
    <View
      style={{
        height: '100%',
        padding: 16,
      }}>
      <Button
        onPress={() => {
          navigation.pop();
        }}>
        Close
      </Button>
      <EmojiSelector
        category={Categories.emotion}
        showHistory={false}
        showSearchBar={false}
        columns={columnAmount}
        onEmojiSelected={emoji => {
          DefaultTheme.setGroupEmoji(emoji);
          Dimensions.removeEventListener('change');
          navigation.pop();
        }}
      />
    </View>
  );
};

export default EmojiSelectorScreen;
