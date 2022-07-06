import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, Text, TouchableOpacity, View, ViewPropTypes } from 'react-native';
//imports for communicatios features (permission and device camera/image gallery)
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';
import { InputToolbar, Actions, Composer, Send } from 'react-native-gifted-chat';

import "firebase/firestore";
import firebase from "firebase";

export default class CustomActions extends React.Component {

  state = {
    image: null,
    location: null
  }

  //to select an existing picture

  imagePicker = async () => {
    // ask for permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    try {
      if (status === 'granted') {
        // pick image
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images, // only images are allowed
        }).catch((error) => console.log(error));
        // canceled process
        if (!result.cancelled) {
          const imageUrl = await this.uploadImage(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //to take a picture

  takePhoto = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();

    try {
      if (status === 'granted') {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
        }).catch((error) => console.log(error));

        if (!result.cancelled) {
          const imageUrl = await this.uploadImageFetch(result.uri);
          this.props.onSend({ image: imageUrl });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //to get user location

  getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    try {
      if (status === 'granted') {
        const result = await Location.getCurrentPositionAsync({}).catch(
          (error) => console.log(error)
        );

        if (result) {
          this.props.onSend({
            location: {
              longitude: result.coords.longitude,
              latitude: result.coords.latitude,
            },
          });
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  //When you press the '+' button

  onActionPress = () => {
    const options = ['Choose From Library', 'Take Picture', 'Send Location', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    console.log(this.context)
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      async (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            console.log('user wants to pick an image');
            return this.imagePicker();
          case 1:
            console.log('user wants to take a photo');
            return this.takePhoto();
          case 2:
            console.log('user wants to get their location');
            return this.getLocation();
        }
      },
    );
  };

   //Upload images to firestore

   uploadImageFetch = async (uri) => {
    // create XMLHttpRequest and set its responseType to 'blob'.
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      //open the connection and get the URI’s data (the image)
      xhr.open('GET', uri, true);
      xhr.send(null);
    });

    const imageNameBefore = uri.split('/');
    const imageName = imageNameBefore[imageNameBefore.length - 1];
    //reference to the image in which you put the blob data:
    const ref = firebase.storage().ref().child(`images/${imageName}`);
    //store the content retrieved from the Ajax request:
    const snapshot = await ref.put(blob);
    // close connection:
    blob.close();
    //get image URL from storage:
    return await snapshot.ref.getDownloadURL();
  };

  render() {
    return (
      <TouchableOpacity 
        accessible={true}
        style={[styles.container]} 
        onPress={this.onActionPress} 
        accessibilityLabel="more options" 
        accessibilityHint="Choose to send an image or your geolocation">
        <View style={[styles.wrapper, this.props.wrapperStyle]}>
          <Text style={[styles.iconText, this.props.iconTextStyle]}>+</Text>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
});

CustomActions.contextTypes = {
  actionSheet: PropTypes.func,
};