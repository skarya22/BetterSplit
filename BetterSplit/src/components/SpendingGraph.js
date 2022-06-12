import React from 'react';
import {Dimensions, FlatList, TouchableOpacity, View} from 'react-native';
import {
  Card,
  Text,
  Chip,
  DefaultTheme,
  Subheading,
  Headline,
} from 'react-native-paper';
import Pie from 'react-native-pie';

import {useTheme} from '@react-navigation/native';

const SpendingGraph = props => {
  const theme = useTheme();
  const graphSections = props.graphData.sections;
  const categoryTotals = props.graphData.categoryTotals;
  return (
    <Card
      style={{
        width: Dimensions.get('window').width - 20,
        height: 150,
        marginHorizontal: 10,
        elevation: 3,
        borderRadius: 20,
        marginBottom: 10,
      }}>
      <Card.Content>
        <>
          <View style={{flexDirection: 'row'}}>
            <View>
              <Subheading
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{color: theme.colors.text, marginRight: '30%'}}>
                Today's date: {new Date().toDateString()}
              </Subheading>
              <Headline style={{color: theme.colors.text}}>
                ${parseFloat(props.graphData.categoryTotals[7]).toFixed(2)}
              </Headline>
              <Subheading style={{color: theme.colors.text}}>
                {props.graphData.amountOfTransactions} Transaction
                {props.graphData.amountOfTransactions != 1 && 's'}
              </Subheading>
            </View>
          </View>
          <View style={{flexDirection: 'row'}}>
            {categoryTotals[7] == 0 && (
              <Chip
                style={{
                  height: 30,
                  margin: 5,
                  alignItems: 'center',
                  justifyContent: 'center',

                  backgroundColor: '#e8e8e8',
                  borderColor: 'black',
                  borderWidth: 1,
                }}
                key={'none'}>
                no transactions
              </Chip>
            )}
            {categoryTotals[7] != 0 &&
              DefaultTheme.categories.map((category, index) => {
                if (categoryTotals[index] > 0 && index != 7)
                  return (
                    <Chip
                      style={{
                        height: 30,
                        margin: 5,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: DefaultTheme.darkCategoryColors[index],
                        borderColor: 'black',
                        borderWidth: 1,
                      }}
                      key={index}>
                      {category.substring(0, 2)}
                    </Chip>
                  );
              })}
          </View>
          <View
            style={{
              alignSelf: 'flex-end',
              position: 'absolute',
              bottom: 30,
              right: 10,
            }}>
            <Pie radius={60} sections={graphSections} />
          </View>
        </>
      </Card.Content>
    </Card>
  );
};

export default SpendingGraph;
