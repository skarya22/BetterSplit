import React, {useRef, useEffect, useState} from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  TextInput,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Avatar,
  DefaultTheme,
  Subheading,
  Chip,
  Button,
  FAB,
} from 'react-native-paper';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {TextInput as PaperTextInput} from 'react-native-paper';
import {useTheme} from '@react-navigation/native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import firestore from '@react-native-firebase/firestore';

const EditGroupScreen = ({route, navigation}) => {
  const scaleEmoji = useRef(new Animated.Value(0)).current;
  const [groupEmoji, setGroupEmoji] = useState(route.params.groupEmoji);
  const [groupName, setGroupName] = useState(route.params.groupName);
  const [groupBackgroundColor, setGroupBackgroundColor] = useState(
    route.params.groupBackgroundColor,
  );
  const [groupColors, setGroupColors] = useState([
    route.params.groupBackgroundColor,
  ]);
  const [memberNames, setMemberNames] = useState(route.params.memberNames);
  const [userRefs, setUserRefs] = useState(route.params.userRefs);
  const [newMember, setNewMember] = useState('');

  const {colors} = useTheme();
  let colorPickerRef = useRef();
  DefaultTheme.setGroupEmoji = setGroupEmoji;
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
  return (
    <KeyboardAwareScrollView style={{height: '100%'}}>
      <View style={{flexDirection: 'row', alignSelf: 'center'}}>
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
                backgroundColor: groupBackgroundColor,
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
          style={{
            fontSize: 35,
            fontWeight: 'bold',
            borderBottomWidth: 1,
            borderColor: colors.text,
            width: '60%',
            marginRight: 20,
            textAlign: 'center',
          }}
          autoCapitalize="words"
          onChangeText={newGroupName => {
            setGroupName(newGroupName);
          }}
        />
      </View>
      <TouchableOpacity
        style={{alignSelf: 'center', margin: 20}}
        onPress={() => {
          const randomColor =
            'rgb(' +
            Math.floor(Math.random() * 256) +
            ',' +
            Math.floor(Math.random() * 256) +
            ',' +
            Math.floor(Math.random() * 256) +
            ')';
          setGroupBackgroundColor(randomColor);
          setGroupColors([...groupColors, randomColor]);
        }}>
        <Chip
          mode="outlined"
          icon={props => {
            return <AntDesign name="swap" {...props} />;
          }}>
          New group colour
        </Chip>
      </TouchableOpacity>
      <ScrollView
        ref={colorPickerRef}
        onContentSizeChange={() => {
          colorPickerRef.current.scrollToEnd({animated: true});
        }}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
        style={{alignSelf: 'center'}}>
        {groupColors.length > 1 &&
          groupColors.map(color => {
            return (
              <TouchableOpacity
                onPress={() => {
                  setGroupBackgroundColor(color);
                }}>
                <Chip
                  height={30}
                  style={{
                    backgroundColor: color,
                    marginHorizontal: 5,
                    borderColor: 'black',
                    borderWidth: 1,
                  }}>
                  {' '}
                </Chip>
              </TouchableOpacity>
            );
          })}
      </ScrollView>

      <View style={{alignSelf: 'center'}}>
        <Subheading style={{textAlign: 'center'}}>
          Manage Group Members:
        </Subheading>
        <Text style={{textAlign: 'center'}}>
          To edit your own name, go to settings
        </Text>
      </View>
      {memberNames.map((memberName, index) => {
        return (
          <View
            key={index}
            style={{
              marginTop: 10,
              width: '60%',
              alignSelf: 'center',
              textAlign: 'center',
            }}>
            <PaperTextInput
              style={{height: 40}}
              value={memberName}
              mode="outlined"
              autoCapitalize="words"
              autoCorrect={false}
              onChangeText={newName => {
                let newMemberNames = [...memberNames];
                newMemberNames[index] = newName;
                setMemberNames(newMemberNames);
              }}
              disabled={userRefs[index] != '' && userRefs[index] != 'new'}
            />
            {userRefs[index] == '' ||
              (userRefs[index] == 'new' && (
                <TouchableOpacity
                  onPress={() => {
                    let newMemberNames = memberNames;
                    newMemberNames.splice(index, 1);
                    setMemberNames([...newMemberNames]);
                    let newUserRefs = userRefs;
                    newUserRefs.splice(index, 1);
                    setUserRefs(newUserRefs);
                  }}
                  style={{
                    position: 'absolute',
                    right: 10,
                    alignSelf: 'center',
                    top: 12.5,
                  }}>
                  <AntDesign size={25} name="close" />
                </TouchableOpacity>
              ))}
            {memberName != route.params.memberNames[index] &&
              userRefs[index] != 'new' && (
                <TouchableOpacity
                  onPress={() => {
                    let newMemberNames = [...memberNames];
                    newMemberNames[index] = route.params.memberNames[index];
                    setMemberNames(newMemberNames);
                  }}
                  style={{
                    position: 'absolute',
                    right: 10,
                    alignSelf: 'center',
                    top: 12.5,
                  }}>
                  <AntDesign size={25} name="back" />
                </TouchableOpacity>
              )}
          </View>
        );
      })}
      <PaperTextInput
        mode="outlined"
        label="Add New Group Member"
        value={newMember}
        style={{
          margin: 10,
          height: 40,
          width: '60%',
          alignSelf: 'center',
          textAlign: 'center',
        }}
        onChangeText={newName => {
          setNewMember(newName);
        }}
        onSubmitEditing={() => {
          if (newMember.trim().length > 0) {
            setMemberNames([...memberNames, newMember]);
            setNewMember('');
            setUserRefs([...userRefs, 'new']);
          }
        }}
      />
      <Button
        onPress={() => {
          Alert.alert(
            'Leave Group',
            'Are you sure you would like to leave the group? To rejoin, another member (if any) will need to share a join group code with you. ',
          );
        }}
        mode="outlined"
        style={{alignSelf: 'center'}}
        labelStyle={{color: '#ff8c8c'}}>
        Leave Group
      </Button>
      <FAB
        style={{
          borderRadius: 20,
          marginTop: 20,
          alignSelf: 'center',
          backgroundColor: groupBackgroundColor,
        }}
        onPress={() => {
          let failedATest = false;
          let trimmedNames = [...memberNames];
          trimmedNames.forEach((memberName, index) => {
            trimmedNames[index] = memberName.trim();
          });
          let changedSomething = false;

          trimmedNames.forEach((memberName, index) => {
            if (memberName != route.params.memberNames[index] && !failedATest) {
              if (
                trimmedNames.indexOf(memberName) !=
                trimmedNames.lastIndexOf(memberName)
              ) {
                Alert.alert('Names must be different');
                failedATest = true;
              } else if (userRefs[index] != 'new') {
                changedSomething = true;
                let memberRef =
                  route.params.memberRefs[
                    route.params.memberNames.indexOf(
                      route.params.memberNames[index],
                    )
                  ];
                firestore()
                  .collection('groups')
                  .doc(route.params.groupID)
                  .collection('members')
                  .doc(memberRef)
                  .update({Name: memberName});
              }
            }
          });
          if (userRefs.includes('new') && !failedATest) {
            userRefs.forEach((userRef, index) => {
              if (userRef == 'new') {
                changedSomething = true;
                const newUser = firestore()
                  .collection('groups')
                  .doc(route.params.groupID)
                  .collection('members')
                  .doc();
                newUser.set({
                  Name: trimmedNames[index],
                });
              }
            });
          }

          if (!failedATest && groupName != route.params.groupName) {
            if (groupName.trim().length == 0) {
              failedATest = true;
              Alert.alert('Group must have a name');
            } else {
              changedSomething = true;
              firestore()
                .collection('groups')
                .doc(route.params.groupID)
                .update({Name: groupName.trim()});
            }
          }
          if (!failedATest && groupEmoji != route.params.groupEmoji) {
            changedSomething = true;
            firestore()
              .collection('groups')
              .doc(route.params.groupID)
              .update({groupEmoji: groupEmoji});
          }
          if (
            !failedATest &&
            groupBackgroundColor != route.params.groupBackgroundColor
          ) {
            changedSomething = true;
            firestore()
              .collection('groups')
              .doc(route.params.groupID)
              .update({backgroundColor: groupBackgroundColor});
          }
          if (changedSomething && !failedATest) {
            DefaultTheme.refresh();
            Alert.alert('Successfully edited group details');
          }
        }}
        label={'Submit changes'}></FAB>
    </KeyboardAwareScrollView>
  );
};

export default EditGroupScreen;
