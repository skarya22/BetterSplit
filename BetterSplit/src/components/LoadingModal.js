import {useTheme} from '@react-navigation/native';
import React, {useRef} from 'react';
import {View, Image, Modal, Animated} from 'react-native';

const LoadingModal = () => {
  const translateXY1 = useRef(new Animated.Value(-10)).current;
  const translateXY2 = useRef(new Animated.Value(10)).current;
  const {colors} = useTheme();
  React.useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateXY1, {
            toValue: 0,
            useNativeDriver: true,
            duration: 1000,
          }),
          Animated.timing(translateXY1, {
            toValue: -10,
            useNativeDriver: true,
            duration: 1000,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateXY2, {
            toValue: 0,
            useNativeDriver: true,
            duration: 1000,
          }),
          Animated.timing(translateXY2, {
            toValue: 10,
            useNativeDriver: true,
            duration: 1000,
          }),
        ]),
      ]),
    ).start();
  }, [translateXY1]);

  return (
    <View
      style={{
        height: '100%',
        width: '50%',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
      }}>
      <View
        style={{
          height: '100%',
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <Animated.Image
            source={require('../assets/LogoSlices/top_left.png')}
            style={[
              {
                width: 58 * 1,
                height: 51 * 1,
                alignSelf: 'center',
              },
              {
                transform: [
                  {translateX: translateXY1},
                  {translateY: translateXY1},
                ],
              },
            ]}
          />
          <Image
            source={require('../assets/LogoSlices/top_mid.png')}
            style={{
              width: 116 * 1,
              height: 51 * 1,
              alignSelf: 'center',
            }}
          />
          <Image
            source={require('../assets/LogoSlices/top_right.png')}
            style={{
              width: 58 * 1,
              height: 51 * 1,
              alignSelf: 'center',
            }}
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
          }}>
          <Image
            source={require('../assets/LogoSlices/bot_left.png')}
            style={{
              width: 58 * 1,
              height: 51 * 1,
              alignSelf: 'center',
            }}
          />
          <Image
            source={require('../assets/LogoSlices/bot_mid.png')}
            style={{
              width: 116 * 1,
              height: 51 * 1,
              alignSelf: 'center',
            }}
          />
          <Animated.Image
            source={require('../assets/LogoSlices/bot_right.png')}
            style={[
              {
                width: 58 * 1,
                height: 51 * 1,
                alignSelf: 'center',
              },
              {
                transform: [
                  {translateX: translateXY2},
                  {translateY: translateXY2},
                ],
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

export default LoadingModal;
