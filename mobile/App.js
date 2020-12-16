import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableWithoutFeedback,
} from 'react-native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
import {GiftedChat} from 'react-native-gifted-chat';
import {View as AView} from 'react-native-animatable';
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
const _backendEndpoint = 'https://tcc-intern.herokuapp.com';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: '',
      status: '',
      userPayload: '',
      userSession: '',
      gifted: [],
      answers: [],
      color: '#fff',
      animation: '',
      times: 0,
    };

    Voice.onSpeechStart = this.onSpeechStartHandler;
    Voice.onSpeechEnd = this.onSpeechEndHandler;
    Voice.onSpeechResults = this.onSpeechResultsHandler;
    Tts.setDefaultLanguage('pt-BR');
  }

  componentDidMount() {
    this.getSession();
    StatusBar.setHidden(true);
    Voice.start('pt-BR');
    Tts.voices().then((voices) => {
      if (voices[0].language == 'pt-BR') {
        console.log(voices[0].name);
      }
    });
  }

  getSession = async () => {
    const response = await axios.get(
      `${_backendEndpoint}/api/session`,
      this.state.userPayload,
    );
    this.init(response.data);
  };

  init = async (session) => {
    try {
      const initialPayload = {
        input: {
          message_type: 'text',
          text: '',
        },
      };
      let response = await axios.post(`${_backendEndpoint}/api/message`, {
        ...initialPayload,
        ...session,
      });

      this.setState({userSession: session});
      this.setState({userPayload: response.data});
    } catch (err) {
      console.log('Failed to retrive data from Watson API', err);
    }
  };

  async onSend(messages = []) {
    this.setState((previousState) => ({
      gifted: GiftedChat.append(previousState.gifted, messages),
    }));
    this.setState({text: messages[0].text});
    await this.sendTextMessage(messages[0].text);
  }

  onSpeechResultsHandler = async (result) => {
    let messages = [
      {
        _id: Math.round(Math.random() * 1000000),
        text: result.value[0],
        createdAt: new Date(),
        user: {
          _id: 1,
        },
      },
    ];
    this.setState((previousState) => ({
      gifted: GiftedChat.append(previousState.gifted, messages),
    }));
    this.setState({text: result.value[0]});
    await this.sendMessage(result.value[0]);
  };

  onSpeechStartHandler = () => {
    this.setState({status: 'Listening...'});
  };

  onSpeechEndHandler = () => {
    this.setState({status: 'Voice Processed'});
    this.setState({color: '#fff'});
    this.setState({animation: ''});
    this.setState({times: 'infinite'});
  };

  onStartButtonPress = (e) => {
    Voice.start('pt-BR');
    this.setState({color: '#7F4BEF'});
    this.setState({animation: 'zoomIn'});
    this.setState({times: 'infinite'});
  };

  onStopButtonPress = async (e) => {
    Voice.stop();
    Tts.stop();
  };

  sendMessage = async (payload) => {
    try {
      let {userSession} = this.state;
      let inputPayload = {
        input: {
          message_type: 'text',
          text: payload,
        },
      };

      let responseData = {...inputPayload, ...userSession};
      let response = await axios.post(
        `${_backendEndpoint}/api/message`,
        responseData,
      );

      let answers = [
        {
          _id: Math.round(Math.random() * 1000000),
          text: response.data.output.generic[0].text,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Your Assistant',
          },
        },
      ];
      this.setState((previousState) => ({
        gifted: GiftedChat.append(previousState.gifted, answers),
      }));
      await Tts.speak(response.data.output.generic[0].text);
      Tts.addEventListener('tts-finish', (event) => {
        Voice.start('pt-BR');
        this.setState({color: '#7F4BEF'});
        this.setState({animation: 'zoomIn'});
        this.setState({times: 'infinite'});
      });
    } catch (err) {
      console.log('Failed to send data to Watson API', err);
    }
  };

  sendTextMessage = async (payload) => {
    try {
      let {userSession} = this.state;
      let inputPayload = {
        input: {
          message_type: 'text',
          text: payload,
        },
      };

      let responseData = {...inputPayload, ...userSession};
      let response = await axios.post(
        `${_backendEndpoint}/api/message`,
        responseData,
      );

      let answers = [
        {
          _id: Math.round(Math.random() * 1000000),
          text: response.data.output.generic[0].text,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'Your Assistant',
          },
        },
      ];
      this.setState((previousState) => ({
        gifted: GiftedChat.append(previousState.gifted, answers),
      }));
    } catch (err) {
      console.log('Failed to send data to Watson API', err);
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.line}>
          <Text style={styles.welcome}>Assistant</Text>
        </View>
        <Text style={styles.sub}>
          Add and edit task and track your students performace!
        </Text>
        <GiftedChat
          renderAvatar={null}
          messages={this.state.gifted}
          placeholder="Type here..."
          onSend={(messages) => this.onSend(messages)}
          user={{
            _id: 1,
          }}
          renderActions={() => {
            return (
              <TouchableWithoutFeedback
                style={styles.mic}
                onPressIn={(e) => this.onStartButtonPress(e)}
                onPressOut={(e) => this.onStopButtonPress(e)}>
                <AView
                  animation={this.state.animation}
                  easing="ease-in-out-back"
                  iterationCount={this.state.times}
                  style={styles.mic}>
                  <Icon name="mic" size={20} color={this.state.color} />
                </AView>
              </TouchableWithoutFeedback>
            );
          }}
        />
      </View>
    );
  }
}
export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C2035',
  },
  line: {
    alignItems: 'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    borderTopWidth: 1,
    borderTopColor: '#7F4BEF',
    marginTop: 30,
    marginBottom: 10,
    paddingTop: 10,
    color: '#7F4BEF',
    fontFamily: 'Ubuntu-Regular',
    justifyContent: 'center',
    width: '70%',
  },
  sub: {
    fontSize: 13,
    textAlign: 'center',
    color: '#ffffff',
    fontFamily: 'Roboto-Thin',
    marginBottom: 20,
  },
  mic: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
