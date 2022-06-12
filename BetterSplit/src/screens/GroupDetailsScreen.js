import firestore from '@react-native-firebase/firestore';
import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Share from 'react-native-share';
import {
  List,
  FAB,
  Avatar,
  Subheading,
  DefaultTheme,
  Chip,
  Searchbar,
  Title,
  Card,
  TextInput,
} from 'react-native-paper';

import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

import MobilePaySVG from '../assets/MobilePaySVG.js';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {HeaderBackButton} from '@react-navigation/elements';
import OwingDetails from '../components/OwingDetails';
import Transactions from '../components/Transactions';
import {TabView, TabBar} from 'react-native-tab-view';
import {useTheme} from '@react-navigation/native';
import DateTimePicker from 'react-native-modal-datetime-picker';
const GroupDetailsScreen = ({route, navigation}) => {
  const [historyData, setHistoryData] = useState([]);
  const [flatlistData, setFlatlistData] = useState([]);
  const [searchBarText, setSearchBarText] = useState('');

  const defaultFilters = {
    showFilters: false,
    showTransactions: true,
    showPayments: true,
    dateStart: '',
    dateStartVisible: false,
    dateEnd: '',
    dateEndVisible: false,
    membersIncluded: route.params.memberNames,
    paidBy: route.params.memberNames,
    priceStart: '',
    priceEnd: '',
    category: DefaultTheme.categories,
    paidTo: route.params.memberNames,
  };
  const [filters, setFilters] = useState(defaultFilters);
  const [prevFilters, setPrevFilters] = useState(defaultFilters);

  const [owingData, setOwingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const listTranslateAnim = useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;
  const [orientation, setOrientation] = useState('portrait');

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'Owing', title: 'Owing Details'},
    {key: 'History', title: 'History'},
  ]);

  const [fabOpen, setFabOpen] = useState(false);

  const renderItem = item => {
    let splitID = item.item.id.split('-owes-');
    let owes;
    let owed;
    let amount = item.item.amount;

    if (item.item.amount > 0) {
      owes =
        route.params.memberNames[route.params.memberRefs.indexOf(splitID[0])];
      owed =
        route.params.memberNames[route.params.memberRefs.indexOf(splitID[1])];
    } else if (item.item.amount < 0) {
      owes =
        route.params.memberNames[route.params.memberRefs.indexOf(splitID[1])];
      owed =
        route.params.memberNames[route.params.memberRefs.indexOf(splitID[0])];
      amount = -amount;
    }
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          navigation.push('OwingTransactions', {
            transactions: item.item.transactions.sort((a, b) => {
              if (new Date(a.date) > new Date(b.date)) {
                return -1;
              } else return 1;
            }),
            userName: route.params.userName,
            owes,
            owed,
            amount: parseFloat(amount).toFixed(2),
            ...route.params,
          });
        }}>
        <OwingDetails
          userName={route.params.userName}
          owes={owes}
          owed={owed}
          amount={parseFloat(amount).toFixed(2)}
          groupBackgroundColor={route.params.groupBackgroundColor}
        />
      </TouchableOpacity>
    );
  };

  Dimensions.addEventListener('change', () => {
    if (Dimensions.get('window').width > Dimensions.get('window').height) {
      //landscape
      setOrientation('landscape');
    } else {
      //portrait
      setOrientation('portrait');
    }
  });

  const getHistoryItems = miniHistoryData => {
    if (!miniHistoryData) {
      miniHistoryData = historyData;
    }

    setFlatlistData(
      miniHistoryData
        .filter(item => {
          //filters:
          //just transaction
          if (item.price) {
            //searchbar
            if (
              searchBarText.length > 0 &&
              !item.title.toLowerCase().includes(searchBarText.toLowerCase())
            ) {
              return false;
            }
            if (!filters.showTransactions) {
              return false;
            }

            //if members included are not included
            for (let i = 0; i < item.membersIncludedNames.length; i++) {
              if (
                !filters.membersIncluded.includes(item.membersIncludedNames[i])
              ) {
                return false;
              }
            }

            //if paidby is not included
            if (!filters.paidBy.includes(item.paidBy)) {
              return false;
            }
            //if under price range
            if (filters.priceStart && item.price < filters.priceStart) {
              return false;
            }
            //if greater than price range
            if (filters.priceEnd && item.price > filters.priceEnd) {
              return false;
            }
            if (filters.category && !filters.category.includes(item.category)) {
              return false;
            }
          }

          //just payment
          if (item.paymentAmount) {
            if (!filters.showPayments || searchBarText.length > 0) {
              return false;
            }
            //if members included and not included
            if (
              !filters.membersIncluded.includes(item.paymentTo) ||
              !filters.membersIncluded.includes(item.paymentFrom)
            ) {
              return false;
            }
            //if payment from is not included
            if (!filters.paidBy.includes(item.paymentFrom)) {
              return false;
            }
            //if paidto not included
            if (!filters.paidTo.includes(item.paymentTo)) {
              return false;
            }
          }
          if (filters.dateStart && new Date(item.date) < filters.dateStart) {
            return false;
          }
          if (filters.dateEnd && new Date(item.date) > filters.dateEnd) {
            return false;
          }

          return true;
        })
        .sort((a, b) => {
          if (new Date(a.date) > new Date(b.date)) {
            return -1;
          } else return 1;
        }),
    );
  };

  const getOwings = () => {
    setOwingData([]);
    let miniOwingData = [];
    let miniHistoryData = [];
    setHistoryData([]);
    getTransactionData(miniHistoryData, miniOwingData);
  };

  const getTransactionData = (miniHistoryData, miniOwingData) => {
    let miniTransactionData = [];
    //get transaction data
    firestore()
      .collection('groups')
      .doc(route.params.groupID)
      .collection('transactions')
      .orderBy('date', 'desc')
      .get()
      .then(snapshot => {
        if (snapshot.docs.length == 0) {
          //if there are no transactions, then done
          getPaymentData(miniHistoryData, miniOwingData);
          console.log('no transactions');
        } else {
          snapshot.forEach(transaction => {
            console.log(transaction.data());
            let paidBy = '';

            for (let i in route.params.memberRefs) {
              if (transaction.data().paidBy === route.params.memberRefs[i]) {
                paidBy = route.params.memberNames[i];
              }
            }

            let membersIncludedAsString =
              route.params.memberNames[
                route.params.memberRefs.indexOf(
                  transaction.data().membersIncluded[0],
                )
              ];

            let membersIncludedNames = [membersIncludedAsString];

            for (
              let i = 1;
              i < transaction.data().membersIncluded.length;
              i++
            ) {
              if (i == transaction.data().membersIncluded.length - 1) {
                let newName =
                  route.params.memberNames[
                    route.params.memberRefs.indexOf(
                      transaction.data().membersIncluded[i],
                    )
                  ];

                membersIncludedAsString += ' and ' + newName;

                membersIncludedNames.push(newName);
              } else {
                let newName =
                  route.params.memberNames[
                    route.params.memberRefs.indexOf(
                      transaction.data().membersIncluded[i],
                    )
                  ];
                membersIncludedAsString += ', ' + newName;
                membersIncludedNames.push(newName);
              }
            }
            if (
              transaction.data().membersIncluded.length ==
              route.params.memberNames.length
            ) {
              membersIncludedAsString = 'Everyone';
            }

            let thisTransactionData = {
              title: transaction.data().title,
              price: transaction.data().price,
              date: transaction.data().date.toDate().toDateString(),
              category: transaction.data().category,
              paidBy,
              key: transaction.id,
              membersIncludedAsString: membersIncludedAsString,
              splitType: transaction.data().splitType,
              membersIncludedNames,
              owings: [],
            };

            if (transaction.data().splitType == 'percent') {
              thisTransactionData.memberPercentages =
                transaction.data().percents;

              transaction.data().membersIncluded.forEach(member => {
                if (member != transaction.data().paidBy) {
                  let string = member + '-owes-' + transaction.data().paidBy;
                  let string2 = transaction.data().paidBy + '-owes-' + member;
                  let price =
                    (transaction.data().price *
                      transaction.data().percents[member]) /
                    100;
                  thisTransactionData.owings.push(price);
                  let didFind = false;
                  for (let i = 0; i < miniOwingData.length; i++) {
                    if (miniOwingData[i].id == string) {
                      miniOwingData[i].amount += +price;
                      miniOwingData[i].transactions.push(thisTransactionData);

                      didFind = true;
                      break;
                    } else if (miniOwingData[i].id == string2) {
                      miniOwingData[i].amount -= price;
                      miniOwingData[i].transactions.push(thisTransactionData);
                      didFind = true;
                      break;
                    }
                  }
                  if (!didFind) {
                    miniOwingData.push({id: string, amount: price});
                    miniOwingData[miniOwingData.length - 1].transactions = [
                      thisTransactionData,
                    ];
                  }
                } else {
                  thisTransactionData.owings.push(0);
                }
              });
            } else if (transaction.data().splitType == 'members') {
              transaction.data().membersIncluded.forEach(member => {
                if (member != transaction.data().paidBy) {
                  let string = member + '-owes-' + transaction.data().paidBy;
                  let string2 = transaction.data().paidBy + '-owes-' + member;
                  let price =
                    transaction.data().price /
                    transaction.data().membersIncluded.length;
                  thisTransactionData.owings.push(price);
                  let didFind = false;
                  for (let i = 0; i < miniOwingData.length; i++) {
                    if (miniOwingData[i].id == string) {
                      miniOwingData[i].amount += +price;
                      miniOwingData[i].transactions.push(thisTransactionData);
                      didFind = true;
                      break;
                    } else if (miniOwingData[i].id == string2) {
                      miniOwingData[i].amount -= price;
                      miniOwingData[i].transactions.push(thisTransactionData);
                      didFind = true;
                      break;
                    }
                  }
                  if (!didFind) {
                    miniOwingData.push({id: string, amount: price});
                    miniOwingData[miniOwingData.length - 1].transactions = [
                      thisTransactionData,
                    ];
                  }
                } else {
                  thisTransactionData.owings.push(0);
                }
              });
            } else if (transaction.data().splitType == 'item') {
              transaction.data().membersIncluded.forEach(member => {
                if (member != transaction.data().paidBy) {
                  let string = member + '-owes-' + transaction.data().paidBy;
                  let string2 = transaction.data().paidBy + '-owes-' + member;
                  let price = transaction.data().owings[member];
                  thisTransactionData.owings.push(price);
                  let didFind = false;
                  for (let i = 0; i < miniOwingData.length; i++) {
                    if (miniOwingData[i].id == string) {
                      miniOwingData[i].amount += +price;
                      miniOwingData[i].transactions.push(thisTransactionData);
                      didFind = true;
                      break;
                    } else if (miniOwingData[i].id == string2) {
                      miniOwingData[i].amount -= price;
                      miniOwingData[i].transactions.push(thisTransactionData);
                      didFind = true;
                      break;
                    }
                  }
                  if (!didFind) {
                    miniOwingData.push({id: string, amount: price});
                    miniOwingData[miniOwingData.length - 1].transactions = [
                      thisTransactionData,
                    ];
                  }
                } else {
                  thisTransactionData.owings.push(0);
                }
              });
            }

            miniTransactionData.push(thisTransactionData);
            if (
              snapshot.docs.length - 1 ==
              snapshot.docs.indexOf(transaction)
            ) {
              getPaymentData(miniTransactionData, miniOwingData);
            }
          });
        }
      });
  };

  const getPaymentData = (miniTransactionData, miniOwingData) => {
    let miniPaymentData = [];
    //get payment data
    firestore()
      .collection('groups')
      .doc(route.params.groupID)
      .collection('payments')
      .orderBy('date')
      .get()
      .then(snapshot => {
        if (snapshot.docs.length == 0) {
          console.log('no payments');
          setOwingData(miniOwingData);
          setHistoryData(miniTransactionData);
          getHistoryItems(miniTransactionData);
          setTimeout(() => {
            setLoading(false);
          }, 50);

          Animated.timing(listTranslateAnim, {
            toValue: 0,
            delay: 150,
            useNativeDriver: true,
            duration: 500,
          }).start();
        } else {
          snapshot.forEach(payment => {
            let paymentToName = '';
            let paymentFromName = '';
            for (let i in route.params.memberRefs) {
              if (payment.data().paymentTo === route.params.memberRefs[i]) {
                paymentToName = route.params.memberNames[i];
              } else if (
                payment.data().paymentFrom === route.params.memberRefs[i]
              ) {
                paymentFromName = route.params.memberNames[i];
              }
            }
            let thisPaymentData = {
              typeOfCard: 'payment',
              paymentTo: paymentToName,
              paymentFrom: paymentFromName,
              paymentAmount: payment.data().paymentAmount,
              date: payment.data().date.toDate().toDateString(),
            };
            miniPaymentData.push(thisPaymentData);

            let string =
              payment.data().paymentTo + '-owes-' + payment.data().paymentFrom;
            let string2 =
              payment.data().paymentFrom + '-owes-' + payment.data().paymentTo;
            let price = payment.data().paymentAmount;

            let didFind = false;
            for (let i = 0; i < miniOwingData.length; i++) {
              if (miniOwingData[i].id == string) {
                miniOwingData[i].amount += +price;
                miniOwingData[i].transactions.push(thisPaymentData);
                didFind = true;
                break;
              } else if (miniOwingData[i].id == string2) {
                miniOwingData[i].amount -= +price;
                miniOwingData[i].transactions.push(thisPaymentData);
                didFind = true;
                break;
              }
            }
            if (!didFind) {
              miniOwingData.push({id: string, amount: price});
              miniOwingData[miniOwingData.length - 1].transactions = [
                thisPaymentData,
              ];
            }

            if (snapshot.docs.indexOf(payment) == snapshot.docs.length - 1) {
              let miniHistoryData = [
                ...miniTransactionData,
                ...miniPaymentData,
              ];
              setOwingData(miniOwingData);
              setHistoryData(miniHistoryData);
              getHistoryItems(miniHistoryData);
              setTimeout(() => {
                setLoading(false);
              }, 150);

              Animated.timing(listTranslateAnim, {
                toValue: 0,
                delay: 150,
                useNativeDriver: true,
                duration: 500,
              }).start();
            }
          });
        }
      });
  };

  const shareGroup = () => {
    let random = parseInt(Math.random() * 16);
    let newInviteCode = route.params.groupID
      .substring(random, random + 4)
      .toUpperCase();
    let now = firestore.Timestamp.now();
    firestore()
      .collection('invitations')
      .doc(newInviteCode)
      .set({groupID: route.params.groupID, dateCreated: now});
    firestore()
      .collection('groups')
      .doc(route.params.groupID)
      .get()
      .then(group => {
        let oldInviteCode = group.data().inviteCode;
        firestore().collection('groups').doc(route.params.groupID).update({
          inviteCode: newInviteCode,
          lastModified: now,
        });
        if (oldInviteCode) {
          firestore().collection('invitations').doc(oldInviteCode).delete();
        }
      });
    let date = firestore.Timestamp.now().toDate();
    date.setDate(date.getDate() + 1);

    Share.open({
      message:
        'Enter the code: ' +
        newInviteCode +
        ' in the BetterSplit app available for iOS and Android within 24 hours',
    });
  };

  const refresh = () => {
    setLoading(true);
    getOwings();
    setFilters({...defaultFilters});
  };

  useEffect(() => {
    refresh();

    DefaultTheme.refreshGroupDetails = refresh;

    if (Dimensions.get('window').width > Dimensions.get('window').height) {
      //landscape
      setOrientation('landscape');
    } else {
      //portrait
      setOrientation('portrait');
    }
  }, []);

  const renderScene = prop => {
    switch (prop.route.key) {
      case 'Owing':
        return (
          <Animated.View
            style={{
              // opacity: listFadeAnim,
              transform: [{translateY: listTranslateAnim}],
            }}>
            <FlatList
              refreshing={loading}
              onRefresh={refresh}
              ListEmptyComponent={() => {
                if (loading) {
                  return null;
                } else {
                  return (
                    <View
                      style={{
                        height: Dimensions.get('window').height * 0.8,
                        justifyContent: 'center',
                      }}>
                      <MobilePaySVG
                        width={'100%'}
                        height={200}
                        color={route.params.groupBackgroundColor}
                      />
                      <Subheading style={{textAlign: 'center', padding: 50}}>
                        All balanced out! Add a transaction from the "+" button
                        below :)
                      </Subheading>
                    </View>
                  );
                }
              }}
              ListHeaderComponent={() => {
                if (!loading && owingData.length > 0) {
                  return (
                    <View
                      style={[
                        orientation == 'portrait'
                          ? {marginHorizontal: 20}
                          : {marginHorizontal: 120},
                        {
                          flexDirection: 'row',
                          height: 30,
                          top: 10,
                        },
                      ]}>
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
                  );
                } else {
                  return null;
                }
              }}
              renderItem={renderItem}
              style={{height: '100%'}}
              data={owingData}
            />
          </Animated.View>
        );
      case 'History':
        return (
          <>
            <Animated.View
              style={{
                transform: [{translateY: listTranslateAnim}],
              }}>
              {filters.showFilters ? (
                <ScrollView style={{height: '100%', marginTop: 10}}>
                  <Card
                    style={{
                      marginHorizontal: 30,
                      elevation: 3,
                      borderRadius: 20,
                    }}>
                    <Card.Content>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignSelf: 'center',
                          marginBottom: 15,
                        }}>
                        <TouchableOpacity
                          onPress={() => {
                            setFilters({...defaultFilters, showFilters: true});
                          }}>
                          <FAB
                            label="clear filters"
                            height={40}
                            mode="contained"
                            style={{
                              borderRadius: 20,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              backgroundColor:
                                route.params.groupBackgroundColor,
                              marginRight: 15,
                            }}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setFilters({...filters, showFilters: false});
                            getHistoryItems();
                          }}>
                          <FAB
                            label="submit"
                            height={40}
                            mode="contained"
                            style={{
                              borderRadius: 20,

                              alignSelf: 'center',
                              justifyContent: 'center',
                              backgroundColor:
                                route.params.groupBackgroundColor,
                            }}
                          />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={{alignSelf: 'center', paddingLeft: 10}}
                          onPress={() => {
                            setFilters({
                              ...prevFilters,
                            });
                          }}>
                          <AntDesign
                            name="close"
                            size={30}
                            style={{color: 'gray'}}
                          />
                        </TouchableOpacity>
                      </View>

                      <View style={{flexDirection: 'row'}}>
                        <Title>Type:</Title>
                        <TouchableOpacity
                          onPress={() => {
                            if (filters.showTransactions) {
                              setFilters({...filters, showTransactions: false});
                            } else {
                              setFilters({...filters, showTransactions: true});
                            }
                          }}>
                          <Chip
                            style={[
                              styles.chip,
                              filters.showTransactions
                                ? {borderWidth: 1, borderColor: colors.text}
                                : {borderWidth: 0},
                            ]}
                            mode="outlined" //changing display mode, default is flat.
                            height={35} //give desirable height to chip
                            textStyle={{fontSize: 15, color: 'black'}}>
                            Transaction
                          </Chip>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            if (filters.showPayments) {
                              setFilters({...filters, showPayments: false});
                            } else {
                              setFilters({...filters, showPayments: true});
                            }
                          }}>
                          <Chip
                            style={[
                              styles.chip,

                              filters.showPayments
                                ? {borderWidth: 1, borderColor: colors.text}
                                : {borderWidth: 0},
                            ]}
                            mode="outlined" //changing display mode, default is flat.
                            height={35} //give desirable height to chip
                            textStyle={{fontSize: 15, color: 'black'}}>
                            Payment
                          </Chip>
                        </TouchableOpacity>
                      </View>
                      <Title>Date:</Title>
                      <TouchableOpacity
                        onPress={() => {
                          setFilters({...filters, dateStartVisible: true});
                        }}
                        style={{flexDirection: 'row'}}>
                        <View pointerEvents="none" style={{width: '100%'}}>
                          <TextInput
                            mode="outlined"
                            label="From"
                            value={
                              filters.dateStart
                                ? filters.dateStart.toDateString()
                                : ''
                            }
                            style={[styles.input, {zIndex: -1}]}
                            editable={false}
                          />
                        </View>
                        <AntDesign
                          size={25}
                          name="calendar"
                          style={{
                            position: 'absolute',
                            right: 10,
                            alignSelf: 'center',
                            top: 12.5,
                          }}
                        />
                        <DateTimePicker
                          value={filters.dateStart}
                          // date={filters.dateStart}
                          maximumDate={filters.dateEnd ? filters.dateEnd : null}
                          isVisible={filters.dateStartVisible}
                          onConfirm={newDate => {
                            newDate.setHours(0, 0, 0, 0);
                            setFilters({
                              ...filters,
                              dateStart: newDate,
                              dateStartVisible: false,
                            });
                          }}
                          onCancel={() => {
                            setFilters({...filters, dateStartVisible: false});
                          }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setFilters({...filters, dateEndVisible: true});
                        }}
                        style={{flexDirection: 'row'}}>
                        <View pointerEvents="none" style={{width: '100%'}}>
                          <TextInput
                            mode="outlined"
                            label="To"
                            value={
                              filters.dateEnd
                                ? filters.dateEnd.toDateString()
                                : ''
                            }
                            style={[styles.input, {zIndex: -1}]}
                            editable={false}
                          />
                        </View>
                        <AntDesign
                          size={25}
                          name="calendar"
                          style={{
                            position: 'absolute',
                            right: 10,
                            alignSelf: 'center',
                            top: 12.5,
                          }}
                        />
                        <DateTimePicker
                          value={filters.dateEnd}
                          // date={filters.dateEnd}
                          minimumDate={
                            filters.dateStart ? filters.dateStart : null
                          }
                          isVisible={filters.dateEndVisible}
                          onConfirm={newDate => {
                            newDate.setHours(0, 0, 0, 0);
                            setFilters({
                              ...filters,
                              dateEnd: newDate,
                              dateEndVisible: false,
                            });
                          }}
                          onCancel={() => {
                            setFilters({...filters, dateEndVisible: false});
                          }}
                        />
                      </TouchableOpacity>

                      <Title>Members Included: </Title>
                      <View style={{flexDirection: 'row', width: '100%'}}>
                        <AntDesign
                          name="left"
                          size={15}
                          style={{
                            color: colors.text,
                            alignSelf: 'center',
                            marginRight: 5,
                          }}
                        />
                        <FlatList
                          style={{width: '100%'}}
                          data={route.params.memberNames}
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                          renderItem={item => {
                            return (
                              <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => {
                                  if (
                                    filters.membersIncluded.includes(item.item)
                                  ) {
                                    setFilters({
                                      ...filters,
                                      membersIncluded:
                                        filters.membersIncluded.filter(
                                          thisItem => {
                                            return thisItem != item.item;
                                          },
                                        ),
                                    });
                                  } else {
                                    setFilters({
                                      ...filters,
                                      membersIncluded: [
                                        ...filters.membersIncluded,
                                        item.item,
                                      ],
                                    });
                                  }
                                }}>
                                <Chip
                                  style={[
                                    filters.membersIncluded.includes(item.item)
                                      ? {
                                          borderWidth: 2,
                                          borderColor: colors.text,
                                          backgroundColor: colors.card,
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

                        <AntDesign
                          name="right"
                          size={15}
                          style={{
                            color: colors.text,
                            alignSelf: 'center',
                            marginLeft: 5,
                          }}
                        />
                      </View>

                      <Title>Paid By: </Title>
                      <View style={{flexDirection: 'row'}}>
                        <AntDesign
                          name="left"
                          size={15}
                          style={{color: colors.text, alignSelf: 'center'}}
                        />

                        <FlatList
                          data={route.params.memberNames}
                          horizontal={true}
                          showsHorizontalScrollIndicator={false}
                          renderItem={item => {
                            return (
                              <TouchableOpacity
                                activeOpacity={0.5}
                                onPress={() => {
                                  if (filters.paidBy.includes(item.item)) {
                                    setFilters({
                                      ...filters,
                                      paidBy: filters.paidBy.filter(
                                        thisItem => {
                                          return thisItem != item.item;
                                        },
                                      ),
                                    });
                                  } else {
                                    setFilters({
                                      ...filters,
                                      paidBy: [...filters.paidBy, item.item],
                                    });
                                  }
                                }}>
                                <Chip
                                  style={[
                                    filters.paidBy.includes(item.item)
                                      ? {
                                          borderWidth: 2,
                                          borderColor: colors.text,
                                          backgroundColor: colors.card,
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

                        <AntDesign
                          name="right"
                          size={15}
                          style={{color: colors.text, alignSelf: 'center'}}
                        />
                      </View>

                      <Title>Price Range:</Title>

                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}>
                        <TextInput
                          mode="outlined"
                          label="From"
                          value={filters.priceStart}
                          style={[
                            styles.input,
                            {width: '45%', marginRight: '2.5%'},
                          ]}
                          onChangeText={newPrice => {
                            setFilters({...filters, priceStart: newPrice});
                          }}
                        />

                        <TextInput
                          mode="outlined"
                          label="To"
                          value={filters.priceEnd}
                          style={[
                            styles.input,
                            {width: '45%', marginLeft: '2.5%'},
                          ]}
                          onChangeText={newPrice => {
                            setFilters({...filters, priceEnd: newPrice});
                          }}
                        />
                      </View>

                      <View
                        style={
                          !filters.showTransactions ? {opacity: 0.5} : null
                        }>
                        <Title>Category:</Title>
                        <View style={{flexDirection: 'row'}}>
                          <AntDesign
                            name="left"
                            size={15}
                            style={{
                              alignSelf: 'center',
                              marginRight: 5,
                            }}
                          />
                          <FlatList
                            data={DefaultTheme.categories}
                            scrollEnabled={filters.showTransactions}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            renderItem={item => {
                              return (
                                <TouchableOpacity
                                  activeOpacity={0.5}
                                  disabled={!filters.showTransactions}
                                  onPress={() => {
                                    if (filters.category.includes(item.item)) {
                                      setFilters({
                                        ...filters,
                                        category: filters.category.filter(
                                          thisItem => {
                                            return thisItem != item.item;
                                          },
                                        ),
                                      });
                                    } else {
                                      setFilters({
                                        ...filters,
                                        category: [
                                          ...filters.category,
                                          item.item,
                                        ],
                                      });
                                    }
                                  }}>
                                  <Chip
                                    style={[
                                      filters.category.includes(item.item)
                                        ? {
                                            borderWidth: 2,
                                            borderColor: colors.text,
                                          }
                                        : {borderWidth: 0},
                                      {
                                        marginHorizontal: 5,
                                        marginBottom: 2,
                                        backgroundColor:
                                          DefaultTheme.categoryColors[
                                            item.index
                                          ],
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
                                    {item.item.substring(0, 2)}
                                  </Chip>
                                </TouchableOpacity>
                              );
                            }}
                          />

                          <AntDesign
                            name="right"
                            size={15}
                            style={{
                              alignSelf: 'center',
                              marginLeft: 5,
                            }}
                          />
                        </View>
                      </View>

                      <View
                        style={!filters.showPayments ? {opacity: 0.5} : null}>
                        <Title>Paid To: </Title>
                        <View style={{flexDirection: 'row'}}>
                          <AntDesign
                            name="left"
                            size={15}
                            style={{color: colors.text, alignSelf: 'center'}}
                          />
                          <FlatList
                            data={route.params.memberNames}
                            horizontal={true}
                            scrollEnabled={filters.showPayments}
                            showsHorizontalScrollIndicator={false}
                            renderItem={item => {
                              return (
                                <TouchableOpacity
                                  activeOpacity={0.5}
                                  disabled={!filters.showPayments}
                                  onPress={() => {
                                    if (filters.paidTo.includes(item.item)) {
                                      setFilters({
                                        ...filters,
                                        paidTo: filters.paidTo.filter(
                                          thisItem => {
                                            return thisItem != item.item;
                                          },
                                        ),
                                      });
                                    } else {
                                      setFilters({
                                        ...filters,
                                        paidTo: [...filters.paidTo, item.item],
                                      });
                                    }
                                  }}>
                                  <Chip
                                    style={[
                                      filters.paidTo.includes(item.item)
                                        ? {
                                            borderWidth: 2,
                                            borderColor: colors.text,
                                            backgroundColor: colors.card,
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
                          <AntDesign
                            name="right"
                            size={15}
                            style={{color: colors.text, alignSelf: 'center'}}
                          />
                        </View>
                      </View>
                    </Card.Content>
                  </Card>
                  <View style={{height: 50}} />
                </ScrollView>
              ) : (
                <View
                  style={{
                    marginHorizontal: 30,
                    marginBottom: 10,
                    marginTop: 20,
                    flexDirection: 'row',
                  }}>
                  <Searchbar
                    multiline={false}
                    placeholder="Search"
                    icon={props => {
                      return <AntDesign {...props} name="search1" />;
                    }}
                    style={{
                      flex: 1,
                      elevation: 3,
                      borderRadius: 12.5,
                    }}
                    clearIcon={true}
                    clearIcon={props => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            setSearchBarText('');
                          }}>
                          <AntDesign {...props} name="close" />
                        </TouchableOpacity>
                      );
                    }}
                    value={searchBarText}
                    onChangeText={newText => {
                      setSearchBarText(newText);
                      getHistoryItems();
                    }}
                  />
                  <TouchableOpacity
                    style={{alignSelf: 'center', marginLeft: 10}}
                    onPress={() => {
                      setFilters({
                        ...filters,
                        showFilters: !filters.showFilters,
                      });
                      setPrevFilters({...filters});
                    }}>
                    <AntDesign
                      name="filter"
                      size={30}
                      style={{color: 'gray'}}
                    />
                  </TouchableOpacity>
                </View>
              )}

              <FlatList
                refreshing={loading}
                onRefresh={refresh}
                numColumns={orientation == 'portrait' ? 1 : 2}
                key={orientation}
                style={{height: '100%'}}
                ListEmptyComponent={() => {
                  if (!loading) {
                    return (
                      <View
                        style={{
                          height: Dimensions.get('window').height * 0.8,
                          justifyContent: 'center',
                        }}>
                        <MobilePaySVG
                          width={'100%'}
                          height={200}
                          color={route.params.groupBackgroundColor}
                        />
                        <Subheading style={{textAlign: 'center', padding: 50}}>
                          There are currently no transactions. Press on 'Add
                          Transaction' below to make one
                        </Subheading>
                      </View>
                    );
                  } else {
                    return null;
                  }
                }}
                initialNumToRender={10}
                ListFooterComponent={() => {
                  return (
                    <View
                      style={{
                        height: 100,
                      }}
                    />
                  );
                }}
                data={flatlistData}
                renderItem={item => {
                  const typeOfCard = item.item.typeOfCard;

                  return (
                    <View
                      style={[
                        orientation == 'portrait'
                          ? {width: '100%'}
                          : {width: '50%'},
                      ]}>
                      {orientation != 'portrait' ||
                      item.index == 0 ||
                      (item.index > 0 &&
                        flatlistData[item.index - 1].date != item.item.date) ? (
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
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => {
                              navigation.push('EditPayment', {
                                ...item.item,
                                ...route.params,
                              });
                            }}>
                            <OwingDetails
                              userName={route.params.userName}
                              owes={item.item.paymentFrom}
                              owed={item.item.paymentTo}
                              amount={parseFloat(
                                item.item.paymentAmount,
                              ).toFixed(2)}
                              groupBackgroundColor={
                                route.params.groupBackgroundColor
                              }
                              date={item.item.date}
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View>
                          <TouchableOpacity
                            activeOpacity={0.85}
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
                              groupBackgroundColor={
                                route.params.groupBackgroundColor
                              }
                              noDate={true}
                              splitType={item.item.splitType}
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                }}
              />
            </Animated.View>
          </>
        );
    }
  };
  const {colors} = useTheme();

  return (
    <>
      <SafeAreaView style={{flexDirection: 'row'}}>
        <List.Item
          style={{
            width: '100%',
            // marginBottom: 20,
            zIndex: -10,
          }}
          title={route.params.groupName}
          description={route.params.memberNamesAsString}
          left={() => {
            return (
              <>
                <HeaderBackButton
                  onPress={() => {
                    navigation.pop();
                  }}
                  labelVisible={false}
                />
                <Avatar.Text
                  style={{
                    borderRadius: 20,
                    backgroundColor: route.params.groupBackgroundColor,
                    zIndex: -10,
                  }}
                  size={55}
                  label={route.params.groupEmoji}
                  labelStyle={{
                    fontSize: 35,
                    color: 'black',
                    alignSelf: 'center',
                    textAlign: 'center',
                  }}
                />
              </>
            );
          }}
          right={() => {
            return (
              <View style={{alignSelf: 'center', flexDirection: 'row'}}>
                <TouchableOpacity onPress={shareGroup}>
                  <AntDesign name="export" style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    navigation.push('EditGroup', {...route.params});
                  }}>
                  <AntDesign name="edit" style={styles.icon} />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </SafeAreaView>
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        keyboardDismissMode="none"
        onIndexChange={setIndex}
        swipeEnabled={!filters.showFilters}
        initialLayout={{width: Dimensions.get('window').width}}
        layout={[orientation == 'portrait' ? {width: '100%'} : {width: '100%'}]}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={{
              backgroundColor: route.params.groupBackgroundColor,
            }}
            activeColor={colors.text}
            pressColor={'transparent'}
            style={{backgroundColor: colors.background}}
            inactiveColor={'gray'}
          />
        )}
      />

      <FAB.Group
        open={fabOpen}
        style={{
          marginTop: '-35%',
          zIndex: 2500,
        }}
        fabStyle={{
          backgroundColor: route.params.groupBackgroundColor,
          zIndex: 2500,
        }}
        icon={
          fabOpen
            ? props => {
                return <AntDesign {...props} name="close" />;
              }
            : props => {
                return <AntDesign {...props} name="plus" />;
              }
        }
        onStateChange={() => setFabOpen(!fabOpen)}
        actions={[
          {
            icon: props => {
              return <AntDesign {...props} name="barschart" />;
            },
            label: 'Record Payment',
            onPress: () =>
              navigation.push('RecordPayment', {
                groupID: route.params.groupID,
                groupName: route.params.groupName,
                memberNames: route.params.memberNames,
                memberRefs: route.params.memberRefs,
                groupBackgroundColor: route.params.groupBackgroundColor,
              }),
          },
          {
            icon: props => {
              return <AntDesign {...props} name="creditcard" />;
            },
            label: 'Add Transaction',
            onPress: () =>
              navigation.push('AddTransaction', {
                groupID: route.params.groupID,
                groupName: route.params.groupName,
                memberNames: route.params.memberNames,
                memberRefs: route.params.memberRefs,
                userName: route.params.userName,
                groupBackgroundColor: route.params.groupBackgroundColor,
              }),
          },
        ]}
      />
    </>
  );
};

const styles = StyleSheet.create({
  icon: {fontSize: 30, paddingRight: 15, color: 'gray'},
  iconContainer: {
    alignSelf: 'flex-end',
    top: 15,
    right: 0,
    position: 'absolute',
    flexDirection: 'row',
  },
  button: {
    width: '65%',
    alignSelf: 'center',
  },
  chip: {
    marginHorizontal: 5,
    marginBottom: 2,
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    shadowOffset: {width: 2, height: 2},
  },
  input: {
    height: 40,
    width: '100%',
    alignSelf: 'center',
    fontSize: 20,
  },
});

export default GroupDetailsScreen;
