/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
  AsyncStorage,
  ScrollView,
  TextInput,
} from 'react-native';

import SmsAndroid from 'react-native-get-sms-android';

export default class App extends Component {
  state = {
    fun: null,
    urls: [],
    newUrl: null,
    loading: false,
  };

  _storeData = async (tag, value) => {
    try {
      await AsyncStorage.setItem(tag, value);
    } catch (error) {
      // Error saving data
    }
  };
  _retrieveData = async (tag) => {
    try {
      const value = await AsyncStorage.getItem(tag);
      if (value !== null) {
        // We have data!!
        console.log(value);
        return value;
      }
    } catch (error) {
      // Error retrieving data
    }
  };

  send = (n, t) => {
    SmsAndroid.autoSend(
      n,
      t,
      (fail) => {
        console.log('Failed with this error: ' + fail);
      },
      (success) => {
        console.log('SMS sent successfully');
      },
    );
  };
  add = async () => {
    if (this.state.newUrl) {
      var newUrl = this.state.newUrl;
      var urls = await this._retrieveData('urls');
      if (!urls) {
        await this._storeData('urls', '["www.google.com"]');
        urls = await this._retrieveData('urls');
      }
      urls = JSON.parse(urls);

      urls.push(newUrl);

      urls = JSON.stringify(urls);

      await this._storeData('urls', urls);
      this.getData();
    }
  };
  delete = async (t) => {
    var urls = await this._retrieveData('urls');
    if (!urls) {
      await this._storeData('urls', '[]');
      urls = await this._retrieveData('urls');
    }
    urls = JSON.parse(urls);
    for (var i in urls) {
      if (urls[i] === t) {
        urls.splice(i, 1);
        break;
      }
    }
    urls = JSON.stringify(urls);
    await this._storeData('urls', urls);
    this.getData();
  };

  getJSON = (url, callback) => {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function () {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };

    xhr.send();
  };

  getData = async () => {
    var urls = await this._retrieveData('urls');
    if (!urls) {
      await this._storeData('urls', '["www.google.com"]');
      urls = await this._retrieveData('urls');
    }

    this.setState({
      urls: JSON.parse(urls),
    });
  };
  async componentDidMount() {
    this.getData();
  }

  start = () => {
    this.setState({
      loading: true,
    });
    this.state.fun = setInterval(() => {
      this.state.urls.map((url) => {
        this.getJSON(url, async (s, d) => {
          console.log(d);
          for (var i in d) {
            var number = d[i].number;
            var text = d[i].text;
            this.send(number, text);
          }
        });
      });
    }, 5000);
  };

  stop = () => {
    this.setState({
      loading: false,
    });
    console.log(this.state.fun);

    clearInterval(this.state.fun);
  };

  render() {
    return (
      <ScrollView>
        <View
          style={{
            height: Dimensions.get('screen').height,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {this.state.urls.map((d) => {
            return (
              <View
                style={{
                  width: Dimensions.get('screen').width,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 2,
                  paddingLeft: 25,
                  paddingRight: 25,
                }}>
                <View
                  style={{
                    alignItems: 'center',
                    height: 40,
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      maxWidth: '80%',
                    }}>
                    {d}
                  </Text>
                </View>
                <View
                  style={{
                    width: '20%',
                    backgroundColor: '#f00',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 40,
                  }}>
                  <TouchableOpacity onPress={() => this.delete(d)}>
                    <Text>delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          <View
            style={{
              flexDirection: 'row',
              width: '100%',
              justifyContent: 'center',
              margin: 15,
            }}>
            <TextInput
              style={{
                width: '70%',
                height: 40,
                borderWidth: 1,
                borderColor: '#00000050',
              }}
              onChange={(d) => {
                this.setState({
                  newUrl: d.nativeEvent.text,
                });
              }}
            />
            <View
              style={{
                width: '20%',
                backgroundColor: '#0f0',
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
              }}>
              <TouchableOpacity onPress={() => this.add()}>
                <Text>add</Text>
              </TouchableOpacity>
            </View>
          </View>
          {this.state.loading ? (
            <ImageBackground
              source={require('./assets/4V0b.gif')}
              style={{
                margin: 5,
                width: 80,
                height: 80,
              }}
            />
          ) : null}
          <View
            style={{
              flexDirection: 'row',
            }}>
            <View
              style={{
                width: '20%',
                backgroundColor: '#f00',
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
              }}>
              <TouchableOpacity onPress={() => this.stop()}>
                <Text>Stop</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                width: '20%',
                backgroundColor: '#0f0',
                alignItems: 'center',
                justifyContent: 'center',
                height: 40,
              }}>
              <TouchableOpacity onPress={() => this.start()}>
                <Text>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
}
