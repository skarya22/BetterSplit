import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LogBox,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  TextInput,
  Chip,
  Card,
  Divider,
  Subheading,
  DefaultTheme,
} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Slider from 'react-native-slider';
import firestore from '@react-native-firebase/firestore';

import {useTheme} from '@react-navigation/native';

import DateTimePicker from 'react-native-modal-datetime-picker';
LogBox.ignoreLogs(['VirtualizedList:']);
const QuickieDetails = ({route, navigation}) => {
  const theme = useTheme();
  const backgroundColor =
    DefaultTheme.categoryColors[
      DefaultTheme.categories.indexOf(route.params.category)
    ];
  const amount = route.params.price / route.params.numOfMembers;
  return (
    <>
      <Card
        style={{
          marginVertical: 10,
          marginHorizontal: 30,
          elevation: 3,
          backgroundColor: theme.colors.background,
          borderRadius: 15,
          flexDirection: 'row',

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
                color: theme.colors.text,
                fontWeight: 'bold',
                fontSize: 25,
              }}>
              {route.params.title}
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
              ${parseFloat(route.params.price).toFixed(2)}
            </Text>
            {route.params.people != null ? (
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{
                  color: theme.colors.text,
                  fontWeight: 'bold',
                  fontSize: 13,
                  marginBottom: 5,
                }}>
                {route.params.people}
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
              {route.params.category}
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
            {route.params.splitType == 'members' && (
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
            {route.params.splitType == 'item' && (
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
            {route.params.splitType == 'percent' && (
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
            <Text
              adjustsFontSizeToFit
              numberOfLines={1}
              style={{
                color: theme.colors.backdrop,
                fontWeight: 'bold',
                fontSize: 18,
                textAlign: 'center',
                marginBottom: 5,
                marginTop: 10,
              }}>
              {route.params.date.slice(4, route.params.date.length)}
            </Text>
          </View>
        </Card.Content>
      </Card>
      <Subheading style={{textAlign: 'center'}}>
        Because of this transaction:
      </Subheading>
      {route.params.splitType === 'members' && (
        <Text style={{color: theme.colors.text, left: 40, marginTop: 20}}>
          everyone pays ${amount}
        </Text>
      )}
    </>
  );
};
export default QuickieDetails;
