import React, {useState, useEffect} from 'react';

import {
  Image,
  FlatList,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';

import {
  List,
  Avatar,
  FAB,
  Text,
  Subheading,
  DefaultTheme,
  Card,
} from 'react-native-paper';

import {SafeAreaView} from 'react-native-safe-area-context';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {ThemeProvider, useTheme} from '@react-navigation/native';
import SpendingGraph from '../components/SpendingGraph';

const dim = Dimensions.get('screen');

const HomeScreen = ({navigation, route}) => {
  const [loading, setLoading] = useState(false); //this decides whether to show ActivityIndicator or the FlatList
  const [groupData, setgroupData] = useState(route.params.groupData); //this holds the data from all the groups
  const [groupIDs, setGroupIDs] = useState(route.params.groupIDs); //this holds the IDs of all groups the person is in

  const {colors} = useTheme();

  const refresh = () => {
    setLoading(true);

    DefaultTheme.getGroups(
      setLoading,
      setgroupData,
      setGroupIDs,
      route.params.userID,
    );
  };

  DefaultTheme.refreshHome = refresh;

  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      <SafeAreaView style={{marginVertical: 20, height: '100%'}}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'stretch',
          }}>
          <Text
            style={{
              marginLeft: 10,
              color: colors.text,
              fontSize: 30,
              fontWeight: 'bold',
              flex: 10,
            }}>
            BetterSplit
          </Text>
          <TouchableOpacity
            style={{
              padding: 5,
              marginRight: 10,
            }}
            onPress={() => {
              navigation.push('Settings');
            }}>
            <AntDesign name="setting" size={30} color={colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (DefaultTheme.graphData.length == 0) {
              navigation.push('PersonalDetails', {...route.params});
            }
          }}
          activeOpacity={0.9}
          style={{
            marginVertical: 10,
          }}>
          {DefaultTheme.graphData[0] ? (
            <SpendingGraph graphData={DefaultTheme.graphData[0]} />
          ) : (
            <Card>
              <Card.Content>
                <Subheading>No spending details yet for this month</Subheading>
              </Card.Content>
            </Card>
          )}
          {/* <Card
            style={{
              marginHorizontal: 10,
              elevation: 3,
              borderRadius: 20,
            }}>
            <Card.Content>
              <>
                <Subheading style={{textAlign: 'center'}}>
                  Personal Spending Details
                </Subheading>
                <View
                  style={{
                    marginVertical: 10,
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                  {DefaultTheme.graphData[0] && (
                    <Pie
                      radius={60}
                      sections={DefaultTheme.graphData[0].sections}
                    />
                  )}
                </View>
              </>
            </Card.Content>
          </Card> */}
        </TouchableOpacity>
        <FlatList
          showsVerticalScrollIndicator={false}
          onRefresh={() => {
            refresh();
          }}
          refreshing={loading}
          data={groupData}
          ListEmptyComponent={() => {
            return (
              <>
                <Image
                  source={require('../assets/undraw_no_groups.png')}
                  style={{
                    width: dim.width,
                    height: dim.height / 5,
                    resizeMode: 'contain',
                    marginVertical: 20,
                  }}
                />
                <Subheading style={{textAlign: 'center'}}>
                  No groups loaded{'\n'}
                  Please create or join a group
                </Subheading>
              </>
            );
          }}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => {
                navigation.push('GroupDetails', {
                  groupName: item.Name,
                  groupID: item.key,
                  memberNames: item.memberNames,
                  memberRefs: item.memberRefs,
                  groupEmoji: item.groupEmoji,
                  memberNamesAsString: item.memberNamesAsString,
                  groupBackgroundColor: item.backgroundColor,
                  userRefs: item.userRefs,
                });
              }}>
              <List.Item
                style={{
                  margin: 5,
                  borderRadius: 15,
                }}
                title={item.Name}
                description={item.memberNamesAsString}
                left={() => {
                  return (
                    <Avatar.Text
                      style={[
                        item.backgroundColor
                          ? {backgroundColor: item.backgroundColor}
                          : 'purple',
                        {
                          borderRadius: 20,
                        },
                      ]}
                      size={55}
                      label={item.groupEmoji}
                      labelStyle={{fontSize: 35, color: 'black'}}
                    />
                  );
                }}
                right={() => {
                  return (
                    <>
                      <AntDesign
                        name="right"
                        size={20}
                        color={colors.backdrop}
                        style={{alignSelf: 'center'}}
                      />
                    </>
                  );
                }}
              />
            </TouchableOpacity>
          )}
          ListFooterComponent={() => {
            return <View style={{marginBottom: 10}}></View>;
          }}
        />
      </SafeAreaView>
      <FAB.Group
        open={fabOpen}
        icon={
          fabOpen
            ? props => {
                return <AntDesign {...props} name="close" />;
              }
            : props => {
                return <AntDesign {...props} name="plus" />;
              }
        }
        onStateChange={() => setFabOpen(!fabOpen)}
        actions={[
          {
            icon: props => {
              return <AntDesign {...props} name="addusergroup" />;
            },
            label: 'Create Group',
            onPress: () =>
              navigation.push('AddGroup', {
                userName: route.params.userName,
                userID: route.params.userID,
                groupIDs,
              }),
          },
          {
            icon: props => {
              return <AntDesign {...props} name="export2" />;
            },
            label: 'Join Group',
            onPress: () =>
              navigation.push('JoinGroup', {
                userName: route.params.userName,
                userID: route.params.userID,
                groupIDs,
              }),
          },
          {
            icon: props => {
              return <AntDesign {...props} name="creditcard" />;
            },
            label: 'Quick transaction',
            onPress: () =>
              navigation.push('QuickTransaction', {
                userName: route.params.userName,
                userID: route.params.userID,
              }),
          },
        ]}
      />
    </>
  );
};

export default HomeScreen;
