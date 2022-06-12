import React, {useState, useEffect, useRef} from 'react';
import {
  Animated,
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  LogBox,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import firestore from '@react-native-firebase/firestore';

import {
  Avatar,
  Chip,
  Button,
  TextInput,
  Title,
  HelperText,
  ActivityIndicator,
  Divider,
  Subheading,
  DefaultTheme,
  DarkTheme,
} from 'react-native-paper';

import AntDesign from 'react-native-vector-icons/AntDesign';

import {useTheme} from '@react-navigation/native';

LogBox.ignoreLogs(['Sending...']);

const JoinGroup = ({route, navigation}) => {
  // getStyles();
  const [groupData, setGroupData] = useState();

  const {colors} = useTheme();

  const getGroupDetails = async groupID => {
    let miniGroupData;
    let group = await firestore().collection('groups').doc(groupID).get();
    firestore()
      .collection('groups')
      .doc(groupID)
      .collection('members')
      .get()
      .then(membersSnapshot => {
        let memberNames = [];
        let memberRefs = [];
        membersSnapshot.forEach(async member => {
          let amountOfMembers = membersSnapshot.docs.length;
          //this gets the name of the user from their user profile, if the user profile exists
          if (member.data().ref) {
            let userDoc = await member.data().ref.get();
            memberNames.push(userDoc.data().Name);
            memberRefs.push(member.id);
            //if the names are different, update the name in the group
            if (userDoc.data().Name !== member.data().Name) {
              member.ref.update({Name: userDoc.data().Name});
            }
          } else {
            //otherwise it uses the name from group data
            memberNames.push(member.data().Name);
            memberRefs.push('');
          }

          if (memberNames.length >= amountOfMembers) {
            miniGroupData = {
              Name: group.data().Name,
              memberNames,
              memberRefs,
              id: groupID,
            };
            setGroupData(miniGroupData);
          }
        });
      });
  };

  const joinGroupAs = chosenName => {
    let groupRef = firestore().collection('groups').doc(groupData.id);
    groupRef
      .collection('members')
      .get()
      .then(membersSnapshot => {
        membersSnapshot.forEach(member => {
          if (member.data().Name == chosenName) {
            if (member.data().ref) {
              Alert.alert(
                'This member is already synced to a device.',
                'If you would like to sync to multiple devices, please go to settings and sync with an account.',
              );
            } else {
              let userRef = firestore()
                .collection('users')
                .doc(route.params.userID);
              member.ref.update({ref: userRef});
              //if on first launch
              if (route.params.groupIDs.length == 0) {
                DefaultTheme.setFirstLaunchPage(3);
              } else {
                DefaultTheme.refreshHome();
              }
              navigation.pop();
            }
          }
        });
      });
    firestore()
      .collection('groups')
      .doc(groupData.id)
      .update({
        memberIDs: firestore.FieldValue.arrayUnion(route.params.userID),
      });

    firestore()
      .collection('users')
      .doc(route.params.userID)
      .update({groups: firestore.FieldValue.arrayUnion(groupRef)});
  };

  const [joinGroupCode, setJoinGroupCode] = useState('');
  const [joinGroupError, setJoinGroupError] = useState('');
  const [joinGroupLoading, setJoinGroupLoading] = useState(false);

  const joinGroup = async () => {
    setJoinGroupError('');
    setJoinGroupLoading(true);
    if (joinGroupCode.length == 4) {
      let invite = await firestore()
        .collection('invitations')
        .doc(joinGroupCode)
        .get();
      if (invite && invite.exists) {
        if (route.params.groupIDs.includes(invite.data().groupID)) {
          Alert.alert('You are already a member of this group');
        } else {
          getGroupDetails(invite.data().groupID);
        }
        setJoinGroupLoading(false);
      } else {
        setJoinGroupError('Group code is invalid');
        setJoinGroupCode('');
        setJoinGroupLoading(false);
      }
    } else {
      setJoinGroupError('Group code must be four characters long');
      setJoinGroupCode('');
      setJoinGroupLoading(false);
    }
  };
  return (
    <>
      <View style={{padding: 16, height: '100%', zIndex: 2}}>
        <Button
          onPress={() => {
            navigation.pop();
          }}>
          Close
        </Button>
        {/* <Divider style={styles.divider} /> */}
        <KeyboardAwareScrollView style={{flex: 1}}>
          <Title>Join Existing Group</Title>
          <View style={{flexDirection: 'row', borderRadius: 10, padding: 10}}>
            <TextInput
              disabled={groupData}
              value={joinGroupCode}
              style={{flex: 1, padding: 10, height: 40}}
              onChangeText={newGroupCode => {
                setJoinGroupCode(newGroupCode);
              }}
              onSubmitEditing={joinGroup}
              label="Existing Group Code"
              mode="outlined"
            />
            {joinGroupLoading ? (
              <ActivityIndicator />
            ) : (
              <TouchableOpacity
                disabled={groupData}
                style={{alignSelf: 'center', paddingTop: 5}}
                onPress={joinGroup}>
                <AntDesign
                  name="right"
                  style={[
                    groupData ? {color: 'lightgray'} : {color: colors.primary},
                    {fontSize: 30},
                  ]}
                />
              </TouchableOpacity>
            )}
            <HelperText
              visible={joinGroupError.length > 0}
              style={{
                alignSelf: 'flex-end',
                position: 'absolute',
                paddingLeft: 20,
                color: colors.error,
              }}>
              {joinGroupError}
            </HelperText>
          </View>

          {groupData ? (
            <View style={{alignContent: 'center'}}>
              <Title style={{textAlign: 'center'}}>
                Joining {groupData.Name}
              </Title>
              <Subheading style={{textAlign: 'center'}}>
                Please select your name from the options below
              </Subheading>
              <View
                style={{
                  margin: 5,
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                {groupData.memberNames.map((item, index) => {
                  return (
                    <Chip
                      style={[
                        groupData.memberRefs[
                          groupData.memberNames.indexOf(item)
                        ]
                          ? {opacity: 0.5}
                          : null,
                        {backgroundColor: 'white', borderWidth: 0},
                      ]}
                      key={index}
                      mode="outlined" //changing display mode, default is flat.
                      height={30} //give desirable height to chip
                      textStyle={{color: colors.text, fontSize: 15}} //label properties
                      onPress={() => {
                        joinGroupAs(item);
                      }}>
                      {item}
                    </Chip>
                  );
                })}
              </View>
            </View>
          ) : null}
        </KeyboardAwareScrollView>
      </View>
    </>
  );
};

export default JoinGroup;
