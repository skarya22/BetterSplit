import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import emoji from 'emoji-datasource';

export const Categories = {
  emotion: {
    symbol: '🥰',
    name: 'Smileys & Emotion',
  },
  people: {
    symbol: '🧍🏽',
    name: 'People & Body',
  },
  nature: {
    symbol: '🦄',
    name: 'Animals & Nature',
  },
  food: {
    symbol: '🍔',
    name: 'Food & Drink',
  },
  activities: {
    symbol: '⚾️',
    name: 'Activities',
  },
  places: {
    symbol: '✈️',
    name: 'Travel & Places',
  },
  objects: {
    symbol: '💡',
    name: 'Objects',
  },
  symbols: {
    symbol: '🔣',
    name: 'Symbols',
  },
  flags: {
    symbol: '🏳️‍🌈',
    name: 'Flags',
  },
};

const charFromUtf16 = utf16 =>
  String.fromCodePoint(...utf16.split('-').map(u => '0x' + u));
export const charFromEmojiObject = obj => charFromUtf16(obj.unified);
const filteredEmojis = emoji.filter(e => !e['obsoleted_by']);
const emojiByCategory = category =>
  filteredEmojis.filter(e => e.category === category);
const sortEmoji = list => list.sort((a, b) => a.sort_order - b.sort_order);
const categoryKeys = Object.keys(Categories);

const TabBar = ({theme, activeCategory, onPress}) => {
  const tabSize = 50;

  return categoryKeys.map(c => {
    const category = Categories[c];
    return (
      <TouchableOpacity
        key={category.name}
        onPress={() => onPress(category)}
        style={{
          flex: 1,
          height: tabSize,
          borderColor: category === activeCategory ? theme : '#EEEEEE',
          borderBottomWidth: 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text
          style={{
            textAlign: 'center',
            paddingBottom: 8,
            fontSize: tabSize - 24,
          }}>
          {category.symbol}
        </Text>
      </TouchableOpacity>
    );
  });
};

const EmojiCell = ({emoji, colSize, ...other}) => (
  <TouchableOpacity
    activeOpacity={0.5}
    style={{
      width: colSize,
      height: colSize,
      alignItems: 'center',
      justifyContent: 'center',
    }}
    {...other}>
    <Text style={{color: '#FFFFFF', fontSize: colSize - 20}}>
      {charFromEmojiObject(emoji)}
    </Text>
  </TouchableOpacity>
);

export default class EmojiSelector extends React.PureComponent {
  state = {
    category: Categories.people,
    isReady: false,

    emojiList: null,
    colSize: 0,
    width: 0,
  };

  //
  //  HANDLER METHODS
  //
  handleTabSelect = category => {
    if (this.state.isReady) {
      if (this.scrollview)
        this.scrollview.scrollToOffset({x: 0, y: 0, animated: false});
      this.setState({
        category,
      });
    }
  };

  handleEmojiSelect = emoji => {
    this.props.onEmojiSelected(charFromEmojiObject(emoji));
  };

  //
  //  RENDER METHODS
  //
  renderEmojiCell = ({item}) => (
    <EmojiCell
      key={item.key}
      emoji={item.emoji}
      onPress={() => this.handleEmojiSelect(item.emoji)}
      colSize={this.state.colSize}
    />
  );

  returnSectionData() {
    const {emojiList, category} = this.state;
    let emojiData = (function () {
      let list;
      const name = category.name;
      list = emojiList[name];
      let emojiListeroni = [];
      for (let emoji in list) {
        emojiListeroni.push(list[emoji].unified);
      }

      return list.map(emoji => ({key: emoji.unified, emoji}));
    })();
    return emojiData;
  }

  prerenderEmojis() {
    let emojiList = {};

    categoryKeys.forEach(c => {
      let name = Categories[c].name;
      emojiList[name] = sortEmoji(emojiByCategory(name));
      this.setState({isReady: true});
    });

    this.setState({
      emojiList,
      colSize: Math.floor(this.state.width / this.props.columns),
    });
  }

  handleLayout = ({nativeEvent: {layout}}) => {
    this.setState({width: layout.width}, () => {
      this.prerenderEmojis();
    });
  };

  //
  //  LIFECYCLE METHODS
  //
  componentDidMount() {
    const {category} = this.props;
    this.setState({category});
  }

  render() {
    const {
      theme,
      columns,
      placeholder,

      showSectionTitles,
      showTabs,
      ...other
    } = this.props;

    const {category, colSize, isReady} = this.state;

    const title = category.name;

    return (
      <View style={styles.frame} {...other} onLayout={this.handleLayout}>
        <View style={styles.tabBar}>
          {showTabs && (
            <TabBar
              activeCategory={category}
              onPress={this.handleTabSelect}
              theme={theme}
              width={this.state.width}
            />
          )}
        </View>
        <View style={{flex: 1}}>
          {isReady ? (
            <View style={{flex: 1}}>
              <View style={styles.container}>
                {showSectionTitles && (
                  <Text style={styles.sectionHeader}>{title}</Text>
                )}
                <FlatList
                  horizontal={false}
                  overScrollMode="always"
                  contentContainerStyle={{paddingBottom: colSize}}
                  data={this.returnSectionData()}
                  renderItem={this.renderEmojiCell}
                  numColumns={columns}
                  ref={scrollview => (this.scrollview = scrollview)}
                  removeClippedSubviews
                />
              </View>
            </View>
          ) : (
            <View style={styles.loader} {...other}>
              <ActivityIndicator
                size={'large'}
                color={Platform.OS === 'android' ? theme : '#000000'}
              />
            </View>
          )}
        </View>
      </View>
    );
  }
}

EmojiSelector.defaultProps = {
  theme: '#007AFF',
  category: Categories.all,
  showTabs: true,

  showSectionTitles: true,
  columns: 6,
};

const styles = StyleSheet.create({
  frame: {
    flex: 1,
    width: '100%',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
  },

  container: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionHeader: {
    margin: 8,
    fontSize: 17,
    width: '100%',
    color: '#8F8F8F',
  },
});
