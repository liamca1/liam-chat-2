// Import React component
import React, { Component } from 'react';
// Import the relevant components from react native
import { View, Platform, KeyboardAvoidingView, StyleSheet, Button } from "react-native";
import { GiftedChat, Bubble, InputToolbar, MessageText, Time } from "react-native-gifted-chat";
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import MapView from 'react-native-maps';
import firebase from "firebase/app";
import firestore from 'firebase';
import "firebase/firestore";
// import firestore from 'firebase';

import CustomActions from './CustomActions';

// Chat component
export default class Chat extends React.Component {

  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
        image: null,
        location: null,
      },
      isConnected: false,
      image: null,
      location: null
    };

    // Firebase config
  const firebaseConfig = {
    apiKey: "AIzaSyDwN5LbUbk-okNSOglccAkDHj3y0kSK_Rc",
    authDomain: "chat-app-34b87.firebaseapp.com",
    projectId: "chat-app-34b87",
    storageBucket: "chat-app-34b87.appspot.com",
    messagingSenderId: "47713140270",
    appId: "1:47713140270:web:5fad0a12bd064b08b369bf",
    measurementId: "G-2HKP3T6D8C"
  };

  // Initialise firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Create a reference to the firestore messages collection databse
  this.referenceChatMessages = firebase.firestore().collection("messages");
  // this.referenceMessagesUser= null;
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    // go through each document
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      var data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: {
          _id: data.user._id,
          name: data.user.name,
          avatar: data.user.avatar
        },
        image: data.image || null,
        location: data.location || null,
      });
    });
    this.setState({
      messages: messages,
    });
  };

  // Custom communications features (CustomActions)
  renderCustomActions = (props) => { return <CustomActions {...props} /> };

  // Add messages to the database
  addMessages() {
    const message = this.state.messages[0];

    this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || "",
      createdAt: message.createdAt,
      user: message.user,
      image: message.image || "",
      location: message.location || null,
    });
  }

  // Delete messages from AsyncStorage
  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.messages);
    }
  }

  // Save messages to AsyncStorage
  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.messages);
    }
  }

  // Calls saveMessage (when a message is sent)
  onSend(messages = []) {
    this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }), () => {
      this.addMessages();
      this.saveMessages();
    });
  }

  // Component
  componentDidMount() {
    // Display the users name in title
    const { name } = this.props.route.params;
    this.props.navigation.setOptions({ title: name });
    // Takes a snapshot of the Firestone Database messages collection
    this.referenceChatMessages = firebase.firestore().collection('messages');
    this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate)
    // Check that the user is connected
    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        this.setState({ isConnected: true });
        console.log('online');
      } else {
        console.log('offline');
      }
    
      // Firebase — User authentication
      this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
          firebase.auth().signInAnonymously();
        }
        this.setState({
          uid: user.uid,
          messages: [],
          user: {
            _id: user.uid,
            name: name,
            avatar: "https://placeimg.com/140/140/any",
          },
        });
        this.referenceMessagesUser = firebase
          .firestore()
          .collection("messages")
          .where("uid", "==", this.state.uid);

          this.saveMessages();
        this.unsubscribe = this.referenceChatMessages
          .orderBy("createdAt", "desc")
          .onSnapshot(this.onCollectionUpdate);
      });
    });
  }

// If the user is offline, then gets messages from AsyncStorage
async getMessages() {
  let messages = '';
  try {
    messages = await AsyncStorage.getItem('messages') || [];
    this.setState({
      messages: JSON.parse(messages)
    });
  } catch (error) {
    console.log(error.messages);
  }
};

// Close connections when user is connected
componentWillUnmount() {
  if (this.state.isConnected) {
    this.authUnsubscribe();
  }
}

//Disable sending new messages when offline
renderInputToolbar(props) {
  if (this.state.isConnected == false) {
  } else {
      return (
          <InputToolbar
              {...props}
          />
      );
  }
}

// User color / bubble color
renderBubble(props) {
  return (
      <Bubble
          {...props}
          wrapperStyle={{
              right: {
                  backgroundColor: 'blue'
              },
              left: {
                  backgroundColor: 'white'
              }
          }}
      />
  )
}

// Map View
renderCustomView(props) {
  const { currentMessage } = props;
  if (currentMessage.location) {
      return (
          <MapView
              style={{
                  width: 150,
                  height: 100,
                  borderRadius: 13,
                  margin: 3
              }}
              region={{
                  latitude: currentMessage.location.latitude,
                  longitude: currentMessage.location.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
              }}
          />
      );
  }
  return null;
}

  render() {
    let bgColor = this.props.route.params.color;
    return (
      <View style={{ flex: 1, backgroundColor: bgColor }}>
        <GiftedChat
        renderCustomView={this.renderCustomView}
        renderActions={this.renderCustomActions}
        renderBubble={this.renderBubble.bind(this)}
        renderUsernameOnMessage={true}
        renderInputToolbar={this.renderInputToolbar.bind(this)}
        messages={this.state.messages}
        onSend={messages => this.onSend(messages)}
        user={{
            _id: this.state.user._id,
            name: this.state.user.name,
            avatar: this.state.user.avatar
        }}
      />
      <Button title="Go to home" onPress={() => this.props.navigation.navigate("Start")} />
      {Platform.OS === "android" ? ( <KeyboardAvoidingView behavior="height" /> ) : null}
      </View>
    );
  }
}