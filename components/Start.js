import React from 'react';
import { StyleSheet, View, Text, TextInput, ImageBackground, TouchableOpacity, Pressable } from 'react-native';


import BackgroundImage from "../assets/img/chat-app-bg.png";

export default class Start extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            bgColor: this.colors.blue,
        }
    }

    changeBgColor = (newColor) => {
        this.setState({ bgColor: newColor });
    }

    colors = {
        black: "#993333",
        purple: "#996633",
        grey: "#99cc99",
        green: "#99ffcc",
        blue: "#1B70A0",
    };

    render() {
        return (

            <View style={styles.container}>
                <ImageBackground
                    source={BackgroundImage}
                    resizeMode="cover"
                    style={styles.backgroundImage}
                >
                    <View style={styles.titleBox}>
                        <Text style={styles.title}>Conversations</Text>
                    </View>
                    <View style={styles.box}>
                        <TextInput
                            style={styles.inputBox}
                            onChangeText={(name) => this.setState({ name })}
                            placeholder="Hello, whats your name?"
                        />

                        <Text>
                            Choose Background Color:
                        </Text>
                        <View style={styles.colorsBox}>
                            <TouchableOpacity
                                style={styles.color1}
                                onPress={() => this.changeBgColor(this.colors.black)}
                            >
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.color2}
                                onPress={() => this.changeBgColor(this.colors.purple)}
                            >
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.color3}
                                onPress={() => this.changeBgColor(this.colors.grey)}
                            >
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.color4}
                                onPress={() => this.changeBgColor(this.colors.green)}
                            >
                            </TouchableOpacity>
                        </View>
                        <Pressable
                            style={styles.button}
                            onPress={() =>
                                this.props.navigation.navigate("Chat", {
                                    name: this.state.name,
                                    bgColor: this.state.bgColor,
                                })
                            }
                        >
                            <Text style={styles.buttonText}>
                                Join conversations
                            </Text>
                        </Pressable>
                    </View>
                </ImageBackground>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Background Image styling
    backgroundImage: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    // App title
    titleBox: {
        height: "50%",
        width: "88%",
        alignItems: "center",
        // backgroundColor: 'transparent'
    },
    title: {
        fontSize: 45,
        fontWeight: '600',
        color: '#ffffff',
        marginTop: '25%'
    },
    // UI box
    box: {
        backgroundColor: 'white',
        borderRadius: 15,
        width: '88%',
        height: '44%',
        bottom: '6%',
        padding: '6%',
        justifyContent: 'space-between',
  
        },
    inputBox: {
        height: '20%',
        borderWidth: 1,
        borderColor: 'black',
        padding: 10,
        borderRadius: 7,
        fontSize: 16,
        fontWeight: '300',
        color: '#757083',
        opacity: 0.5
    },
    // colors
    colorsBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    color1: {
        backgroundColor: "#993333",
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    color2: {
        backgroundColor: "#996633",
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    color3: {
        backgroundColor: "#99cc99",
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    color4: {
        backgroundColor: "#99ffcc",
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    // Chat button
    button: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'back',
        height: '20%',
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center'
    }

});