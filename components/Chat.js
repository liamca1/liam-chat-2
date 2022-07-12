import React from 'react';
import { Bubble, GiftedChat, InputToolbar } from 'react-native-gifted-chat';
import {
    View,
    Text,
    Platform,
    KeyboardAvoidingView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import CustomActions from './CustomActions';
import MapView from 'react-native-maps';

const firebase = require('firebase');
require('firebase/firestore');

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
            },
            isConnected: false,
            image: null,
            location: null,
        }

        //configurations to allow this app to connect to Cloud Firestore database
        const firebaseConfig = {
          apiKey: "AIzaSyAncrMnSo3WMZ_oiynJUTTer8R9jqnwkTo",
          authDomain: "chatting-662a0.firebaseapp.com",
          projectId: "chatting-662a0",
          storageBucket: "chatting-662a0.appspot.com",
          messagingSenderId: "793346999188", 
          appId: "1:793346999188:web:18fd5f3d0fea709a24c581",
          measurementId: "G-YSGVZ4QCKR"
        };

        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        this.referenceChatMessages = firebase
            .firestore()
            .collection("messages");
        this.referenceUserMessages = null;
    }

    // OFFLINE: Create functions to display messages when user is offline
    // 1. Save messages to async storage
    async saveMessages() {
        try {
            await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
        } catch (error) {
            console.log(error.message);
        }
    }

    // 2. Retrieve messages from async storage
    async getMessages() {
        let messages = '';
        try {
            messages = await AsyncStorage.getItem('messages') || [];
            this.setState({
                messages: JSON.parse(messages)
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    // 3. Delete messages from async storage (for development purposes only)
    async deleteMessages() {
        try {
            await AsyncStorage.removeItem('messages');
            this.setState({
                messages: []
            })
        } catch (error) {
            console.log(error.message);
        }
    }

    componentDidMount() {

        let name = this.props.route.params.name;
        this.props.navigation.setOptions({ title: name });

        NetInfo.fetch().then(connection => {
            if (connection.isConnected) {
                console.log('online');
                this.setState({ isConnected: true });

                // create a reference to the active user's messages
                this.referenceChatMessages = firebase.firestore().collection("messages");

                // listens for updates in the collection
                this.unsubscribe = this.referenceChatMessages.onSnapshot(this.onCollectionUpdate)

                // user can sign in anonimously
                this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
                    if (!user) {
                        await firebase.auth().signInAnonymously();
                    }
                    //update user state with currently active user data
                    this.setState({
                        uid: user.uid,
                        messages: [],
                        user: {
                            _id: user.uid,
                            name: name,
                            avatar: "https://placeimg.com/140/140/any",
                        },
                    });
                    // listens for updates in the collection
                    this.unsubscribe = this.referenceChatMessages
                        .orderBy("createdAt", "desc")
                        .onSnapshot(this.onCollectionUpdate);
                    // create a reference to the active user's documents (shopping lists)
                    this.referenceUserMessages = firebase
                        .firestore()
                        .collection('messages')
                        .where("uid", "==", this.state.uid);
                });
                // save messages when online
                this.saveMessages();
            } else {
                console.log('offline');
                this.setState({ isConnected: false });
                this.getMessages();
            }
        });
    }

    componentWillUnmount() {
        this.unsubscribe();
        this.authUnsubscribe();
    }

    // appends the new message a user just sent to the state messages so it can be displayed in chat
    onSend(messages = []) {
        this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, messages),
        }), () => {
            this.addMessages();
            this.saveMessages();
        });
    }

    onCollectionUpdate = (querySnapshot) => {
        const messages = [];
        // go through each document
        querySnapshot.forEach((doc) => {
            // get the QueryDocumentSnapshot's data
            let data = doc.data();
            messages.push({
                _id: data._id,
                text: data.text,
                createdAt: data.createdAt.toDate(),
                user: {
                    _id: data.user._id,
                    name: data.user.name,
                    avatar: data.user.avatar,
                },
                image: data.image || null,
                location: data.location || null,
            });
        });
        this.setState({
            messages: messages,
        });

        this.saveMessages();
    };

    addMessages() {
        const message = this.state.messages[0];
        console.log('message:', message)
        this.referenceChatMessages.add({
            _id: message._id,
            text: message.text || "",
            createdAt: message.createdAt,
            user: this.state.user,
            image: message.image || null,
            location: message.location || null,
        });
    }

    // ------------  Styles the text bubble 
    renderBubble(props) {
        return (
            <Bubble
                {...props}
                wrapperStyle={{
                    right: {
                        backgroundColor: '#ffda79',
                        color: '#000'
                    },
                    left: {
                        backgroundColor: '#f7f1e3',
                        color: '#000'
                    }
                }}
            />
        )
    }

    // renderInputToolbar comes from GiftedChat
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

    renderCustomView(props) {
        const { currentMessage } = props;
        if (currentMessage.location) {
            return (
                <View style={{ borderRadius: 13, overflow: 'hidden', margin: 3 }}>
                    <MapView
                        style={{ width: 150, height: 100 }}
                        region={{
                            latitude: currentMessage.location.latitude,
                            longitude: currentMessage.location.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    />
                </View>
            );
        }
        return null;
    }

    renderCustomActions = (props) => {
        return <CustomActions {...props} />;
    }



    render() {
        let name = this.props.route.params.name;
        this.props.navigation.setOptions({ title: name });

        const { bgColor } = this.props.route.params;

        return (
            <View style={{
                flex: 1,
                // justifyContent: 'center',
                // alignItems: 'center',
                backgroundColor: bgColor
            }}>
                <GiftedChat
                    renderBubble={this.renderBubble.bind(this)}
                    renderInputToolbar={this.renderInputToolbar.bind(this)}
                    renderActions={this.renderCustomActions}
                    renderCustomView={this.renderCustomView}
                    messages={this.state.messages.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))}
                    onSend={messages => this.onSend(messages)}
                    user={{
                        _id: this.state.user._id,
                        name: this.state.name,
                        avatar: this.state.user.avatar
                    }}
                />
                {/* KeyboardAvoidingView fixes some Android phones error (hiding input window)*/}
                {Platform.OS === 'android' ?
                    <KeyboardAvoidingView behavior='height' /> : null
                }
            </View>
        );
    };
}