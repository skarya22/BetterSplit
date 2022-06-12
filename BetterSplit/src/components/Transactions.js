import React, {useEffect, useRef} from 'react';
import {View, Text, Animated} from 'react-native';
import {Avatar, DefaultTheme, Chip, Card} from 'react-native-paper';
import {useTheme} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';

const Transactions = props => {
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
        <Card.Content style={{flexDirection: 'row', width: '100%'}}>
          <View
            style={{
              flexDirection: 'column',
              marginVertical: 8,
              width: '60%',
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
              ${parseFloat(props.price).toFixed(2)}
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

            <Chip
              style={{
                backgroundColor: backgroundColor,
                borderWidth: 2,
                marginVertical: 5,
              }}
              mode="outlined" //changing display mode, default is flat.
              height={35} //give desirable height to chip
              textStyle={{
                fontSize: 14,
                color: 'black',
              }} //label properties
            >
              {props.category}
            </Chip>
          </View>

          <View
            style={{
              flexDirection: 'column',
              marginTop: 10,
              width: '40%',
              right: 10,
              position: 'absolute',
              alignSelf: 'center',
            }}>
            {!props.noDate && (
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
            )}

            {props.splitType == 'members' && (
              <AntDesign
                name="team"
                style={{
                  fontSize: 25,
                  textAlign: 'right',
                  color: 'gray',
                  opacity: 0.5,
                }}
              />
            )}
            {props.splitType == 'item' && (
              <AntDesign
                name="bars"
                style={{
                  fontSize: 25,
                  textAlign: 'right',
                  color: 'gray',
                  opacity: 0.5,
                }}
              />
            )}
            {props.splitType == 'percent' && (
              <Text
                style={{
                  fontSize: 25,
                  textAlign: 'right',
                  color: 'gray',
                  opacity: 0.5,
                }}>
                %
              </Text>
            )}

            <Avatar.Text
              style={[
                props.groupEmoji ? {borderRadius: 25} : {borderRadius: 50},
                {
                  backgroundColor: props.groupBackgroundColor,
                  marginVertical: 5,
                  alignSelf: 'center',
                  borderColor: 'black',
                },
              ]}
              size={!props.noDate ? 65 : 85}
              label={
                props.groupEmoji ||
                props.paidBy.toString().charAt('0').toUpperCase()
              }
              labelStyle={[
                !props.noDate && !props.groupEmoji
                  ? {fontSize: 30}
                  : {fontSize: 40},
              ]}
            />
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={[
                !props.noDate ? {fontSize: 15} : {fontSize: 18},
                {
                  textAlign: 'center',
                  color: colors.text,
                  fontWeight: 'normal',
                },
              ]}>
              {props.paidBy}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

export default Transactions;
