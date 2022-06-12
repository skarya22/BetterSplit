import React, {useEffect} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Avatar, Card} from 'react-native-paper';
import {useTheme} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ArrowSVG from '../assets/ArrowSVG';

const OwingDetails = props => {
  const {colors} = useTheme();

  return (
    <Card
      style={{
        marginVertical: 10,
        marginHorizontal: 30,
        elevation: 3,
        backgroundColor: colors.card,
        borderRadius: 15,
        flexDirection: 'row',
        width: props.width,
        paddingHorizontal: 15,
        alignSelf: 'center',
      }}>
      <Card.Content
        style={{
          flexDirection: 'row',
          alignSelf: 'center',
          alignItems: 'center',
        }}>
        <View style={{width: '100%', flexDirection: 'column'}}>
          <View style={Styles.mainView}>
            <View style={Styles.people}>
              <Avatar.Text
                style={{
                  borderRadius: 50,
                  backgroundColor: props.groupBackgroundColor,
                  marginVertical: 5,
                }}
                size={60}
                label={props.owes.toString().charAt('0').toUpperCase()}
                labelStyle={{fontSize: 30}}
              />
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{color: colors.text}}>
                {' '}
                {props.owes}{' '}
              </Text>
            </View>

            <View style={Styles.amountView}>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{
                  fontSize: 30,
                  fontWeight: 'bold',
                  marginTop: 8,
                  marginHorizontal: 5,
                  color: colors.text,
                }}>
                {parseFloat(props.amount).toFixed(2)}
              </Text>
              <ArrowSVG color={colors.text} width={125} />
              <Text style={{color: colors.text}}>
                {props.date ? 'paid' : 'owes'}
              </Text>
            </View>

            <View style={Styles.people}>
              <Avatar.Text
                style={{
                  borderRadius: 50,
                  backgroundColor: props.groupBackgroundColor,
                  marginVertical: 5,
                }}
                size={60}
                label={props.owed.toString().charAt('0').toUpperCase()}
                labelStyle={{fontSize: 30}}
              />
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={{color: colors.text}}>
                {props.owed}
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};
React.memo(OwingDetails, (props, nextProps) => {
  return true;
});

const Styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 10,
    height: 90,
    marginVertical: 5,
  },
  people: {
    flex: 1,
    alignItems: 'center',
  },
  amountView: {
    alignItems: 'center',
    flex: 2,
  },
  amountText: {},
  arrow: {
    marginBottom: 10,
    flex: 2,
    resizeMode: 'contain',
  },
});

export default OwingDetails;
