import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  LogBox,
} from 'react-native';
import {
  TextInput,
  Chip,
  Title,
  HelperText,
  DefaultTheme,
} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';

import {useTheme} from '@react-navigation/native';

import DateTimePicker from 'react-native-modal-datetime-picker';
LogBox.ignoreLogs(['VirtualizedList:']);
const EditTransactionTopPart = props => {
  const {
    title,
    setTitle,
    price,
    setPrice,
    paidBy,
    setPaidBy,
    category,
    setCategory,
    date,
    setDate,
    memberNames,
  } = props;

  const [titleErrorOpacity, setTitleErrorOpacity] = useState(0);
  const [priceErrorOpacity, setPriceErrorOpacity] = useState(0);

  const theme = useTheme();

  let categoryListRef = React.createRef();
  let titleInputRef = React.createRef();
  let paidByListRef = React.createRef();
  let priceInputRef = React.createRef();

  const [dateModalVisible, setDateModalVisible] = useState(false);

  return (
    <View>
      <Title style={{marginTop: 10, marginLeft: 20, marginBottom: 10}}>
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
        value={price.toString()}
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

      <Title style={{marginLeft: 20, marginTop: 10, marginBottom: 10}}>
        Paid By:
      </Title>
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={{
            alignSelf: 'center',
            marginLeft: 25,
            marginRight: 5,
          }}
          onPress={() => {
            if (paidBy > 0) {
              setPaidBy(paidBy - 1);
              paidByListRef.scrollToIndex({index: paidBy - 1});
            } else {
              paidByListRef.scrollToIndex({
                index: memberNames.length - 1,
              });
              setPaidBy(memberNames.length - 1);
            }
          }}>
          <AntDesign name="left" size={15} style={{color: theme.colors.text}} />
        </TouchableOpacity>
        <FlatList
          data={memberNames}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          ref={ref => (paidByListRef = ref)}
          renderItem={item => {
            return (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => {
                  setPaidBy(item.index);
                }}>
                <Chip
                  style={[
                    item.item == memberNames[paidBy]
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
            if (paidBy < props.memberNames.length - 1) {
              setPaidBy(paidBy + 1);
              paidByListRef.scrollToIndex({index: paidBy + 1});
            } else {
              paidByListRef.scrollToIndex({index: 0});
              setPaidBy(0);
            }
          }}>
          <AntDesign
            name="right"
            size={15}
            style={{color: theme.colors.text}}
          />
        </TouchableOpacity>
      </View>
      <Title style={{marginTop: 10, marginLeft: 20, marginBottom: 10}}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 50,
    paddingHorizontal: 10,
    width: '85%',
    alignSelf: 'center',
    fontSize: 20,
  },
});

export default EditTransactionTopPart;
