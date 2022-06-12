import 'react-native-gesture-handler';
import React, {useState, useEffect} from 'react';
import {SafeAreaView, useColorScheme, StatusBar} from 'react-native';

import {enableScreens} from 'react-native-screens';

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/AntDesign'
import {
  Provider as PaperProvider,
  DefaultTheme,
  DarkTheme,
  Button,
} from 'react-native-paper';
import FirstLaunchScreen from './src/screens/FirstLaunchScreen';
import {NavigationContainer} from '@react-navigation/native';
import {
  createStackNavigator,
  TransitionPresets,
  TransitionSpecs,
} from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AddGroupModal from './src/modals/AddGroupModal';
import SettingsScreen from './src/screens/SettingsScreen';

import EmojiSelectorScreen from './src/modals/EmojiSelectorModal';
import GroupDetailsScreen from './src/screens/GroupDetailsScreen';
import AddTransactionScreen from './src/screens/TransactionStuff/AddTransactionScreen';
import ItemSplitScreen from './src/screens/TransactionStuff/ItemSplitScreen';
import PercentSplitScreen from './src/screens/TransactionStuff/PercentSplitScreen';

import LoadingModal from './src/components/LoadingModal';
import MembersSplitScreen from './src/screens/TransactionStuff/MembersSplitScreen';
import RecordPayment from './src/screens/RecordPaymentScreen';
import JoinGroup from './src/modals/JoinGroupModal';

import EditTransaction from './src/screens/TransactionStuff/EditTransaction';

import AccountConnectScreen from './src/screens/AccountConnectScreen';
import PersonalDetailsScreen from './src/screens/PersonalDetailsScreen';
import OwingTransactionsScreen from './src/screens/TransactionStuff/OwingTransactionsScreen';
import TransactionDetailsScreen from './src/screens/TransactionStuff/TransactionDetailsScreen';
import EditGroupScreen from './src/screens/EditGroupScreen';
import EditPaymentScreen from './src/screens/EditPaymentScreen';
import QuickTransaction from './src/screens/TransactionStuff/QuickTransaction';
import QuickieDetails from './src/screens/TransactionStuff/QuickieDetails';

const Stack = createStackNavigator();

