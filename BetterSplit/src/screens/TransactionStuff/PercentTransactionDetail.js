import React, {useEffect, useRef} from 'react';
import {View, Text, Animated} from 'react-native';
import {Avatar, DefaultTheme, Chip, Card} from 'react-native-paper';
import {useTheme} from '@react-navigation/native';

const PercentTransactionDetail = props => {
  const {colors} = useTheme();
  const backgroundColor =
    DefaultTheme.categoryColors[
      DefaultTheme.categories.indexOf(props.category)
    ];
  // const elevationAnim = useRef(new Animated.Value(0)).current;

  // useEffect(() => {
  //   Animated.timing(elevationAnim, {
  //     toValue: 3,
  //     delay: 750,
  //     duration: 50,
  //     useNativeDriver: true,
  //   }).start();
  // }, []);

  return (
    <Animated.View>
      <Card
        style={{
          marginVertical: 10,
          marginHorizontal: 30,
          elevation: 3,
          backgroundColor: colors.card,
          borderRadius: 15,
          flexDirection: 'row',
          width: props.width,
          paddingHorizontal: 8,
          alignSelf: 'center',
        }}>
        <Card.Content style={{flexDirection: 'row'}}>
          <View
            style={{
              flexDirection: 'column',
              marginVertical: 8,
              width: '50%',
              alignItems: 'flex-start',
            }}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                color: colors.text,
                fontWeight: 'bold',
                fontSize: 25,
              }}>
              {props.title}
            </Text>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                color: '#7ed957',
                fontSize: 40,
                fontWeight: 'bold',
                marginVertical: 5,
              }}>
              ${props.price}
            </Text>
            {props.people != null ? (
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{
                  color: colors.text,
                  fontWeight: 'bold',
                  fontSize: 13,
                  marginBottom: 5,
                }}>
                {props.people}
              </Text>
            ) : null}
            <View
              style={{
                marginVertical: 5,
              }}>
              <Chip
                style={{
                  backgroundColor: backgroundColor,
                  borderWidth: 2,
                }}
                mode="outlined" //changing display mode, default is flat.
                height={35} //give desirable height to chip
                textStyle={{fontSize: 15, color: 'black'}} //label properties
              >
                {props.category}
              </Chip>
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              marginTop: 10,
              right: 0,
              left: 40,
            }}>
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                color: colors.backdrop,
                fontWeight: 'bold',
                fontSize: 18,
                textAlign: 'center',
                marginBottom: 5,
              }}>
              {props.date.slice(4, props.date.length)}
            </Text>
            <Avatar.Text
              style={{
                borderRadius: 50,
                backgroundColor: props.groupBackgroundColor,
                marginVertical: 5,
                alignSelf: 'center',
                borderColor: 'black',
              }}
              size={65}
              label={props.paidBy.toString().charAt('0').toUpperCase()}
              labelStyle={{fontSize: 30, color: 'black'}}
            />
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                textAlign: 'center',
                color: colors.text,
                fontWeight: 'normal',
              }}>
              {props.paidBy}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

export default PercentTransactionDetail;
