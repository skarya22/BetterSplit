import React, {useState, useRef} from 'react';
import {View, FlatList, TouchableOpacity, Button} from 'react-native';
import {TextInput, Chip, Title, FAB, DefaultTheme} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useTheme} from '@react-navigation/native';
import DateTimePicker from 'react-native-modal-datetime-picker';
const RecordPayment = ({route, navigation}) => {
  const [paymentFrom, setPaymentFrom] = useState(0);
  const [paymentTo, setPaymentTo] = useState(1);
  const [paymentAmount, setPaymentAmount] = useState('');
  const theme = useTheme();
  let paymentFromListRef = React.createRef();
  let paymentToListRef = React.createRef();

  const [date, setDate] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);
  return (
    <>
      <Title style={{marginTop: 20, marginLeft: 20, marginBottom: 10}}>
        Payment From:
      </Title>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            alignSelf: 'center',
            marginLeft: 25,
            marginRight: 5,
          }}
          onPress={() => {
            if (paymentFrom > 0) {
              setPaymentFrom(paymentFrom - 1);
              paymentFromListRef.scrollToIndex({index: paymentFrom - 1});
            } else {
              paymentFromListRef.scrollToIndex({
                index: route.params.memberNames.length - 1,
              });
              setPaymentFrom(route.params.memberNames.length - 1);
            }
          }}>
          <AntDesign name="left" size={15} style={{color: theme.colors.text}} />
        </TouchableOpacity>
        <FlatList
          data={route.params.memberNames}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ref={ref => (paymentFromListRef = ref)}
          renderItem={item => {
            return (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  setPaymentFrom(item.index);
                }}>
                <Chip
                  style={[
                    item.item == route.params.memberNames[paymentFrom]
                      ? {
                          borderWidth: 2,
                          borderColor: theme.colors.text,
                          backgroundColor: theme.colors.card,
                        }
                      : {borderWidth: 0},
                    {
                      marginHorizontal: 5,
                      marginBottom: 2,
                      shadowOpacity: 0.2,
                      elevation: 3,
                      shadowRadius: 2,
                      shadowOffset: {width: 2, height: 2},
                    },
                  ]}
                  mode="outlined" //changing display mode, default is flat.
                  height={35} //give desirable height to chip
                  textStyle={{fontSize: 15}} //label properties
                >
                  {item.item}
                </Chip>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity
          style={{
            alignSelf: 'center',
            marginRight: 25,
            marginLeft: 5,
          }}
          onPress={() => {
            if (paymentFrom < route.params.memberNames.length - 1) {
              setPaymentFrom(paymentFrom + 1);
              paymentFromListRef.scrollToIndex({index: paymentFrom + 1});
            } else {
              paymentFromListRef.scrollToIndex({index: 0});
              setPaymentFrom(0);
            }
          }}>
          <AntDesign
            name="right"
            size={15}
            style={{color: theme.colors.text}}
          />
        </TouchableOpacity>
      </View>

      <Title style={{marginTop: 20, marginLeft: 20, marginBottom: 10}}>
        Payment To:
      </Title>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            alignSelf: 'center',
            marginLeft: 25,
            marginRight: 5,
          }}
          onPress={() => {
            if (paymentTo > 0) {
              setPaymentTo(paymentTo - 1);
              paymentToListRef.scrollToIndex({index: paymentTo - 1});
            } else {
              paymentToListRef.scrollToIndex({
                index: route.params.memberNames.length - 1,
              });
              setPaymentTo(route.params.memberNames.length - 1);
            }
          }}>
          <AntDesign name="left" size={15} style={{color: theme.colors.text}} />
        </TouchableOpacity>
        <FlatList
          data={route.params.memberNames}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ref={ref => (paymentToListRef = ref)}
          renderItem={item => {
            return (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  setPaymentTo(item.index);
                }}>
                <Chip
                  style={[
                    item.item == route.params.memberNames[paymentTo]
                      ? {
                          borderWidth: 2,
                          borderColor: theme.colors.text,
                          backgroundColor: theme.colors.card,
                        }
                      : {borderWidth: 0},
                    {
                      marginHorizontal: 5,
                      marginBottom: 2,
                      shadowOpacity: 0.2,
                      elevation: 3,
                      shadowRadius: 2,
                      shadowOffset: {width: 2, height: 2},
                    },
                  ]}
                  mode="outlined" //changing display mode, default is flat.
                  height={35} //give desirable height to chip
                  textStyle={{fontSize: 15}} //label properties
                >
                  {item.item}
                </Chip>
              </TouchableOpacity>
            );
          }}
        />

        <TouchableOpacity
          style={{
            alignSelf: 'center',
            marginRight: 25,
            marginLeft: 5,
          }}
          onPress={() => {
            if (paymentTo < route.params.memberNames.length - 1) {
              setPaymentTo(paymentTo + 1);
              paymentToListRef.scrollToIndex({index: paymentTo + 1});
            } else {
              paymentToListRef.scrollToIndex({index: 0});
              setPaymentTo(0);
            }
          }}>
          <AntDesign
            name="right"
            size={15}
            style={{color: theme.colors.text}}
          />
        </TouchableOpacity>
      </View>

      <TextInput
        mode="outlined"
        label="Payment Amount"
        value={paymentAmount}
        keyboardType="number-pad"
        onChangeText={newPaymentAmount => {
          if (
            newPaymentAmount.indexOf('.') ==
              newPaymentAmount.lastIndexOf('.') &&
            (newPaymentAmount.length - 1 <= 2 + newPaymentAmount.indexOf('.') ||
              newPaymentAmount.indexOf('.') == -1) &&
            newPaymentAmount.match(/^[0-9.]*$/)
          ) {
            setPaymentAmount(newPaymentAmount);
          }
        }}
        onSubmitEditing={() => {
          setDateModalVisible(true);
        }}
        style={{
          height: 50,
          paddingHorizontal: 10,
          width: '85%',
          alignSelf: 'center',
          fontSize: 20,
          marginTop: 20,
        }}
      />

      <TouchableOpacity
        onPress={() => {
          setDateModalVisible(true);
        }}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label="Date"
            value={date.toDateString()}
            style={{
              height: 50,
              paddingHorizontal: 10,
              width: '85%',
              alignSelf: 'center',
              fontSize: 20,
              marginTop: 20,
              zindex: -1,
            }}
            editable={false}
          />
        </View>
      </TouchableOpacity>
      <DateTimePicker
        value={date}
        isVisible={dateModalVisible}
        onConfirm={newDate => {
          setDate(newDate);
          setDateModalVisible(false);
        }}
        onCancel={() => {
          setDateModalVisible(false);
        }}
      />

      <FAB
        label="Submit Payment Record"
        style={{
          borderRadius: 20,
          bottom: '10%',
          position: 'absolute',
          alignSelf: 'center',
          backgroundColor: route.params.groupBackgroundColor,
        }}
        labelStyle={{fontSize: 17}}
        onPress={() => {
          firestore()
            .collection('groups')
            .doc(route.params.groupID)
            .collection('payments')
            .add({
              paymentTo: route.params.memberRefs[paymentTo],
              paymentFrom: route.params.memberRefs[paymentFrom],
              paymentAmount,
              date: date,
            });

          DefaultTheme.refreshGroupDetails();
          navigation.pop();
        }}>
        Record Payment
      </FAB>
    </>
  );
};

export default RecordPayment;
