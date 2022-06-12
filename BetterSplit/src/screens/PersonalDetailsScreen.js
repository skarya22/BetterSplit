import React, {useState, useEffect} from 'react';

import {
  Text,
  FlatList,
  TouchableOpacity,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import SpendingGraph from '../components/SpendingGraph';
import firestore from '@react-native-firebase/firestore';
import Transactions from '../components/Transactions';
import {DefaultTheme} from 'react-native-paper';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useTheme} from '@react-navigation/native';

const PersonalDetailsScreen = ({route}) => {
  const onViewableItemsChanged = ({viewableItems}) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[viewableItems.length - 1].index);
    }
  };
  const viewabilityConfigCallbackPairs = React.useRef([
    {onViewableItemsChanged},
  ]);
  const [graphData, setGraphData] = useState([...DefaultTheme.graphData]); //stores the totals for each month
  const [currentIndex, setCurrentIndex] = useState(0);

  const [firstLoad, setFirstLoad] = useState(true);
  const [displayCategory, setDisplayCategory] = useState([]);

  const [initialScrollIndex, setInitialScrollIndex] = useState(-1);

  let flatlistRef = null;
  useEffect(() => {
    getAllTransactions();
  }, []);
  //   let flatlistRef = React.createRef();
  const setFlatlistRef = element => {
    flatlistRef = element;
    //   setCurrentIndex(initialScrollIndex);
    if (
      firstLoad &&
      element &&
      element.scrollToIndex &&
      initialScrollIndex > -1 &&
      graphData.length >= initialScrollIndex
    ) {
      setFirstLoad(false);
      setTimeout(() => {
        element.scrollToIndex({index: initialScrollIndex, animated: false});
      }, 0);
    }
  };

  const getAllTransactions = () => {
    miniGraphData = [];

    route.params.groupData.forEach((group, index) => {
      let memberIDinGroup =
        group.memberRefs[group.memberNames.indexOf(route.params.userName)];

      firestore()
        .collection('groups')
        .doc(group.key)
        .get()
        .then(group => {
          group.ref
            .collection('transactions')
            .where('membersIncluded', 'array-contains', memberIDinGroup)
            .get()
            .then(transactions => {
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
                  spentAmount = transaction.data().owings[memberIDinGroup];
                }
                let transactionDate = transaction.data().date.toDate();
                let categoryIndex = DefaultTheme.categories.indexOf(
                  transaction.data().category,
                );
                let foundMonth = false;
                for (let i = 0; i < miniGraphData.length; i++) {
                  let graph = miniGraphData[i];
                  if (
                    graph.start <= transactionDate &&
                    graph.end >= transactionDate
                  ) {
                    foundMonth = true;
                    graph.amountOfTransactions++;
                    graph.categoryTotals[categoryIndex] =
                      +graph.categoryTotals[categoryIndex] +
                      parseFloat(spentAmount);
                    graph.categoryTotals[7] =
                      +graph.categoryTotals[7] + parseFloat(spentAmount);

                    graph.transactions.push({
                      groupName: group.data().Name,
                      groupBackgroundColor: group.data().backgroundColor,
                      spentAmount: spentAmount,
                      title: transaction.data().title,
                      date: transactionDate,
                      category: transaction.data().category,
                    });
                  }
                }

                if (!foundMonth) {
                  let start;
                  let end;
                  if (transactionDate > DefaultTheme.resetDate) {
                    start = new Date(
                      transactionDate.getFullYear(),
                      transactionDate.getMonth(),
                      DefaultTheme.resetDate,
                      0,
                      0,
                      0,
                    );
                    end = new Date(
                      transactionDate.getFullYear(),
                      transactionDate.getMonth() + 1,
                      DefaultTheme.resetDate,
                      0,
                      0,
                      0,
                    );
                  } else {
                    start = new Date(
                      transactionDate.getFullYear(),
                      transactionDate.getMonth() - 1,
                      DefaultTheme.resetDate,
                      0,
                      0,
                      0,
                    );

                    end = new Date(
                      transactionDate.getFullYear(),
                      transactionDate.getMonth(),
                      DefaultTheme.resetDate,
                      0,
                      0,
                      0,
                    );
                  }
                  let categoryTotals = [0, 0, 0, 0, 0, 0, 0, 0];
                  categoryTotals[categoryIndex] = spentAmount;
                  categoryTotals[7] = spentAmount;

                  miniGraphData.push({
                    categoryTotals,
                    start,
                    end,
                    amountOfTransactions: 1,
                  });

                  miniGraphData[miniGraphData.length - 1].transactions = [
                    {
                      groupName: group.data().Name,
                      groupBackgroundColor: group.data().backgroundColor,
                      spentAmount: spentAmount,
                      title: transaction.data().title,
                      date: transactionDate,
                      category: transaction.data().category,
                    },
                  ];
                }
              });

              if (index + 1 == route.params.groupData.length) {
                miniGraphData.forEach(graph => {
                  for (let i = 0; i < 7; i++) {
                    if (graph.categoryTotals[i] > 0) {
                      let newSection = {
                        percentage:
                          (graph.categoryTotals[i] / graph.categoryTotals[7]) *
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
                if (
                  DefaultTheme.graphData[0] &&
                  DefaultTheme.graphData[0].categoryTotals[7] == 0
                ) {
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
                setGraphData(
                  miniGraphData.sort((a, b) => {
                    if (a.start > b.start) {
                      return true;
                    } else {
                      return false;
                    }
                  }),
                );

                for (let i = 0; i < miniGraphData.length; i++) {
                  if (
                    miniGraphData[i].start <= today &&
                    miniGraphData[i].end >= today
                  ) {
                    setInitialScrollIndex(i);
                    break;
                  }
                }
              }
            });
        });
    });
  };
  const {colors} = useTheme();

  return (
    <ScrollView>
      <FlatList
        keyExtractor={item => {
          return (
            item.start.toDateString() +
            item.end.toDateString() +
            item.categoryTotals[7]
          );
        }}
        ref={setFlatlistRef}
        style={{width: '100%', height: 170}}
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        pagingEnabled
        horizontal
        getItemLayout={(data, index) => ({
          length: Dimensions.get('window').width,
          offset: Dimensions.get('window').width * index,
          index,
        })}
        snapToStart
        showsHorizontalScrollIndicator={false}
        data={graphData}
        renderItem={item => {
          return (
            <SpendingGraph
              graphData={item.item}
              displayCategory={displayCategory}
              setDisplayCategory={setDisplayCategory}
            />
          );
        }}
      />
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignContent: 'center',
          width: '100%',
        }}>
        {0 <= currentIndex - 1 && (
          <TouchableOpacity
            onPress={() => {
              flatlistRef.scrollToIndex({index: currentIndex - 1});
            }}>
            <AntDesign
              name="left"
              size={20}
              style={{alignSelf: 'center', color: colors.text}}
            />
          </TouchableOpacity>
        )}

        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={{
            textAlign: 'center',
            fontWeight: 'bold',
            alignSelf: 'center',
            color: colors.text,
          }}>
          {graphData[currentIndex] &&
            graphData[currentIndex].start.toDateString()}{' '}
          to{' '}
          {graphData[currentIndex] &&
            graphData[currentIndex].end.toDateString()}
        </Text>
        {graphData.length > currentIndex + 1 && (
          <TouchableOpacity
            onPress={() => {
              flatlistRef.scrollToIndex({index: currentIndex + 1});
            }}>
            <AntDesign
              name="right"
              size={20}
              style={{alignSelf: 'center', color: colors.text}}
            />
          </TouchableOpacity>
        )}
      </View>
      {graphData[currentIndex] &&
        graphData[currentIndex].transactions &&
        graphData[currentIndex].transactions
          .filter(item => {
            if (
              displayCategory.length == 0 ||
              displayCategory.includes(item.category)
            ) {
              return true;
            }
          })
          .map((item, index) => {
            return (
              <Transactions
                key={index}
                title={item.title}
                price={parseFloat(item.spentAmount).toFixed(2)}
                paidBy={item.groupName}
                date={item.date.toDateString()}
                category={item.category}
                groupBackgroundColor={item.groupBackgroundColor}
                noDate={false}
                groupEmoji={item.groupEmoji}
              />
            );
          })}
      {/* <FlatList
        
        data={
          graphData[currentIndex] &&
          graphData[currentIndex].transactions &&
          
        }
        renderItem={item => {
          return (
            
          );
        }}
      /> */}
    </ScrollView>
  );
};

export default PersonalDetailsScreen;