const App = () => {
  let scheme = useColorScheme();

  Icon.loadFont()

  const [loading, setLoading] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const [userName, setUserName] = useState('');
  const [userID, setUserID] = useState(null);
  const [groupData, setgroupData] = useState([]); //this holds the data from all the groups
  const [groupIDs, setGroupIDs] = useState([]); //this holds the IDs of all groups the person is in
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  const [resetDate, setResetDate] = useState(0);

  const [graphData, setGraphData] = useState([]);

  const refresh = async id => {
    if (id) {
      setIsFirstLaunch(true);
      setTimeout(() => {
        setLoading(true);
      }, 0);
    } else {
      setLoading(true);
    }

    if (auth().currentUser != null) {
      if (!id) id = auth().currentUser.uid;
      setUserID(id);
      setUserExists(true);

      let user = await firestore().collection('users').doc(id).get();
      firestore()
        .collection('users')
        .doc(id)
        .update({lastOpen: firestore.Timestamp.now()});

      if (user !== null) {
        setUserName(user.data().Name);
        DefaultTheme.user = user;
        getGroups(setLoading, setgroupData, setGroupIDs, id);
      }
    } else {
      setLoading(false);
    }
  };

  //this function gets all of the groupData from firebase. It is called when the page is first rendered
  const getGroups = async (setLoading, setgroupData, setGroupIDs, id) => {
    let minigroupData = [];
    let miniGroupIDs = [];
    let miniGraphData = [];
    if (!id) id = auth().currentUser.uid;

    let user = DefaultTheme.user;
    let amountOfGroups = user.data().groups.length;
    if (amountOfGroups == 0) {
      setgroupData([]);
      setGroupIDs([]);
      setGraphData([]);
      if (isFirstLaunch) {
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } else {
        setLoading(false);
      }
      return;
    }

    setResetDate(user.data().resetDate);
    user.data().groups.forEach(async ref => {
      let memberNames = [];
      let memberRefs = [];
      let userRefs = [];

      let group = await ref.get();
      ref
        .collection('members')
        .get()
        .then(membersSnapshot => {
          let amountOfMembers = membersSnapshot.docs.length;
          membersSnapshot.forEach(async member => {
            //this gets the name of the user from their user profile, if the user profile exists
            if (member.data().ref) {
              let userDoc = await member.data().ref.get();
              userRefs.push(userDoc.id);
              memberNames.push(userDoc.data().Name);
              memberRefs.push(member.id);
              //if the names are different, update the name in the group
              if (userDoc.data().Name !== member.data().Name) {
                member.ref.update({Name: userDoc.data().Name});
              }
            } else {
              //otherwise it uses the name from group data
              memberNames.push(member.data().Name);
              memberRefs.push(member.id);
              userRefs.push('');
            }

            //if this is just the last member
            if (memberNames.length >= amountOfMembers) {
              let namesAsString = '';

              let index = 0;
              while (index < memberNames.length) {
                if (namesAsString.length == 0) {
                  namesAsString = memberNames[index];
                } else if (index == memberNames.length - 1) {
                  namesAsString += ' and ' + memberNames[index];
                } else {
                  namesAsString += ', ' + memberNames[index];
                }

                index++;
              }

              minigroupData.push({
                ...group.data(),
                memberNames,
                memberRefs,
                memberNamesAsString: namesAsString,
                key: ref.id,
                userRefs: userRefs,
              });
              miniGroupIDs.push(ref.id);

              start = new Date();
              end = new Date();
              if (user.data().resetDate >= end.getDate()) {
                start.setMonth(start.getMonth() - 1);
              } else {
                end.setMonth(end.getMonth() + 1);
              }
              end.setDate(user.data().resetDate);
              start.setDate(user.data().resetDate);
              start.setHours(0, 0, 0, 0);
              end.setHours(0, 0, 0, 0);

              const memberIDinGroup = memberRefs[userRefs.indexOf(id)];

              ref
                .collection('transactions')
                .where('date', '>=', start)
                .where('date', '<=', end)
                .orderBy('date', 'desc')
                .where('membersIncluded', 'array-contains', memberIDinGroup)
                .get()
                .then(transactions => {
                  if (transactions.docs.length != 0) {
                    transactions.forEach(transaction => {
                      let spentAmount = 0;
                      if (transaction.data().splitType == 'percent') {
                        spentAmount =
                          (transaction.data().percents[memberIDinGroup] *
                            transaction.data().price) /
                          100;
                      } else if (transaction.data().splitType == 'members') {
                        spentAmount =
                          transaction.data().price /
                          transaction.data().membersIncluded.length;
                      } else if (transaction.data().splitType == 'item') {
                        spentAmount =
                          transaction.data().owings[memberIDinGroup];
                      }

                      let categoryIndex = DefaultTheme.categories.indexOf(
                        transaction.data().category,
                      );
                      if (miniGraphData.length == 0) {
                        let categoryTotals = [0, 0, 0, 0, 0, 0, 0, 0];
                        categoryTotals[categoryIndex] = spentAmount.toFixed(2);
                        categoryTotals[7] = spentAmount.toFixed(2);
                        miniGraphData.push({
                          categoryTotals,
                          start,
                          end,
                          amountOfTransactions: 1,
                        });
                      } else {
                        let graph = miniGraphData[0];
                        graph.amountOfTransactions++;
                        graph.categoryTotals[categoryIndex] = (
                          +graph.categoryTotals[categoryIndex] +
                          parseFloat(spentAmount)
                        ).toFixed(2);
                        graph.categoryTotals[7] = (
                          +graph.categoryTotals[7] + parseFloat(spentAmount)
                        ).toFixed(2);
                      }
                    });
                  } else {
                    setGraphData(miniGraphData);
                    setgroupData(minigroupData);
                    setGroupIDs(miniGroupIDs);

                    if (isFirstLaunch) {
                      setTimeout(() => {
                        setLoading(false);
                      }, 2000);
                    } else {
                      setLoading(false);
                    }
                    return;
                  }
                  // if this is the last group,
                  if (user.data().groups.indexOf(ref) == amountOfGroups - 1) {
                    miniGraphData.forEach(graph => {
                      for (let i = 0; i < 7; i++) {
                        if (graph.categoryTotals[i] > 0) {
                          let newSection = {
                            percentage:
                              (graph.categoryTotals[i] /
                                graph.categoryTotals[7]) *
                              100,
                            color: DefaultTheme.darkCategoryColors[i],
                          };
                          if (graph.sections) {
                            graph.sections.push(newSection);
                          } else {
                            graph.sections = [newSection];
                          }
                        }
                      }
                    });
                    const today = new Date();
                    if (miniGraphData.length == 0) {
                      let start;
                      let end;

                      if (today > DefaultTheme.resetDate) {
                        start = new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          DefaultTheme.resetDate,
                          0,
                          0,
                          0,
                        );
                        end = new Date(
                          today.getFullYear(),
                          today.getMonth() + 1,
                          DefaultTheme.resetDate,
                          0,
                          0,
                          0,
                        );
                      } else {
                        start = new Date(
                          today.getFullYear(),
                          today.getMonth() - 1,
                          DefaultTheme.resetDate,
                          0,
                          0,
                          0,
                        );

                        end = new Date(
                          today.getFullYear(),
                          today.getMonth(),
                          DefaultTheme.resetDate,
                          0,
                          0,
                          0,
                        );
                      }
                      let categoryTotals = [0, 0, 0, 0, 0, 0, 0, 0];

                      miniGraphData.push({
                        categoryTotals,
                        start,
                        end,
                        amountOfTransactions: 0,
                        transactions: [],
                        sections: [
                          {
                            percentage: 100,
                            color: '#e8e8e8',
                          },
                        ],
                      });
                    }

                    setGraphData(miniGraphData);
                    setgroupData(minigroupData);

                    setGroupIDs(miniGroupIDs);
                    setLoading(false);
                  }
                });
            }
          });
        });
    });
  };

  DefaultTheme.colors.primary = '#4e588e';
  DefaultTheme.colors.accent = 'rgb(113, 139, 245)'; //change to a colour without opacity
  DefaultTheme.colors.card = 'white';

  DarkTheme.colors.primary = '#ffa845';
  DarkTheme.colors.accent = '#7d6fd9';
  DarkTheme.colors.card = '#252624';
  DarkTheme.colors.backdrop = '#252624';
  DarkTheme.colors.background = 'black';

  DefaultTheme.setUserExists = setUserExists;
  DefaultTheme.refresh = refresh;
  DefaultTheme.getGroups = getGroups;
  DefaultTheme.resetDate = resetDate;
  DefaultTheme.setResetDate = setResetDate;
  DefaultTheme.graphData = graphData;

  DefaultTheme.categories = [
    '🎬 Entertainment',
    '🍔 Food',
    '🛒 Groceries',
    '🛍 Retail',
    '💡 Utilities',
    '🚗 Transportation',
    '🥸 Other',
  ];
  DefaultTheme.categoryColors = [
    '#fdff8a',
    '#ff817a',
    '#90ff8a',
    '#e693e0',
    '#ffc187',
    '#abafff',
    '#c9c9d1',
  ];
  DefaultTheme.darkCategoryColors = [
    '#e1e346',
    '#ff817a',
    '#90ff8a',
    '#e693e0',
    '#ffc187',
    '#abafff',
    '#c9c9d1',
  ];

  useEffect(() => {
    refresh(false);
    enableScreens();
  }, []);
  if (loading) {
    return (
      <SafeAreaView
        style={[
          scheme == 'dark'
            ? {backgroundColor: DarkTheme.colors.background}
            : {backgroundColor: DefaultTheme.colors.background},
        ]}>
        <StatusBar
          backgroundColor={
            scheme == 'dark'
              ? DarkTheme.colors.background
              : DefaultTheme.colors.background
          }
          barStyle={scheme == 'dark' ? 'light-content' : 'dark-content'}
        />
        <Button
          onPress={() => {
            auth().signOut();
            setUserExists(false);
            refresh();
          }}>
          Log out
        </Button>
        <LoadingModal />
      </SafeAreaView>
    );
  } else {
    return (
      <NavigationContainer theme={scheme == 'dark' ? DarkTheme : DefaultTheme}>
        <StatusBar
          backgroundColor={
            scheme == 'dark'
              ? DarkTheme.colors.background
              : DefaultTheme.colors.background
          }
          barStyle={scheme == 'dark' ? 'light-content' : 'dark-content'}
        />
        <PaperProvider>
          <Stack.Navigator
            screenOptions={{
              useNativeDriver: true,
              cardOverlayEnabled: true,
              gestureEnabled: true,
            }}>
            {!userExists ? (
              <>
                <Stack.Screen
                  name="FirstLaunch"
                  component={FirstLaunchScreen}
                  options={{headerShown: false}}
                />
                <Stack.Screen
                  name="AddGroup"
                  component={AddGroupModal}
                  options={{
                    ...OpacityPanelTransition,
                    detachPreviousScreen: false,
                    headerShown: false,
                    cardStyle: {
                      borderRadius: 20,
                      marginTop: 200,
                      borderBottomEndRadius: 0,
                      borderBottomStartRadius: 0,
                    },
                  }}
                />
                <Stack.Screen
                  name="JoinGroup"
                  component={JoinGroup}
                  options={{
                    ...OpacityPanelTransition,
                    detachPreviousScreen: false,
                    headerShown: false,
                    cardStyle: {
                      borderRadius: 20,
                      marginTop: 200,
                      borderBottomEndRadius: 0,
                      borderBottomStartRadius: 0,
                    },
                  }}
                />
                <Stack.Screen
                  name="EmojiSelector"
                  component={EmojiSelectorScreen}
                  options={{
                    ...OpacityPanelTransition,
                    detachPreviousScreen: false,
                    headerShown: false,
                    cardStyle: {
                      borderRadius: 20,
                      marginTop: '20%',
                      borderBottomEndRadius: 0,
                      borderBottomStartRadius: 0,
                    },
                  }}
                />
                <Stack.Screen
                  name="AccountConnect"
                  component={AccountConnectScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.RevealFromBottomAndroid,
                    detachPreviousScreen: true,
                    headerBackTitle: ' ',
                    headerTitle: 'Account Sync Setup',
                    headerStyle: {
                      shadowOpacity: 0,
                      backgroundColor: 'transparent',
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Stack.Screen
                  name="Home"
                  component={HomeScreen}
                  options={{
                    headerShown: false,
                    // ...TransitionPresets.DefaultTransition,
                  }}
                  initialParams={{
                    userName: userName,
                    userID: userID,
                    groupData,
                    groupIDs,
                  }}
                />
                <Stack.Screen
                  name="AddGroup"
                  component={AddGroupModal}
                  options={{
                    ...OpacityPanelTransition,
                    detachPreviousScreen: false,
                    headerShown: false,
                    cardStyle: {
                      borderRadius: 20,
                      marginTop: 200,
                      borderBottomEndRadius: 0,
                      borderBottomStartRadius: 0,
                    },
                  }}
                />
                <Stack.Screen
                  name="JoinGroup"
                  component={JoinGroup}
                  options={{
                    ...OpacityPanelTransition,
                    detachPreviousScreen: false,
                    headerShown: false,
                    cardStyle: {
                      borderRadius: 20,
                      marginTop: 200,
                      borderBottomEndRadius: 0,
                      borderBottomStartRadius: 0,
                    },
                  }}
                />
                <Stack.Screen
                  name="EmojiSelector"
                  component={EmojiSelectorScreen}
                  options={{
                    ...OpacityPanelTransition,
                    detachPreviousScreen: false,
                    headerShown: false,
                    cardStyle: {
                      borderRadius: 20,
                      marginTop: '20%',
                      borderBottomEndRadius: 0,
                      borderBottomStartRadius: 0,
                    },
                  }}
                />
                <Stack.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    headerShown: true,

                    detachPreviousScreen: true,
                    headerBackTitle: ' ',
                  }}
                  initialParams={{
                    userName: userName,
                    userID: userID,
                  }}
                />
                <Stack.Screen
                  name="AccountConnect"
                  component={AccountConnectScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.RevealFromBottomAndroid,
                    detachPreviousScreen: true,
                    headerBackTitle: ' ',
                    headerTitle: 'Account Sync Setup',
                    headerStyle: {
                      shadowOpacity: 0,
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <Stack.Screen
                  name="GroupDetails"
                  component={GroupDetailsScreen}
                  options={() => ({
                    detachPreviousScreen: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    headerShown: false,
                  })}
                  initialParams={{
                    userName: userName,
                    userID: userID,
                  }}
                />
                <Stack.Screen
                  name="OwingTransactions"
                  component={OwingTransactionsScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.FadeFromBottomAndroid,
                    detachPreviousScreen: true,
                    headerTitle: 'Owing Transactions',
                    headerBackTitle: ' ',
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                  }}
                />
                <Stack.Screen
                  name="TransactionDetails"
                  component={TransactionDetailsScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.FadeFromBottomAndroid,
                    detachPreviousScreen: true,
                    headerTitle: 'Transaction Details',
                    headerBackTitle: ' ',
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                  }}
                />
                <Stack.Screen
                  name="EditPayment"
                  component={EditPaymentScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.FadeFromBottomAndroid,
                    detachPreviousScreen: true,
                    headerTitle: 'Edit Payment',
                    headerBackTitle: ' ',
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                  }}
                />
                <Stack.Screen
                  name="EditGroup"
                  component={EditGroupScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    detachPreviousScreen: true,
                    headerTitle: 'Edit Group',
                    headerBackTitle: ' ',
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                  }}
                />
                <Stack.Screen
                  name="RecordPayment"
                  component={RecordPayment}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    detachPreviousScreen: true,
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                    headerBackTitle: ' ',
                    headerTitle: 'Record Payment',
                  }}
                />
                <Stack.Screen
                  name="AddTransaction"
                  component={AddTransactionScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    detachPreviousScreen: true,
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                    headerBackTitle: ' ',
                    headerTitle: 'Add a New Transaction',
                  }}
                />
                <Stack.Screen
                  name="QuickTransaction"
                  component={QuickTransaction}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    detachPreviousScreen: true,
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                    headerBackTitle: ' ',
                    headerTitle: 'Add a New Transaction',
                  }}
                />
                <Stack.Screen
                  name="QuickieDetails"
                  component={QuickieDetails}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    detachPreviousScreen: true,
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                    headerBackTitle: ' ',
                    headerTitle: 'Add a New Transaction',
                  }}
                />
                <Stack.Screen
                  name="ItemSplit"
                  component={ItemSplitScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    detachPreviousScreen: true,
                    headerTitle: 'Split Bill By Items',
                    headerBackTitle: ' ',
                    headerStyle: {
                      shadowOpacity: 0,
                      elevation: 0,
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <Stack.Screen
                  name="PercentSplit"
                  component={PercentSplitScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    detachPreviousScreen: true,
                    headerTitle: 'Split Bill By Percent',
                    headerBackTitle: ' ',
                    headerStyle: {
                      shadowOpacity: 0,
                      elevation: 0,
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <Stack.Screen
                  name="MembersSplit"
                  component={MembersSplitScreen}
                  options={{
                    headerShown: true,
                    ...TransitionPresets.SlideFromRightIOS,
                    detachPreviousScreen: true,
                    headerTitle: 'Split Bill By Members',
                    headerBackTitle: ' ',
                    headerStyle: {
                      shadowOpacity: 0,
                      elevation: 0,
                      backgroundColor: 'transparent',
                    },
                  }}
                />
                <Stack.Screen
                  name="EditTransaction"
                  component={EditTransaction}
                  options={{
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                    headerBackTitle: ' ',
                    headerTitle: 'Edit Transaction',
                  }}
                />

                <Stack.Screen
                  name="PersonalDetails"
                  component={PersonalDetailsScreen}
                  options={{
                    ...TransitionPresets.FadeFromBottomAndroid,
                    headerStyle: [
                      scheme == 'dark'
                        ? {backgroundColor: DarkTheme.colors.background}
                        : {backgroundColor: DefaultTheme.colors.background},
                      {
                        shadowOpacity: 0,
                        elevation: 0,
                      },
                    ],
                    headerBackTitle: ' ',
                    headerTitle: 'Personal Spending Details',
                  }}
                />
              </>
            )}
          </Stack.Navigator>
        </PaperProvider>
      </NavigationContainer>
    );
  }
};

const OpacityPanelTransition = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: TransitionSpecs.TransitionIOSSpec,
    close: TransitionSpecs.TransitionIOSSpec,
  },

  cardStyleInterpolator: ({current, next, layouts}) => {
    return {
      cardStyle: {
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },

          {
            scale: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1],
                })
              : 1,
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.8],
        }),
      },
    };
  },
};

export default App;