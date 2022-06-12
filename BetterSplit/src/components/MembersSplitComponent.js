import React, {useState} from 'react';
import {ScrollView, TouchableOpacity, View} from 'react-native';
import {Chip, FAB, Title, Card, DefaultTheme} from 'react-native-paper';

import firestore from '@react-native-firebase/firestore';

import {useTheme} from '@react-navigation/native';

const MembersSplitComponent = props => {
  const {
    selectableMembers,
    selectedMembers,
    setSelectedMembers,
    groupBackgroundColor,
  } = props;
  const {colors} = useTheme();
  const getSubheading = () => {
    if (
      selectedMembers.length > 6 ||
      selectedMembers.length == selectableMembers.length
    ) {
      return (
        'Each member owes ' +
        props.paidBy +
        ' $' +
        (props.price / selectedMembers.length).toFixed(2)
      );
    } else if (selectedMembers.length == 0) {
      return 'Please select members to add to this transaction';
    } else if (selectedMembers.length == 1) {
      if (selectedMembers[0] == props.paidBy) {
        return 'Nobody owes anything for this transaction';
      } else {
        return (
          selectedMembers[0] + ' owes ' + props.paidBy + ' $' + props.price
        );
      }
    } else if (selectedMembers.length == 2) {
      if (selectedMembers.includes(props.paidBy)) {
        //if kevin paid for himself and another person
        return (
          selectedMembers.filter(name => name != props.paidBy) +
          ' owes ' +
          props.paidBy +
          ' $' +
          (props.price / 2).toFixed(2)
        );
      } else {
        //if kevin paid for two other people
        return (
          selectedMembers[0] +
          ' and ' +
          selectedMembers[1] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 2).toFixed(2)
        );
      }
    } else if (selectedMembers.length == 3) {
      if (selectedMembers.includes(props.paidBy)) {
        //if kevin paid for himself and 2 other people
        let otherMembers = selectedMembers.filter(name => name != props.paidBy);
        return (
          otherMembers[0] +
          ' and ' +
          otherMembers[1] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 3).toFixed(2)
        );
      } else {
        //kevin paid for 3 other people
        return (
          selectedMembers[0] +
          ', ' +
          selectedMembers[1] +
          ' and ' +
          selectedMembers[2] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 3).toFixed(2)
        );
      }
    } else if (selectedMembers.length == 4) {
      if (selectedMembers.includes(props.paidBy)) {
        //if kevin paid for himself and 3 other people
        let otherMembers = selectedMembers.filter(name => name != props.paidBy);
        return (
          otherMembers[0] +
          ', ' +
          otherMembers[1] +
          ' and ' +
          otherMembers[2] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 4).toFixed(2)
        );
      } else {
        //kevin paid for 3 other people
        return (
          selectedMembers[0] +
          ', ' +
          selectedMembers[1] +
          ', ' +
          selectedMembers[2] +
          ' and ' +
          selectedMembers[3] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 4).toFixed(2)
        );
      }
    } else if (selectedMembers.length == 5) {
      if (selectedMembers.includes(props.paidBy)) {
        //if kevin paid for himself and 4 other people
        let otherMembers = selectedMembers.filter(name => name != props.paidBy);
        return (
          otherMembers[0] +
          ', ' +
          otherMembers[1] +
          ', ' +
          otherMembers[2] +
          ' and ' +
          otherMembers[3] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 5).toFixed(2)
        );
      } else {
        //kevin paid for 5 other people
        return (
          selectedMembers[0] +
          ', ' +
          selectedMembers[1] +
          ', ' +
          selectedMembers[2] +
          ', ' +
          selectedMembers[3] +
          ' and ' +
          selectedMembers[4] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 5).toFixed(2)
        );
      }
    } else if (selectedMembers.length == 6) {
      if (selectedMembers.includes(props.paidBy)) {
        //if kevin paid for himself and 5 other people
        let otherMembers = selectedMembers.filter(name => name != props.paidBy);
        return (
          otherMembers[0] +
          ', ' +
          otherMembers[1] +
          ', ' +
          otherMembers[2] +
          ', ' +
          otherMembers[3] +
          ' and ' +
          otherMembers[4] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 6).toFixed(2)
        );
      } else {
        //kevin paid for 6 other people
        return (
          selectedMembers[0] +
          ', ' +
          selectedMembers[1] +
          ', ' +
          selectedMembers[2] +
          ', ' +
          selectedMembers[3] +
          ', ' +
          selectedMembers[4] +
          ' and ' +
          selectedMembers[5] +
          ' owe ' +
          props.paidBy +
          ' $' +
          (props.price / 6).toFixed(2)
        );
      }
    }
  };
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          if (selectedMembers.length == selectableMembers.length) {
            setSelectedMembers([]);
          } else {
            setSelectedMembers(selectableMembers);
          }
        }}
        style={{
          margin: 5,
          marginHorizontal: '10%',
          justifyContent: 'center',
        }}>
        <FAB
          style={[
            selectedMembers.length != selectableMembers.length
              ? {opacity: 0.2}
              : null,
            {
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: groupBackgroundColor,
            },
          ]}
          uppercase={false}
          mode="contained"
          height={40}
          label={'Everyone'}></FAB>
      </TouchableOpacity>
      <View
        style={{
          margin: 5,
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
        {selectableMembers.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              onPress={() => {
                if (selectedMembers.includes(item)) {
                  setSelectedMembers(
                    selectedMembers.filter(name => name != item),
                  );
                } else {
                  setSelectedMembers([...selectedMembers, item]);
                }
              }}>
              <Chip
                key={index}
                mode="outlined" //changing display mode, default is flat.
                height={30} //give desirable height to chip
                style={[
                  selectedMembers.includes(item)
                    ? {
                        backgroundColor: colors.card,
                        borderColor: colors.text,
                        borderWidth: 2,
                      }
                    : {backgroundColor: 'transparent'},
                  {
                    marginHorizontal: 10,
                    marginVertical: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                ]}
                textStyle={[{color: colors.text, fontSize: 15}]} //label properties
              >
                {selectedMembers.includes(item) ? '➖ ' + item : '➕ ' + item}
              </Chip>
            </TouchableOpacity>
          );
        })}
      </View>
      {/* <Divider
  style={{
    height: 1,
    width: '80%',
    backgroundColor: colors.disabled,
    alignSelf: 'center',
    marginVertical: 20,
  }}
/> */}
      <Card
        style={{
          marginVertical: 10,
          marginHorizontal: 30,
          elevation: 3,
          borderRadius: 15,
          flexDirection: 'row',
          paddingHorizontal: 15,
          alignSelf: 'center',
        }}>
        <Card.Content>
          <Title style={{textAlign: 'center'}}>{getSubheading()}</Title>
        </Card.Content>
      </Card>
    </>
  );
};

export default MembersSplitComponent;
