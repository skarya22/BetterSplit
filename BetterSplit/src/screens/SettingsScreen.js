import React, {useState} from 'react';
import {View, TouchableOpacity, Alert} from 'react-native';
import {
  Button,
  Title,
  TextInput,
  DefaultTheme,
  Modal,
  Portal,
  Card,
} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';

import AntDesign from 'react-native-vector-icons/AntDesign';

import auth from '@react-native-firebase/auth';

import {PickerIOS, Picker} from '@react-native-picker/picker';
import {useTheme} from '@react-navigation/native';

const SettingsScreen = ({navigation, route}) => {
  const [userName, setUserName] = useState(route.params.userName);
  const [resetDate, setResetDate] = useState(DefaultTheme.resetDate);
  const [tempResetDate, setTempResetDate] = useState(DefaultTheme.resetDate);
  const [pickerVisible, setPickerVisible] = useState(false);
  const dateOptions = [...Array(31).keys()].map(i => {
    return <Picker.Item label={(i + 1).toString()} value={i + 1} key={i + 1} />;
  });

  const changeUserName = () => {
    firestore()
      .collection('users')
      .doc(route.params.userID)
      .update({Name: userName});

    Alert.alert('Changes will take effect on app restart ', '', [
      {text: 'close'},
      {
        text: 'restart now',
        onPress: () => {
          DefaultTheme.refresh();
        },
      },
    ]);
  };
  const changeResetDate = () => {
    firestore()
      .collection('users')
      .doc(route.params.userID)
      .update({resetDate: tempResetDate});

    Alert.alert('Changes will take effect on app restart ', '', [
      {text: 'close'},
      {
        text: 'restart now',
        onPress: () => {
          DefaultTheme.refresh();
        },
      },
    ]);
  };

  return (
    <>
      <Title>Change Name</Title>
      <View style={{flexDirection: 'row'}}>
        <TextInput
          value={userName}
          onChangeText={newUserName => {
            setUserName(newUserName);
          }}
          style={{flex: 1, marginLeft: 20, height: 40}}
          mode="outlined"
          onSubmitEditing={changeUserName}
          autoCapitalize="words"
        />
        <TouchableOpacity
          onPress={changeUserName}
          style={{alignSelf: 'center', marginRight: 20, marginLeft: 10}}>
          <AntDesign name="arrowright" size={30} />
        </TouchableOpacity>
      </View>
      <Button
        onPress={() => {
          navigation.push('AccountConnect', {isFirstLaunch: false});
        }}>
        Go to Account Sync Settings
      </Button>
      <Title>Spending Graph Reset Cycle Date</Title>
      <View style={{flexDirection: 'row'}}>
        <Title style={{marginLeft: '5%'}}>{resetDate}</Title>
        <Button
          onPress={() => {
            setPickerVisible(true);
          }}>
          <AntDesign name="swap" size={20} />
        </Button>
      </View>
      <Portal>
        <Modal visible={pickerVisible} dismissable={false}>
          <Card
            style={{
              margin: 20,
              borderRadius: 20,
              elevation: 3,
            }}>
            <Card.Content>
              <Picker
                selectedValue={tempResetDate}
                onValueChange={value => {
                  setTempResetDate(value);
                }}>
                {dateOptions.map(date => {
                  return date;
                })}
              </Picker>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <Button
                  onPress={() => {
                    setPickerVisible(false);
                  }}>
                  Cancel
                </Button>
                <Button
                  onPress={() => {
                    setPickerVisible(false);
                    changeResetDate();
                  }}>
                  Submit
                </Button>
              </View>
            </Card.Content>
          </Card>
        </Modal>
      </Portal>

      {/* <Modal
        animationType="fade"
        visible={pickerVisible}
        transparent={true}
        onRequestClose={() => {
          // setPickerVisible(false);
        }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            justifyContent: 'center',
            alignContent: 'center',
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPressOut={() => {
            setPickerVisible(false);
          }}>
          <TouchableOpacity
            activeOpacity={1}
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              marginHorizontal: '10%',
            }}>
            <PickerIOS
              selectedValue={tempResetDate}
              onValueChange={value => {
                setTempResetDate(value);
              }}>
              {dateOptions.map(date => {
                return date;
              })}
            </PickerIOS>
            <Button
              onPress={() => {
                setPickerVisible(false);
                changeResetDate();
              }}>
              Submit
            </Button>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal> */}

      <Button
        mode="contained"
        onPress={() => {
          auth().signOut();
          DefaultTheme.setUserExists(false);
        }}>
        Sign Out
      </Button>
    </>
  );
};

export default SettingsScreen;
