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
  Title,
  Divider,
  HelperText,
  DefaultTheme,
} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Slider from 'react-native-slider';
import firestore from '@react-native-firebase/firestore';

import {useTheme} from '@react-navigation/native';

import DateTimePicker from 'react-native-modal-datetime-picker';
import QuickieDetails from './QuickieDetails';

LogBox.ignoreLogs(['VirtualizedList:']);
const QuickTransaction = ({route, navigation}) => {
  const [title, setTitle] = useState('');
  const [paidBy, setPaidBy] = useState(0);
  const [price, setPrice] = useState('');
  const [titleErrorOpacity, setTitleErrorOpacity] = useState(0);
  const [priceErrorOpacity, setPriceErrorOpacity] = useState(0);
  const [numOfMembers, setNumOfMembers] = useState(1);

  const theme = useTheme();

  var customStyles3 = StyleSheet.create({
    track: {
      height: 10,
      borderRadius: 5,
      backgroundColor: '#d0d0d0',
    },

    thumb: {
      width: 10,
      height: 30,
      borderRadius: 5,
      backgroundColor: theme.colors.accent,
    },
  });

  const checkingMandatories = () => {
    if (title.length < 1) {
      setTitleErrorOpacity(1);
      titleInputRef.focus();
    }
    if (price.length < 1) {
      setPriceErrorOpacity(1);
      if (title.length > 0) priceInputRef.focus();
    }
    if (price.length < 1 || title.length < 1) {
      return true;
    } else {
      return false;
    }
  };

  let categoryListRef = React.createRef();
  let titleInputRef = React.createRef();
  let paidByListRef = React.createRef();
  let priceInputRef = React.createRef();
  const [date, setDate] = useState(new Date());
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const [category, setCategory] = useState(6);

  return (
    <KeyboardAwareScrollView style={{flex: 1}}>
      <Title style={{marginTop: 20, marginLeft: 20, marginBottom: 10}}>
        Enter Transaction Details:
      </Title>
      <TextInput
        mode="outlined"
        label="Title"
        value={title}
        ref={ref => (titleInputRef = ref)}
        onChangeText={newTitle => {
          setTitleErrorOpacity(0);
          setTitle(newTitle);
        }}
        style={styles.input}
        onSubmitEditing={() => {
          priceInputRef.focus();
        }}
        returnKeyType="next"
      />
      <HelperText
        style={[
          {color: 'red', textAlign: 'center', opacity: titleErrorOpacity},
        ]}>
        Please enter a title for your transaction
      </HelperText>
      <TextInput
        mode="outlined"
        label="Price"
        value={price}
        keyboardType="number-pad"
        onChangeText={newPrice => {
          setPriceErrorOpacity(0);
          if (
            newPrice.indexOf('.') == newPrice.lastIndexOf('.') &&
            (newPrice.length - 1 <= 2 + newPrice.indexOf('.') ||
              newPrice.indexOf('.') == -1) &&
            newPrice.match(/^[0-9.]*$/)
          ) {
            setPrice(newPrice);
          }
        }}
        style={styles.input}
        ref={ref => (priceInputRef = ref)}
        returnKeyType="done"
        onSubmitEditing={() => {
          setDateModalVisible(true);
        }}
        returnKeyLabel="next"
      />
      <HelperText
        style={[
          {color: 'red', textAlign: 'center', opacity: priceErrorOpacity},
        ]}>
        Please enter a price for your transaction
      </HelperText>

      <TouchableOpacity
        onPress={() => {
          setDateModalVisible(true);
        }}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label="Date"
            value={date.toDateString()}
            style={[styles.input, {zIndex: -1}]}
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
      <View
        style={{
          flexDirection: 'row',
          marginTop: 15,
          marginLeft: 20,
          marginBottom: 10,
        }}>
        <Title>Number of People Involved</Title>
        <Title style={{textAlign: 'right', marginRight: 40, flex: 1}}>
          {numOfMembers}
        </Title>
      </View>
      <Slider
        maximumValue={20}
        minimumValue={1}
        minimumTrackTintColor={theme.colors.accent}
        trackStyle={customStyles3.track}
        thumbStyle={customStyles3.thumb}
        style={{
          marginHorizontal: 30,
        }}
        step={1}
        value={numOfMembers}
        onValueChange={newNum => {
          setNumOfMembers(newNum);
        }}
      />

      <Title style={{marginTop: 15, marginLeft: 20, marginBottom: 10}}>
        Category:
      </Title>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            alignSelf: 'center',
            marginLeft: 25,
            marginRight: 5,
          }}
          onPress={() => {
            if (category > 0) {
              setCategory(category - 1);
              categoryListRef.scrollToIndex({index: category - 1});
            } else {
              categoryListRef.scrollToIndex({index: 6});
              setCategory(6);
            }
          }}>
          <AntDesign name="left" size={15} />
        </TouchableOpacity>
        <FlatList
          data={DefaultTheme.categories}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ref={ref => (categoryListRef = ref)}
          renderItem={item => {
            return (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  setCategory(item.index);
                }}>
                <Chip
                  style={[
                    item.item == DefaultTheme.categories[category]
                      ? {borderWidth: 2, borderColor: theme.colors.text}
                      : {borderWidth: 0},
                    {
                      marginHorizontal: 5,
                      marginBottom: 2,
                      backgroundColor: DefaultTheme.categoryColors[item.index],
                      shadowOpacity: 0.2,
                      shadowRadius: 2,
                      elevation: 3,
                      shadowOffset: {width: 2, height: 2},
                    },
                  ]}
                  mode="outlined" //changing display mode, default is flat.
                  height={35} //give desirable height to chip
                  textStyle={{fontSize: 15, color: 'black'}} //label properties
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
            if (category < 6) {
              setCategory(category + 1);
              categoryListRef.scrollToIndex({index: category + 1});
            } else {
              categoryListRef.scrollToIndex({index: 0});
              setCategory(0);
            }
          }}>
          <AntDesign name="right" size={15} />
        </TouchableOpacity>
      </View>
      <Divider
        style={{
          marginTop: 20,
          marginBottom: 10,
          backgroundColor: 'lightgray',
          width: '85%',
          margin: 5,
          height: 2,
          alignSelf: 'center',
        }}
      />
      <Title style={{marginLeft: 20, marginBottom: 10}}>Split Bill:</Title>
      <View style={{flexDirection: 'column', marginBottom: 20}}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonBackground}
            onPress={() => {
              if (!checkingMandatories()) {
                const docRef = firestore()
                  .collection('users')
                  .doc(route.params.userID)
                  .collection('quickies')
                  .doc();
                const details = {
                  title,
                  date,
                  category: DefaultTheme.categories[category],
                  price,
                  splitType: 'members',
                  numOfMembers,
                };
                docRef.set(details);
                navigation.push('QuickieDetails', {
                  ...details,
                  date: date.toDateString(),
                });
              }
            }}>
            <View style={styles.buttonViewBackground}>
              <AntDesign
                name="team"
                style={[styles.icon, {color: theme.colors.text}]}
              />
              <Text style={[styles.buttonText, {color: theme.colors.text}]}>
                equally
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.buttonBackground}
            onPress={() => {
              if (!checkingMandatories()) {
                let memberNames = [];
                for (let i = 0; i < numOfMembers; i++) {
                  memberNames.push('person #' + (i + 1));
                }
                navigation.push('PercentSplit', {
                  title,
                  date,
                  category: DefaultTheme.categories[category],
                  paidBy: 'Person 1',
                  price: price,
                  // groupID: route.params.groupID,
                  // groupName: route.params.groupName,
                  memberNames,
                  userID: route.params.userID,
                  // memberRefs: route.params.memberRefs,
                  groupBackgroundColor: theme.colors.accent,
                });
              }
            }}>
            <View style={styles.buttonViewBackground}>
              <Text
                style={{
                  color: theme.colors.text,
                  fontSize: 25,
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                %
              </Text>
              <Text style={[styles.buttonText, {color: theme.colors.text}]}>
                by percent
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    fontSize: 30,
    textAlign: 'center',
  },
  buttonViewBackground: {
    width: '90%',
    alignSelf: 'center',
  },
  buttonBackground: {
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    borderRadius: 20,
    width: '30%',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: {width: 2, height: 2},
  },
  buttonText: {
    textAlign: 'center',
  },
  input: {
    height: 50,
    paddingHorizontal: 10,
    width: '85%',
    alignSelf: 'center',
    fontSize: 20,
  },
});

export default QuickTransaction;
