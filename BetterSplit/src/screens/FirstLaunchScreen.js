import React, {useRef, useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Subheading,
  Headline,
  TextInput,
  DefaultTheme,
  FAB,
  Chip,
  Snackbar,
} from 'react-native-paper';

import AntDesign from 'react-native-vector-icons/AntDesign';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
// import {useTheme} from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScrollView} from 'react-native-gesture-handler';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const dim = Dimensions.get('screen');

const FirstLaunchScreen = ({navigation}) => {
  const [name, setName] = useState('');
  let userID = '';

  const pagerViewRef = useRef();
  let nameInputRef = React.createRef();
  const first = () => {
    return (
      <ScrollView
        key={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        {/* TITLE TEXT */}
        <Headline style={styles.welcomeText}>Welcome to BetterSplit</Headline>
        <Subheading style={styles.welcomeText}>
          A better way to split finances
        </Subheading>
        {/* IMAGE */}
        <Image
          source={require('../assets/undraw_Successful_purchase_re_mpig.png')}
          style={{
            width: dim.width,
            height: dim.height / 3,
            alignSelf: 'center',
            resizeMode: 'contain',
            zIndex: -1,
            margin: 50,
          }}
        />

        {/* BUTTON */}
        <TouchableOpacity
          onPress={() => {
            pagerViewRef.current.setPage(1);
          }}>
          <FAB
            style={{
              zIndex: 1,
              alignSelf: 'center',
              height: 40,
              justifyContent: 'center',
            }}
            label="Get Started"
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            Platform.OS == 'android' ? {marginBottom: 10} : null,
            {
              position: 'absolute',
              bottom: 0,
              width: '100%',
            },
          ]}
          onPress={() => {
            navigation.push('AccountConnect', {isFirstLaunch: true});
          }}>
          <Subheading style={{textAlign: 'center'}}>
            Already used BetterSplit before?
          </Subheading>
        </TouchableOpacity>
      </ScrollView>
    );
  };
  const second = () => {
    return (
      <KeyboardAwareScrollView
        key={2}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <Subheading style={{textAlign: 'center'}}>
          Before we get started,
        </Subheading>
        <Headline style={{textAlign: 'center'}}>what's your name?</Headline>
        <TextInput
          autoCorrect={false}
          mode="outlined"
          ref={ref => {
            nameInputRef = ref;
          }}
          label="Name"
          style={{
            zIndex: 0,
            height: 40,
            width: '75%',
            alignSelf: 'center',
            marginVertical: 50,
          }}
          onChangeText={newName => {
            setName(newName);
          }}
          autoCapitalize="words"
          onSubmitEditing={() => {
            auth()
              .signInAnonymously()
              .then(user => {
                firestore().collection('users').doc(user.user.uid).set({
                  Name: name,
                  dateCreated: firestore.Timestamp.now(),
                  groups: [],
                  lastOpen: firestore.Timestamp.now(),
                  resetDate: 1,
                });
                userID = user.user.uid;
                pagerViewRef.current.setPage(2);
              });
          }}
        />
        <Image
          source={require('../assets/undraw_select_player_64ca.png')}
          style={{
            width: dim.width,
            height: dim.height / 3,
            alignSelf: 'center',
            resizeMode: 'contain',
            zIndex: -1,
          }}
        />
        <TouchableOpacity
          style={[
            Platform.OS == 'android' ? {marginBottom: 10} : null,
            {
              position: 'absolute',
              bottom: 0,
              width: '100%',
            },
          ]}
          onPress={() => {
            pagerViewRef.current.setPage(0);
          }}>
          <Subheading style={{textAlign: 'center'}}>Go back</Subheading>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    );
  };
  const third = () => {
    return (
      <ScrollView
        key={3}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        {/* <Headline style={{textAlign: 'center'}}>Welcome, {name}</Headline>undraw_Sync_re_492g */}
        <Subheading
          style={{
            textAlign: 'center',
            marginHorizontal: '10%',
          }}>
          With BetterSplit, you can sync up groups with other member's devices.
        </Subheading>
        <Image
          source={require('../assets/undraw_Sync_re_492g.png')}
          style={{
            width: dim.width,
            height: dim.height / 3,
            alignSelf: 'center',
            resizeMode: 'contain',
            zIndex: -1,
            marginVertical: 40,
          }}
        />

        <View
          style={{flexDirection: 'row', alignSelf: 'center', marginTop: 20}}>
          <TouchableOpacity
            style={{marginRight: 15}}
            onPress={() => {
              DefaultTheme.setFirstLaunchPage = pagerViewRef.current.setPage;
              navigation.push('JoinGroup', {
                userName: name,
                userID: userID,
                groupIDs: [],
              });
            }}>
            <Chip mode="outlined">Join an existing group</Chip>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              DefaultTheme.setFirstLaunchPage = pagerViewRef.current.setPage;
              navigation.push('AddGroup', {
                userName: name,
                userID: userID,
                firstLaunch: true,
              });
            }}>
            <Chip mode="outlined">Create a new group</Chip>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const fourth = () => {
    return (
      <ScrollView
        key={4}
        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
        <Headline style={{textAlign: 'center'}}>
          Welcome to BetterSplit,
        </Headline>
        <Headline style={{textAlign: 'center'}}>{name}!</Headline>
        <Image
          source={require('../assets/undraw_Balloons_re_8ymj.png')}
          style={{
            width: dim.width,
            height: dim.height / 3,
            alignSelf: 'center',
            resizeMode: 'contain',
            zIndex: -1,
            marginVertical: 40,
          }}
        />
        <TouchableOpacity
          onPress={() => {
            DefaultTheme.refresh(userID);
          }}
          style={{alignSelf: 'center', marginTop: 15}}>
          <FAB label="Continue to Home Screen" />
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <PagerView
        scrollEnabled={false}
        showPageIndicator={false}
        initialPage={0}
        onPageSelected={e => {
          if (e.nativeEvent.position == 1) {
            nameInputRef.focus();
          }
        }}
        style={{flex: 1}}
        ref={pagerViewRef}>
        {first()}
        {second()}
        {third()}
        {fourth()}
        <View key={5}></View>
      </PagerView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  welcomeText: {textAlign: 'center'},
});

export default FirstLaunchScreen;
