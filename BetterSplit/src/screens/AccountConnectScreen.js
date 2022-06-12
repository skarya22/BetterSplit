import React, {useState, useEffect} from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import {
  Title,
  Text,
  Subheading,
  Card,
  Button,
  TextInput,
  DefaultTheme,
  Dialog,
  Portal,
} from 'react-native-paper';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import AntDesign from 'react-native-vector-icons/AntDesign';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const AccountConnectScreen = ({navigation, route}) => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [methods, setMethods] = useState([]);
  GoogleSignin.configure({
    webClientId:
      '860908123496-rb9m3uk2jvid797ka4ld2qb0ef43jtku.apps.googleusercontent.com',
  });
  useEffect(() => {
    getMethods();
  }, []);

  const getMethods = async () => {
    if (auth().currentUser && auth().currentUser.email) {
      setMethods(
        await auth().fetchSignInMethodsForEmail(auth().currentUser.email),
      );
    }
  };
  async function loginEmailUser() {
    if (emailAddress.length == 0) {
      Alert.alert('', 'Please enter a valid email address');
    } else if (password.length == 0) {
      Alert.alert('', 'Please enter a password');
    } else {
      auth()
        .signInWithEmailAndPassword(emailAddress, password)
        .then(() => {
          if (auth().currentUser.emailVerified) {
            Alert.alert('', 'Successfully signed in.');
            DefaultTheme.refresh();
          } else {
            Alert.alert(
              '',
              'Please verify your account by pressing the link in your email, and try again.',
              [
                {
                  text: 'Resend verification',
                  onPress: () => {
                    auth().currentUser.sendEmailVerification();
                  },
                },
              ],
            );
            auth().signOut;
          }
        })
        .catch(error => {
          Alert.alert('', error.toString());
        });
    }
  }
  async function createEmailUser() {
    if (emailAddress.length == 0) {
      Alert.alert('', 'Please enter a valid email address');
    } else if (password.length == 0) {
      Alert.alert('', 'Please enter a password');
    } else if (password != password2) {
      Alert.alert('', 'Passwords do not match.');
    } else {
      var credential = auth.EmailAuthProvider.credential(
        emailAddress,
        password,
      );
      auth()
        .currentUser.linkWithCredential(credential)
        .then(() => {
          auth().currentUser.sendEmailVerification();
          Alert.alert(
            'Success!',
            'New account created. Please verify your email',
          );
          getMethods();
          setShowEmailInput(false);
        })
        .catch(error => {
          Alert.alert('', error.toString());
        });
    }
  }
  async function onGoogleButtonPress() {
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    if (auth().currentUser) {
      // Sign-in the user with the credential
      // return auth().signInWithCredential(googleCredential);
      auth()
        .currentUser.linkWithCredential(googleCredential)
        .then(() => {
          Alert.alert('', 'Successfully verified with Google.');
          getMethods();
        })
        .catch(error => {
          Alert.alert('', error.toString());
        });
    } else {
      auth()
        .signInWithCredential(googleCredential)
        .then(async user => {
          let firestoreUser = await firestore()
            .collection('users')
            .doc(user.user.uid)
            .get();
          if (firestoreUser.data()) {
            DefaultTheme.refresh();
            Alert.alert('', 'Successfully connected with Google. Welcome back');
          } else {
            firestoreUser.ref.set({
              Name: user.user.displayName,
              dateCreated: firestore.Timestamp.now(),
              groups: [],
              lastOpen: firestore.Timestamp.now(),
              resetDate: 1,
            });
            DefaultTheme.refresh();
            Alert.alert(
              '',
              'Successfully connected with Google. Welcome to BetterSplit',
            );
            //SOMEHOW GO TO THE REST OF INTRO
          }
        });
    }
  }

  const SigninButton = text => {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          alignSelf: 'center',
          margin: 5,
          elevation: 3,
          width: '70%',
          alignContent: 'center',
          justifyContent: 'center',
        }}
        onPress={() => {
          if (text == 'Password') {
            setShowEmailInput(true);
          } else if (text == 'Google') {
            onGoogleButtonPress();
          }
        }}>
        <Card
          style={{
            backgroundColor: '#ffffff',
            width: '100%',
            borderRadius: 15,
            borderColor: '#fff',
            borderWidth: 0.5,
            alignContent: 'center',
            justifyContent: 'center',
          }}>
          <Card.Content style={{paddingVertical: 5}}>
            <View
              style={{
                flexDirection: 'row',
                alignContent: 'center',
              }}>
              {text == 'Apple' && <AntDesign name="apple1" size={25} />}
              {text == 'Google' && <AntDesign name="google" size={25} />}
              {text == 'Password' && <AntDesign name="star" size={25} />}
              <Subheading
                style={{
                  marginLeft: 15,
                  marginRight: 20,
                  alignSelf: 'center',
                }}>
                {text}
              </Subheading>
              <Button
                style={{
                  position: 'absolute',
                  right: 10,
                  alignSelf: 'center',
                }}>
                Connect
              </Button>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };
  return (
    <>
      <Portal>
        <Dialog
          style={{borderRadius: 20}}
          visible={showEmailInput}
          onDismiss={() => {
            setShowEmailInput(false);
            setPassword('');
            setEmailAddress('');
            setPassword2('');
          }}>
          <View style={{margin: 20}}>
            {!route.params.isFirstLaunch ? (
              <>
                <Text>
                  Use this email and password combination on your other device
                  to connect
                </Text>
                <TextInput
                  onChangeText={newText => {
                    setEmailAddress(newText);
                  }}
                  value={emailAddress}
                  label="Email"
                  style={{
                    height: 40,
                    width: '100%',
                    alignSelf: 'center',
                  }}
                  mode="outlined"
                />
                <TextInput
                  onChangeText={newText => {
                    setPassword(newText);
                  }}
                  value={password}
                  label="Password"
                  style={{
                    height: 40,
                    width: '100%',
                    alignSelf: 'center',
                  }}
                  mode="outlined"
                />
                <TextInput
                  onChangeText={newText => {
                    setPassword2(newText);
                  }}
                  value={password2}
                  label="Confirm password"
                  style={{
                    height: 40,
                    width: '100%',
                    alignSelf: 'center',
                  }}
                  mode="outlined"
                  // onSubmitEditing={createEmailUser}
                />
                <Button
                  onPress={() => {
                    createEmailUser();
                  }}>
                  Create account
                </Button>
              </>
            ) : (
              <>
                <Title>Previous Account</Title>
                <TextInput
                  onChangeText={newText => {
                    setEmailAddress(newText);
                  }}
                  value={emailAddress}
                  label="Email"
                  style={{
                    height: 40,
                    width: '100%',
                    alignSelf: 'center',
                  }}
                  mode="outlined"
                />
                <TextInput
                  onChangeText={newText => {
                    setPassword(newText);
                  }}
                  value={password}
                  label="Password"
                  style={{
                    height: 40,
                    width: '100%',
                    alignSelf: 'center',
                  }}
                  mode="outlined"
                />
                <Button
                  onPress={() => {
                    loginEmailUser();
                  }}>
                  Log in
                </Button>
                <Button
                  onPress={() => {
                    auth()
                      .sendPasswordResetEmail(emailAddress)
                      .then(() => {
                        Alert.alert(
                          'Email sent to ' + emailAddress,
                          'Please check your email for a reset password link',
                        );
                      });
                  }}>
                  forgot password?
                </Button>
              </>
            )}
          </View>
        </Dialog>
      </Portal>
      <ScrollView
        contentContainerStyle={{
          justifyContent: 'center',
          alignContent: 'center',
          height: '80%',
        }}>
        <Subheading
          style={{
            textAlign: 'center',
          }}>
          With BetterSplit, you can sync your groups between multiple devices.
        </Subheading>
        {methods.length == 0 && (
          <>
            <Title style={{textAlign: 'center'}}>Create account with:</Title>
            {SigninButton('Password')}
            {SigninButton('Google')}
            {SigninButton('Apple')}
          </>
        )}
        {methods.length > 0 && (
          <>
            <Text style={{textAlign: 'center'}}>
              Login on other devices using the email, {auth().currentUser.email}{' '}
              and {auth().currentUser.providerData[0].providerId} login
            </Text>
            {auth().currentUser.providerData[0].providerId == 'password' && (
              <Button
                onPress={() => {
                  if (emailAddress.length > 0) {
                    auth()
                      .sendPasswordResetEmail(auth().currentUser.email)
                      .then(() => {
                        Alert.alert(
                          '',
                          'Please check your email for a reset password link',
                        );
                      });
                  } else {
                    Alert.alert('', 'Please enter a valid email address.');
                  }
                }}>
                Change Password
              </Button>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
};

export default AccountConnectScreen;
