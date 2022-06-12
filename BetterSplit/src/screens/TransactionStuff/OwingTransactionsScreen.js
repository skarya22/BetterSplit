import {useTheme} from '@react-navigation/native';
import React from 'react';
import {FlatList, View, TouchableOpacity} from 'react-native';
import {Divider, Text} from 'react-native-paper';
import OwingDetails from '../../components/OwingDetails';
import Transactions from '../../components/Transactions';

const OwingTransactionsScreen = ({navigation, route}) => {
  const {colors} = useTheme();
  return (
    <View>
      <FlatList
        style={{height: '100%'}}
        ListHeaderComponent={() => {
          return (
            <>
              <View
                style={{
                  marginHorizontal: 20,
                  flexDirection: 'row',
                  height: 30,
                  top: 10,
                }}>
                <Text
                  style={{
                    position: 'absolute',
                    left: 50,
                    fontWeight: 'bold',
                    color: colors.text,
                  }}>
                  Owes
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    position: 'absolute',
                    right: 50,
                    fontWeight: 'bold',
                  }}>
                  Owed
                </Text>
              </View>
              <OwingDetails
                userName={route.params.userName}
                owes={route.params.owes}
                owed={route.params.owed}
                amount={route.params.amount}
                groupBackgroundColor={route.params.groupBackgroundColor}
              />
              <Divider
                style={{height: 2, marginHorizontal: '20%', marginVertical: 20}}
              />
            </>
          );
        }}
        initialNumToRender={10}
        ListFooterComponent={() => {
          return (
            <View
              style={{
                height: 100,
              }}></View>
          );
        }}
        data={route.params.transactions}
        renderItem={item => {
          const typeOfCard = item.item.typeOfCard;

          return (
            <View style={{width: '100%'}}>
              {item.index == 0 ||
              (item.index > 0 &&
                route.params.transactions[item.index - 1].date !=
                  item.item.date) ? (
                <Text
                  style={{
                    textAlign: 'center',
                    alignSelf: 'center',
                    color: colors.text,
                  }}>
                  {item.item.date == new Date().toDateString()
                    ? 'Today'
                    : item.item.date}
                </Text>
              ) : null}

              {typeOfCard == 'payment' ? (
                <View>
                  <OwingDetails
                    userName={route.params.userName}
                    owes={item.item.paymentFrom}
                    owed={item.item.paymentTo}
                    amount={parseFloat(item.item.paymentAmount).toFixed(2)}
                    groupBackgroundColor={route.params.groupBackgroundColor}
                    date={item.item.date}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => {
                    navigation.push('TransactionDetails', {
                      ...route.params,
                      ...item.item,
                    });
                  }}>
                  <Transactions
                    title={item.item.title}
                    price={item.item.price}
                    paidBy={item.item.paidBy}
                    date={item.item.date}
                    people={item.item.membersIncludedAsString}
                    category={item.item.category}
                    groupBackgroundColor={route.params.groupBackgroundColor}
                    noDate={true}
                    splitType={item.item.splitType}
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </View>
  );
};

export default OwingTransactionsScreen;
