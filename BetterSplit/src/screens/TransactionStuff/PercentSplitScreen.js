import React, {useState} from 'react';
import {View, FlatList, Alert, StyleSheet, Text} from 'react-native';
import {Subheading, FAB, HelperText, DefaultTheme} from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';
import {useTheme} from '@react-navigation/native';
import Transactions from '../../components/Transactions';
import Slider from 'react-native-slider';
import PercentSplitComponent from '../../components/PercentSplitComponent';

const PercentSplitScreen = ({route, navigation}) => {
  const memberNames = route.params.memberNames;
  const [memberPercentages, setMemberPercentages] = useState([]);
  const [total, setTotal] = useState(0);
  const [errorOpacity, setErrorOpacity] = useState(0);
  const {colors} = useTheme();
  const userID = route.params.userID;

  const header = () => {
    return (
      <>
        <Transactions
          paidBy={route.params.paidBy}
          title={route.params.title}
          price={route.params.price}
          category={route.params.category}
          date={route.params.date}
          groupBackgroundColor={route.params.groupBackgroundColor}
        />

        <Subheading style={{textAlign: 'center', marginTop: 20}}>
          Input what percent of the transaction each member should pay for
        </Subheading>
      </>
    );
  };

  const footer = () => {
    return (
      <>
        <HelperText style={{color: colors.primary, textAlign: 'center'}}>
          Current Total: {total}
        </HelperText>
        <HelperText
          style={[
            {
              color: 'red',
              textAlign: 'center',
              opacity: errorOpacity,
            },
          ]}>
          The total percentages must add up to 100.
        </HelperText>
        <FAB
          style={{
            borderRadius: 20,
            marginTop: 15,
            alignSelf: 'center',
            backgroundColor: route.params.groupBackgroundColor,
          }}
          labelStyle={{fontSize: 17}}
          onPress={() => {
            if (total < 100) {
              Alert.alert(
                'Total of percentages must add up to 100, ' +
                  (100 - total) +
                  '% is missing',
              );
            } else if (total > 100) {
              Alert.alert(
                'Total of percentages must add up to 100, you are ' +
                  (total - 100) +
                  '% over',
              );
            } else {
              console.log(userID);
              if (route.params.paidBy != 'Person 1') {
                let membersIncluded = [];
                let paidByID = '';
                for (let i in route.params.memberRefs) {
                  if (memberPercentages[i] > 0) {
                    membersIncluded.push(route.params.memberRefs[i]);
                  }
                  if (route.params.paidBy === route.params.memberNames[i]) {
                    paidByID = route.params.memberRefs[i];
                  }
                }

                firestore()
                  .collection('groups')
                  .doc(route.params.groupID)
                  .update({lastModified: firestore.Timestamp.now()});
                DefaultTheme.refreshHome();
                let transactionData = {};
                for (let i in memberNames) {
                  if (memberPercentages[i]) {
                    transactionData[route.params.memberRefs[i]] =
                      memberPercentages[i];
                  }
                }

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
                    splitType: 'percent',
                    membersIncluded,
                    percents: transactionData,
                  });

                navigation.pop(2);
                DefaultTheme.refreshGroupDetails();
              } else {
                const docRef = firestore()
                  .collection('users')
                  .doc(userID)
                  .collection('quickies')
                  .doc();
                const details = {
                  title: route.params.title,
                  date: new Date(route.params.date),
                  category: route.params.category,
                  price: route.params.price,
                  splitType: 'percent',
                };
                console.log(details);
                docRef.set(details);
                navigation.push('QuickieDetails', {
                  ...details,
                  date: route.params.date.toDateString(),
                });
              }
            }
          }}
          label="Submit Transaction"
        />
      </>
    );
  };

  return (
    <PercentSplitComponent
      {...route.params}
      memberPercentages={memberPercentages}
      setMemberPercentages={setMemberPercentages}
      total={total}
      setTotal={setTotal}
      errorOpacity={errorOpacity}
      setErrorOpacity={setErrorOpacity}
      header={header}
      footer={footer}
    />
  );
};

export default PercentSplitScreen;
