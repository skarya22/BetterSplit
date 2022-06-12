import React from 'react';
import {View, FlatList, StyleSheet, Text} from 'react-native';
import {TextInput} from 'react-native';
import Slider from 'react-native-slider';

const PercentSplitComponent = props => {
  const {
    memberNames,
    memberPercentages,
    setMemberPercentages,
    setTotal,
    setErrorOpacity,
    groupBackgroundColor,
    header,
    footer,
  } = props;

  const findTotal = () => {
    let total = 0;
    for (let i in memberNames) {
      if (memberPercentages[i]) {
        total += parseInt(memberPercentages[i]);
      }
    }
    setTotal(total);
    if (total > 100) {
      setErrorOpacity(1);
    } else {
      setErrorOpacity(0);
    }
  };

  var customStyles3 = StyleSheet.create({
    track: {
      height: 10,
      borderRadius: 5,
      backgroundColor: '#d0d0d0',
    },

    thumb: {
      width: 10,
      height: 30,
      borderRadius: 5,
      backgroundColor: groupBackgroundColor,
    },
  });

  return (
    <View>
      <FlatList
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        style={{height: '100%'}}
        data={memberNames}
        renderItem={name => {
          return (
            <>
              <View style={{marginHorizontal: 30}}>
                <View
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                  }}>
                  <Text style={{flex: 1, marginLeft: 15}}>{name.item}</Text>
                  <TextInput
                    style={{
                      textAlign: 'right',

                      marginRight: 25,
                    }}
                    onChangeText={newPercentage => {
                      console.log(newPercentage);
                      if (newPercentage.length == 0) {
                        newPercentage = 0;
                      } else {
                        newPercentage.indexOf('.') ==
                          newPercentage.lastIndexOf('.') &&
                          (newPercentage.length - 1 <=
                            2 + newPercentage.indexOf('.') ||
                            newPercentage.indexOf('.') == -1) &&
                          newPercentage.match(/^[0-9.]*$/);
                      }

                      let currentPercentages = [...memberPercentages];
                      currentPercentages[name.index] = parseInt(newPercentage);
                      setMemberPercentages([...currentPercentages]);
                    }}
                    onSubmitEditing={() => {
                      findTotal();
                    }}>
                    {memberPercentages[name.index]
                      ? memberPercentages[name.index]
                      : 0}
                  </TextInput>
                  <Text>%</Text>
                </View>
                <Slider
                  maximumValue={100}
                  minimumTrackTintColor={groupBackgroundColor}
                  trackStyle={customStyles3.track}
                  thumbStyle={customStyles3.thumb}
                  style={{
                    marginHorizontal: 20,
                  }}
                  step={5}
                  value={memberPercentages[name.index]}
                  onValueChange={newPercentage => {
                    // findTotal();

                    let currentPercentages = [...memberPercentages];
                    currentPercentages[name.index] = newPercentage;
                    setMemberPercentages([...currentPercentages]);
                  }}
                  onSlidingComplete={findTotal}
                />
              </View>

              {/* <TextInput
                mode="outlined"
                label={'% of bill that belongs to ' + name.item}
                onChangeText={newPercentage => {
                  let currentPercentages = [...memberPercentages];
                  currentPercentages[name.index] = newPercentage;
                  setMemberPercentages([...currentPercentages]);
                }}
                style={{marginVertical: 5}}
              /> */}
            </>
          );
        }}
        keyExtractor={name => {
          return name;
        }}
      />
    </View>
  );
};

export default PercentSplitComponent;
