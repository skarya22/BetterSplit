import {useTheme} from '@react-navigation/native';
import React from 'react';
import {FlatList, View, Text, TouchableOpacity} from 'react-native';
import {Subheading} from 'react-native-paper';
import OwingDetails from '../../components/OwingDetails';
import Transactions from '../../components/Transactions';

const TransactionDetailsScreen = ({navigation, route}) => {
  const {colors} = useTheme();

  return (
    <View>
      <FlatList
        ListHeaderComponent={() => {
          return (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => {
                  navigation.push('EditTransaction', {...route.params});
                }}>
                <Transactions
                  title={route.params.title}
                  price={route.params.price}
                  paidBy={route.params.paidBy}
                  date={route.params.date}
                  people={route.params.membersIncludedAsString}
                  category={route.params.category}
                  groupBackgroundColor={route.params.groupBackgroundColor}
                  noDate={true}
                  splitType={route.params.splitType}
                />
              </TouchableOpacity>
              <Subheading style={{textAlign: 'center'}}>
                Because of this transaction:
              </Subheading>
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
            </>
          );
        }}
        data={route.params.owings}
        renderItem={item => {
          if (item.item != 0) {
            return (
              <OwingDetails
                owed={route.params.paidBy}
                noDate={true}
                userName={route.params.userName}
                amount={item.item}
                owes={route.params.membersIncludedNames[item.index]}
              />
            );
          }
        }}
      />
    </View>
  );
};

export default TransactionDetailsScreen;
