import React, {useState} from 'react';
import {TouchableOpacity, Alert} from 'react-native';
import {Divider, FAB, DefaultTheme} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

import Transactions from '../../components/Transactions';
import ItemSplitComponent from '../../components/ItemSplitComponent';

const ItemSplitScreen = ({route, navigation}) => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [transactionPrice, setTransactionPrice] = useState(
    parseFloat(route.params.price).toFixed(2),
  );
  const [refreshFlatlist, setRefreshFlatList] = useState(false);

  const header = () => {
    return (
      <>
        <Transactions
          paidBy={route.params.paidBy}
          title={route.params.title}
          price={transactionPrice}
          category={route.params.category}
          date={route.params.date}
        />
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
      </>
    );
  };

  const footer = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (total == 0) {
            Alert.alert('Total of items cannot be 0.');
          } else if (parseFloat(total) != parseFloat(transactionPrice)) {
            Alert.alert(
              'Total of items is less than transaction price.',
              'Lower transaction price to match?',
              [
                {text: 'Cancel'},
                {
                  text: 'Lower',
                  onPress: () => {
                    setTransactionPrice(total);
                    submitTransaction(total);
                  },
                },
                {
                  text: 'Split Rest Evenly',
                  onPress: () => {
                    setTotal(transactionPrice);
                    setItems([
                      ...items,
                      {
                        itemName: 'Split rest evenly',
                        itemPrice: parseFloat(transactionPrice - total).toFixed(
                          2,
                        ),
                        itemMembers: route.params.memberNames,
                        itemMembersIDs: route.params.memberRefs,
                        key: 'Split rest evenly' + items.length,
                      },
                    ]);
                  },
                },
              ],
            );
          } else {
            submitTransaction();
          }
        }}
        activeOpacity={0.9}
        style={{marginVertical: 20, alignSelf: 'center'}}>
        <FAB
          label="Submit Transaction"
          style={{
            borderRadius: 20,

            backgroundColor: route.params.groupBackgroundColor,
          }}
          labelStyle={{fontSize: 17}}>
          Submit Transaction
        </FAB>
      </TouchableOpacity>
    );
  };

  const submitTransaction = price => {
    if (!price) price = transactionPrice;
    let paidByID =
      route.params.memberRefs[
        route.params.memberNames.indexOf(route.params.paidBy)
      ];

    firestore()
      .collection('groups')
      .doc(route.params.groupID)
      .update({lastModified: firestore.Timestamp.now()});
    DefaultTheme.refreshHome();
    firestore()
      .collection('groups')
      .doc(route.params.groupID)
      .collection('transactions')
      .add({
        title: route.params.title,
        date: new Date(route.params.date),
        category: route.params.category,
        paidBy: paidByID,
        price: price,
        splitType: 'item',
      })
      .then(docRef => {
        let owings = {};
        let membersIncluded = [];
        items.forEach(item => {
          let incrementAmount = parseFloat(
            item.itemPrice / item.itemMembers.length,
          );
          item.itemMembers.forEach(memberName => {
            let memberRef =
              route.params.memberRefs[
                route.params.memberNames.indexOf(memberName)
              ];
            if (owings[memberRef]) {
              owings[memberRef] += incrementAmount;
            } else {
              owings[memberRef] = incrementAmount;
            }
            if (!membersIncluded.includes(memberRef)) {
              membersIncluded.push(memberRef);
            }
          });

          docRef.collection('items').add(item);

          if (items.indexOf(item) == items.length - 1) {
            docRef.update({owings: owings, membersIncluded});
            DefaultTheme.refreshGroupDetails();
            navigation.pop(2);
          }
        });
      });
  };

  return (
    <ItemSplitComponent
      header={header}
      memberNames={route.params.memberNames}
      paidBy={route.params.paidBy}
      memberRefs={route.params.memberRefs}
      groupBackgroundColor={route.params.groupBackgroundColor}
      total={total}
      setTotal={setTotal}
      transactionPrice={transactionPrice}
      setTransactionPrice={setTransactionPrice}
      items={items}
      setItems={setItems}
      refreshFlatlist={refreshFlatlist}
      setRefreshFlatList={setRefreshFlatList}
      footer={footer}
    />
  );
};

export default ItemSplitScreen;
