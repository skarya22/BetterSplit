import React, {useState} from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TouchableOpacity, Alert} from 'react-native';

import {DefaultTheme, Text, FAB} from 'react-native-paper';
import EditTransactionTopPart from '../../components/EditTransactionTopPart';
import ItemSplitComponent from '../../components/ItemSplitComponent';
import MembersSplitComponent from '../../components/MembersSplitComponent';
import PercentSplitComponent from '../../components/PercentSplitComponent';
import firestore from '@react-native-firebase/firestore';
import {useEffect} from 'react';

const EditTransaction = ({route, navigation}) => {
  let memberNames = route.params.memberNames.filter(
    item => item !== route.params.userName,
  );
  memberNames.unshift(route.params.userName);
  const [title, setTitle] = useState(route.params.title);
  const [price, setPrice] = useState(route.params.price);
  const [date, setDate] = useState(new Date(route.params.date));
  const [paidBy, setPaidBy] = useState(
    memberNames.indexOf(route.params.paidBy),
  );
  const [category, setCategory] = useState(
    DefaultTheme.categories.indexOf(route.params.category),
  );

  if (route.params.splitType == 'members') {
    const selectableMembers = route.params.memberNames;
    const [selectedMembers, setSelectedMembers] = useState(
      route.params.membersIncludedNames,
    );
    return (
      <KeyboardAwareScrollView style={{flex: 1}}>
        <EditTransactionTopPart
          memberNames={route.params.memberNames}
          userName={route.params.userName}
          title={title}
          setTitle={setTitle}
          price={price}
          setPrice={setPrice}
          date={date}
          setDate={setDate}
          paidBy={paidBy}
          setPaidBy={setPaidBy}
          category={category}
          setCategory={setCategory}
          memberNames={memberNames}
        />

        <MembersSplitComponent
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          selectableMembers={selectableMembers}
          {...route.params}
          groupBackgroundColor={route.params.groupBackgroundColor}
        />
      </KeyboardAwareScrollView>
    );
  } else if (route.params.splitType == 'percent') {
    let tempPercentages = [];
    for (let i = 0; i < route.params.memberRefs.length; i++) {
      if (route.params.memberPercentages[route.params.memberRefs[i]]) {
        tempPercentages[i] =
          route.params.memberPercentages[route.params.memberRefs[i]];
      } else {
        tempPercentages[i] = 0;
      }
    }

    const [memberPercentages, setMemberPercentages] = useState(tempPercentages);

    const [total, setTotal] = useState(100);
    const [errorOpacity, setErrorOpacity] = useState(0);
    const header = (
      <EditTransactionTopPart
        memberNames={route.params.memberNames}
        userName={route.params.userName}
        title={title}
        setTitle={setTitle}
        price={price}
        setPrice={setPrice}
        date={date}
        setDate={setDate}
        paidBy={paidBy}
        setPaidBy={setPaidBy}
        category={category}
        setCategory={setCategory}
        memberNames={memberNames}
      />
    );

    return (
      <>
        <PercentSplitComponent
          memberNames={route.params.memberNames}
          {...route.params}
          groupBackgroundColor={route.params.groupBackgroundColor}
          memberPercentages={memberPercentages}
          setMemberPercentages={setMemberPercentages}
          total={total}
          setTotal={setTotal}
          errorOpacity={errorOpacity}
          setErrorOpacity={setErrorOpacity}
          header={header}
          //   footer={footer}
        />
      </>
    );
  } else if (route.params.splitType == 'item') {
    const [items, setItems] = useState([]);
    const [refreshFlatlist, setRefreshFlatList] = useState(false);
    const [total, setTotal] = useState(route.params.price);

    useEffect(() => {
      let transactionItems = [];
      firestore()
        .collection('groups')
        .doc(route.params.groupID)
        .collection('transactions')
        .doc(route.params.key)
        .collection('items')
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            transactionItems.push(doc.data());
            if (snapshot.docs.indexOf(doc) == snapshot.docs.length - 1) {
              setItems(transactionItems);
              console.log(transactionItems);
              setRefreshFlatList(true);
            }
          });
        });
    }, []);

    const header = (
      <EditTransactionTopPart
        memberNames={route.params.memberNames}
        userName={route.params.userName}
        title={title}
        setTitle={setTitle}
        price={price}
        setPrice={setPrice}
        date={date}
        setDate={setDate}
        paidBy={paidBy}
        setPaidBy={setPaidBy}
        category={category}
        setCategory={setCategory}
        memberNames={memberNames}
      />
    );
    const submitChanges = () => {
      firestore()
        .collection('groups')
        .doc(route.params.groupID)
        .collection('transactions')
        .doc(route.params.key)
        .delete();

      let paidByID = route.params.memberRefs[paidBy];

      firestore()
        .collection('groups')
        .doc(route.params.groupID)
        .update({lastModified: firestore.Timestamp.now()});
      // DefaultTheme.refreshHome();
      firestore()
        .collection('groups')
        .doc(route.params.groupID)
        .collection('transactions')
        .add({
          title: title,
          date: new Date(date),
          category: category,
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
    const footer = () => {
      return (
        <TouchableOpacity
          onPress={() => {
            if (total == 0) {
              Alert.alert('Total of items cannot be 0.');
            } else if (parseFloat(total) != parseFloat(price)) {
              Alert.alert(
                'Total of items is less than transaction price.',
                'Lower transaction price to match?',
                [
                  {text: 'Cancel'},
                  {
                    text: 'Lower',
                    onPress: () => {
                      setPrice(total);
                      submitTransaction(total);
                    },
                  },
                  {
                    text: 'Split Rest Evenly',
                    onPress: () => {
                      setTotal(price);
                      setItems([
                        ...items,
                        {
                          itemName: 'Split rest evenly',
                          itemPrice: parseFloat(price - total).toFixed(2),
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
              submitChanges();
            }
          }}
          activeOpacity={0.9}
          style={{marginVertical: 20, alignSelf: 'center'}}>
          <FAB
            label="Submit Changes"
            style={{
              borderRadius: 20,
              backgroundColor: route.params.groupBackgroundColor,
            }}
            labelStyle={{fontSize: 17}}
          />
        </TouchableOpacity>
      );
    };
    return (
      <ItemSplitComponent
        header={header}
        memberNames={route.params.memberNames}
        paidBy={route.params.paidBy}
        memberRefs={route.params.memberRefs}
        total={total}
        setTotal={setTotal}
        transactionPrice={price}
        setTransactionPrice={setPrice}
        items={items}
        setItems={setItems}
        refreshFlatlist={refreshFlatlist}
        setRefreshFlatList={setRefreshFlatList}
        footer={footer}
      />
    );
  }
};

export default EditTransaction;
