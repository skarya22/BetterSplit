import React, {useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {Chip, FAB, Title, Card, DefaultTheme} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';

import Transactions from '../../components/Transactions';

import MembersSplitComponent from '../../components/MembersSplitComponent';

const MembersSplitScreen = ({route, navigation}) => {
  const selectableMembers = route.params.memberNames;
  const [selectedMembers, setSelectedMembers] = useState([]);

  return (
    <>
      <ScrollView>
        <Transactions
          paidBy={route.params.paidBy}
          title={route.params.title}
          price={route.params.price}
          category={route.params.category}
          date={route.params.date}
          groupBackgroundColor={route.params.groupBackgroundColor}
        />
        <MembersSplitComponent
          selectedMembers={selectedMembers}
          setSelectedMembers={setSelectedMembers}
          selectableMembers={selectableMembers}
          {...route.params}
          groupBackgroundColor={route.params.groupBackgroundColor}
        />
      </ScrollView>
      <FAB
        label="Submit Transaction"
        style={{
          borderRadius: 20,
          bottom: '10%',
          position: 'absolute',
          alignSelf: 'center',
          backgroundColor: route.params.groupBackgroundColor,
        }}
        labelStyle={{fontSize: 17}}
        onPress={() => {
          if (selectedMembers.length > 0) {
            let paidByID = '';
            let selectedMemberIDs = [];
            for (let i in route.params.memberNames) {
              if (route.params.paidBy === route.params.memberNames[i]) {
                paidByID = route.params.memberRefs[i];
              }
            }
            for (let i in selectedMembers) {
              selectedMemberIDs.push(
                route.params.memberRefs[
                  route.params.memberNames.indexOf(selectedMembers[i])
                ],
              );
            }
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
                price: route.params.price,
                splitType: 'members',
                membersIncluded: selectedMemberIDs,
              });

            navigation.pop(2);
            DefaultTheme.refreshGroupDetails();
          }
        }}
      />
    </>
  );
};

export default MembersSplitScreen;
