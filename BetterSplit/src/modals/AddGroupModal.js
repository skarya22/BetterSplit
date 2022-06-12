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
  Subheading,
  DefaultTheme,
} from 'react-native-paper';

import {useTheme} from '@react-navigation/native';

LogBox.ignoreLogs(['Sending...']);
const AddGroupModal = ({navigation, route}) => {
  getStyles();

  const {colors} = useTheme();

  const [groupName, setGroupName] = useState('');

  const [nextName, setNextName] = useState('');

  const scaleEmoji = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleEmoji, {
        useNativeDriver: true,
        toValue: 1.2,
        duration: 500,
      }),
      Animated.timing(scaleEmoji, {
        useNativeDriver: true,
        toValue: 1,
        duration: 500,
      }),
    ]).start();
  }, []);

  const [groupEmoji, setGroupEmoji] = useState('🤪');
  const [randomColor] = useState(
    'rgb(' +
      Math.floor(Math.random() * 256) +
      ',' +
      Math.floor(Math.random() * 256) +
      ',' +
      Math.floor(Math.random() * 256) +
      ')',
  );
  DefaultTheme.setGroupEmoji = setGroupEmoji;

  const [memberNames, setMemberNames] = useState([]);
  const [memberNameError, setMemberNameError] = useState('');

  const submitMemberName = () => {
    if (
      memberNames.includes(nextName.trim()) ||
      nextName.trim() == route.params.userName
    ) {
      setMemberNameError('Names must be unique');
    } else if (nextName.trim().length < 1) {
      setMemberNameError('Name must not be blank');
    } else {
      setNextName('');
      setMemberNameError('');
      setMemberNames([...memberNames, nextName.trim()]);
    }
  };

  let addGroupMemberRef = React.createRef();

  return (
    <View style={styles.panelView}>
      <Button
        onPress={() => {
          navigation.pop();
        }}>
        Close
      </Button>
      {/* <Divider style={styles.divider} /> */}
      <KeyboardAwareScrollView style={{flex: 1}}>
        {/* Create New Group */}
        <Title>Create New Group</Title>
        <View style={styles.inputView}>
          <TouchableOpacity
            style={{paddingHorizontal: 20, alignSelf: 'center'}}
            onPress={() => {
              navigation.navigate('EmojiSelector');
            }}>
            <Animated.View
              style={{
                transform: [{scaleX: scaleEmoji}, {scaleY: scaleEmoji}],
              }}>
              <Avatar.Text
                style={{
                  backgroundColor: randomColor,
                  borderRadius: 20,
                }}
                size={55}
                label={groupEmoji}
                labelStyle={{fontSize: 35, color: 'black'}}
              />
            </Animated.View>
          </TouchableOpacity>
          <TextInput
            value={groupName}
            style={styles.input}
            autoCapitalize="words"
            onChangeText={newGroupName => {
              setGroupName(newGroupName);
            }}
            onSubmitEditing={() => {
              addGroupMemberRef.focus();
            }}
            returnKeyType="next"
            label="Group name"
            mode="outlined"
          />
        </View>

        {/* Group Members */}
        <View style={styles.memberView}>
          <Subheading style={{textAlign: 'center'}}>
            Add Group Members
          </Subheading>
          <View style={{flexDirection: 'row', paddingRight: 5}}>
            <TextInput
              ref={ref => (addGroupMemberRef = ref)}
              autoCapitalize="words"
              onChangeText={newName => {
                setMemberNameError('');
                setNextName(newName);
              }}
              style={styles.input}
              value={nextName}
              label="Name"
              mode="outlined"
              onSubmitEditing={submitMemberName}
            />
            <TouchableOpacity
              style={styles.arrowView}
              onPress={submitMemberName}>
              <Title>➕</Title>
            </TouchableOpacity>
          </View>

          <View
            style={{
              margin: 5,
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
            <Chip
              mode="outlined" //changing display mode, default is flat.
              height={30} //give desirable height to chip
              style={{backgroundColor: 'transparent', borderWidth: 0}}
              textStyle={{color: colors.disabled, fontSize: 15}} //label properties
              onPress={() => {
                Alert.alert('Cannot make a group without yourself');
              }}>
              {route.params.userName}
            </Chip>
            {memberNames.map((item, index) => {
              return (
                <Chip
                  style={{borderWidth: 0}}
                  key={index}
                  mode="outlined" //changing display mode, default is flat.
                  height={30} //give desirable height to chip
                  textStyle={{color: colors.text, fontSize: 15}} //label properties
                  onPress={() => {
                    setMemberNameError('');
                    if (item !== route.params.userName) {
                      setMemberNames(
                        memberNames.filter(value => value !== item),
                      );
                    } else {
                      Alert.alert('Cannot make a group without yourself');
                    }
                  }}>
                  {item != route.params.userName ? '➖ ' + item : item}
                </Chip>
              );
            })}
          </View>
          <HelperText
            style={{
              alignSelf: 'center',
              color: colors.error,
              padding: 0,
            }}
            visible={memberNameError.length > 0}>
            {memberNameError}
          </HelperText>
        </View>
        <Button
          mode="text"
          onPress={() => {
            if (groupName.length == 0) {
              Alert.alert('Please enter a group name');
            } else if (memberNames.length == 0) {
              Alert.alert('Please add another member');
            } else {
              const docRef = firestore().collection('groups').doc();

              docRef.set({
                Name: groupName.trim(),
                lastModified: firestore.Timestamp.now(),
                dateCreated: firestore.Timestamp.now(),
                memberIDs: [route.params.userID],
                groupEmoji: groupEmoji,
                backgroundColor: randomColor,
              });
              //add the group to the user document array called 'groups'

              firestore()
                .collection('users')
                .doc(route.params.userID)
                .update({
                  groups: firestore.FieldValue.arrayUnion(docRef),
                });

              //add the user to the members collection with reference
              let ref = firestore()
                .collection('users')
                .doc(route.params.userID);
              docRef
                .collection('members')
                .add({Name: route.params.userName, ref: ref});

              memberNames.forEach(memberName => {
                docRef.collection('members').add({Name: memberName});
              });
              if (route.params.firstLaunch) {
                DefaultTheme.setFirstLaunchPage(3);
              } else {
                DefaultTheme.refreshHome();
              }
              navigation.pop();
            }
          }}>
          Submit Group
        </Button>
      </KeyboardAwareScrollView>
    </View>
  );
};
let styles;
const getStyles = () => {
  const {colors} = useTheme();
  styles = StyleSheet.create({
    emojiView: {
      flexDirection: 'row',
      padding: 10,
    },
    panelView: {
      padding: 16,
      height: '100%',
      zIndex: 2,
    },
    divider: {
      margin: 15,
      marginTop: 25,
      backgroundColor: colors.text,
    },
    closeButton: {
      fontSize: 30,

      paddingTop: 10,
      color: colors.text,
    },
    arrowView: {alignSelf: 'center', paddingTop: 5},
    inputView: {
      flexDirection: 'row',
      borderRadius: 10,
      padding: 10,
    },
    memberView: {
      borderRadius: 10,
      padding: 10,
      marginTop: 10,
    },
    input: {flex: 1, padding: 10, height: 40},
  });
};

export default AddGroupModal;
