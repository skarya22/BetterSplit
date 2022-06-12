import React from 'react';
import {View} from 'react-native';
import OwingDetails from '../components/OwingDetails';

const EditPaymentScreen = ({route, navigation}) => {
  return (
    <View>
      <OwingDetails
        userName={route.params.userName}
        owes={route.params.paymentFrom}
        owed={route.params.paymentTo}
        amount={parseFloat(route.params.paymentAmount).toFixed(2)}
        groupBackgroundColor={route.params.groupBackgroundColor}
        date={route.params.date}
      />
    </View>
  );
};

export default EditPaymentScreen;
