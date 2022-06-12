import React, {useState, useRef} from 'react';
import {View, FlatList, Text, TouchableOpacity, Alert} from 'react-native';
import {
  TextInput,
  Chip,
  Card,
  Title,
  Divider,
  FAB,
  DefaultTheme,
} from 'react-native-paper';

import {useTheme} from '@react-navigation/native';

const ItemSplitComponent = props => {
  const {
    items,
    setItems,
    transactionPrice,
    setTransactionPrice,
    total,
    setTotal,
    refreshFlatlist,
    setRefreshFlatList,
  } = props;
  // const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemMembers, setNewItemMembers] = useState([]);
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemTax, setNewItemTax] = useState('');
  //   const [refreshFlatlist, setRefreshFlatList] = useState(false);
  // const [transactionPrice, setTransactionPrice] = useState(route.params.price);
  // const [total, setTotal] = useState(0);
  const {colors} = useTheme();

  const flatlistRef = useRef();

  return (
    <FlatList
      ref={flatlistRef}
      extraData={refreshFlatlist}
      ListHeaderComponent={props.header}
      data={items}
      keyExtractor={item => item.key}
      renderItem={item => {
        let itemMembersLength = item.item.itemMembers.length;

        return (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              Alert.alert('Delete this item?', '', [
                {text: 'cancel'},
                {
                  text: 'confirm',
                  onPress: () => {
                    let oldItems = items;

                    setTotal(total - oldItems[item.index].itemPrice);
                    oldItems.splice(item.index, 1);
                    setItems(oldItems);
                    setRefreshFlatList(!refreshFlatlist);
                  },
                },
              ]);
            }}>
            <Card
              style={{
                marginVertical: 10,
                marginHorizontal: 30,
                backgroundColor: colors.card,
                elevation: 3,
                borderRadius: 15,
                flexDirection: 'row',
                paddingHorizontal: 15,
                alignSelf: 'center',
              }}>
              <Card.Content style={{flexDirection: 'row'}}>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={{
                    flex: 1,
                    fontSize: 30,
                    alignSelf: 'center',
                    fontWeight: 'bold',
                  }}>
                  Item #{item.index + 1}
                </Text>
                <View
                  style={{
                    alignItems: 'flex-end',
                    alignSelf: 'flex-end',
                    flex: 1,
                  }}>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={{
                      color: colors.text,
                      fontWeight: 'bold',
                      fontSize: 25,
                    }}>
                    {item.item.itemName}
                  </Text>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={{
                      color: '#7ed957',
                      fontSize: 55,
                      fontWeight: 'bold',
                    }}>
                    ${item.item.itemPrice}
                  </Text>
                  <Text
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={{
                      color: colors.text,
                      fontWeight: 'bold',
                      fontSize: 13,
                    }}>
                    {item.item.itemMembers.map((item, index) => {
                      if (index == 0) {
                        return 'Item is for: ' + item;
                      } else if (index === itemMembersLength - 1) {
                        return ' and ' + item;
                      } else if (index > 0) {
                        return ', ' + item;
                      }
                    })}
                  </Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={() => {
        return (
          <Title style={{alignSelf: 'center', marginVertical: 20}}>
            No Items
          </Title>
        );
      }}
      ListFooterComponent={
        <>
          <Card
            style={{
              marginVertical: 10,
              marginHorizontal: 30,
              elevation: 3,
              borderRadius: 15,
              flexDirection: 'row',
              paddingHorizontal: 15,
              alignSelf: 'center',
            }}>
            <Card.Content>
              <TextInput
                label="Item Name"
                value={newItemName}
                mode="outlined"
                onChangeText={newName => {
                  setNewItemName(newName);
                }}
                style={{height: 50, marginVertical: 5}}
              />
              <View style={{flexDirection: 'row', width: '100%'}}>
                <TextInput
                  label="Price"
                  style={{height: 50, marginVertical: 5, width: '65%'}}
                  value={newItemPrice}
                  mode="outlined"
                  onChangeText={newPrice => {
                    if (
                      newPrice.indexOf('.') == newPrice.lastIndexOf('.') &&
                      (newPrice.length - 1 <= 2 + newPrice.indexOf('.') ||
                        newPrice.indexOf('.') == -1) &&
                      newPrice.match(/^[0-9.]*$/)
                    ) {
                      setNewItemPrice(newPrice);
                    }
                  }}
                  keyboardType="number-pad"
                />
                <Text
                  style={{
                    textAlign: 'center',
                    alignSelf: 'center',
                    width: '5%',
                  }}>
                  +
                </Text>
                <TextInput
                  label="%Tax"
                  style={{
                    height: 50,
                    marginVertical: 5,
                    width: '30%',
                  }}
                  value={newItemTax}
                  mode="outlined"
                  onChangeText={newTax => {
                    if (
                      newTax.indexOf('.') == newTax.lastIndexOf('.') &&
                      (newTax.length - 1 <= 2 + newTax.indexOf('.') ||
                        newTax.indexOf('.') == -1) &&
                      newTax.match(/^[0-9.]*$/)
                    ) {
                      setNewItemTax(newTax);
                    }
                  }}
                  keyboardType="number-pad"
                />
              </View>
              <View
                style={{
                  margin: 5,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                {props.memberNames.map((item, index) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        if (newItemMembers.includes(item)) {
                          setNewItemMembers(
                            newItemMembers.filter(member => member != item),
                          );
                        } else {
                          setNewItemMembers([...newItemMembers, item]);
                        }
                      }}>
                      <Chip
                        mode="outlined" //changing display mode, default is flat.
                        height={30} //give desirable height to chip
                        textStyle={{
                          color: colors.text,
                          fontSize: 15,
                        }} //label properties
                        style={[
                          newItemMembers.includes(item)
                            ? {borderColor: colors.text, borderWidth: 2}
                            : null,
                          {alignItems: 'center', margin: 5},
                        ]}>
                        {item}
                      </Chip>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (newItemMembers.length == 0) {
                    Alert.alert(
                      'Cannot submit an item without selecting a member',
                    );
                  } else if (!newItemPrice) {
                    Alert.alert('Cannot submit an item without a price');
                  } else {
                    flatlistRef.current.scrollToEnd({animated: true});
                    setNewItemName('');
                    setNewItemMembers([]);

                    let itemMembersIDs = [];
                    newItemMembers.forEach(member => {
                      itemMembersIDs.push(
                        props.memberRefs[props.memberNames.indexOf(member)],
                      );
                    });

                    let price;
                    if (newItemTax > 0) {
                      price =
                        parseFloat(newItemPrice) +
                        (newItemPrice * newItemTax) / 100;
                    } else {
                      price = newItemPrice;
                    }
                    setNewItemPrice('');
                    setNewItemTax('');
                    let newTotal = (
                      parseFloat(total) + parseFloat(price)
                    ).toFixed(2);

                    if (newTotal > parseFloat(transactionPrice)) {
                      Alert.alert(
                        'Total of items is greater than transaction price.',
                        'Raise transaction price to match?',
                        [
                          {text: 'Cancel'},
                          {
                            text: 'Raise Price',
                            onPress: () => {
                              setTransactionPrice(newTotal);
                              setTotal(newTotal);
                              setItems([
                                ...items,
                                {
                                  itemName: newItemName,
                                  itemPrice: parseFloat(price).toFixed(2),
                                  itemMembers: newItemMembers,
                                  itemMembersIDs,
                                  key:
                                    newItemName + newItemPrice + itemMembersIDs,
                                },
                              ]);
                            },
                          },
                        ],
                      );
                    } else {
                      setTotal(newTotal);
                      setItems([
                        ...items,
                        {
                          itemName: newItemName,
                          itemPrice: parseFloat(price).toFixed(2),
                          itemMembers: newItemMembers,
                          itemMembersIDs,
                          key: newItemName + newItemPrice + itemMembersIDs,
                        },
                      ]);
                    }
                  }
                }}
                style={{alignSelf: 'center', marginVertical: 10}}>
                <Chip
                  mode="flat"
                  textStyle={[
                    {
                      color: colors.primary,
                      fontSize: 15,

                      textAlign: 'center',
                    },
                  ]}>
                  SUBMIT NEW ITEM
                </Chip>
              </TouchableOpacity>
            </Card.Content>
          </Card>
          <Card
            style={{
              marginTop: 10,
              marginHorizontal: 30,
              elevation: 3,
              borderRadius: 15,
              flexDirection: 'row',
              paddingHorizontal: 15,
              alignSelf: 'center',
            }}>
            <Card.Content>
              <Title style={{textAlign: 'center'}}>
                Current total: ${total} / ${transactionPrice}
              </Title>
            </Card.Content>
          </Card>
          {props.footer && props.footer()}
        </>
      }
    />
  );
};

export default ItemSplitComponent;
