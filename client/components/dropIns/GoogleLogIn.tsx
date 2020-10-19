/* eslint-disable no-console */
import * as Google from 'expo-google-app-auth';
import React from 'react';
import {
  View,
  StyleSheet,
  AsyncStorage,
  Image,
  Text,
} from 'react-native';
import { Button } from 'react-native-elements';
import { useTheme } from 'react-native-paper';
import axios from 'axios';

export default function GoogleLogIn({
  setIsUserLoggedIn,
  setIsTruckOwnerLoggedIn,
  setOwnerGoogleId,
  setAccessToken,
}) {
  const userConfig = {
    iosClientId: process.env.EXPO_iosClientId,
    androidClientId: process.env.EXPO_androidClientId,
    scopes: ['profile', 'email'],
  };

  const truckConfig = {
    iosClientId: process.env.EXPO_iosClientId,
    androidClientId: process.env.EXPO_androidClientId,
    scopes: ['profile', 'email'],
  };

  const storeData = async(dataKey, dataValue) => {
    try {
      await AsyncStorage.setItem(dataKey, dataValue);
    } catch (error) {
      console.log(error);
    }
  };

  async function signUserInWithGoogleAsync(configuration: Object) {
    try {
      const result = await Google.logInAsync(configuration);
      if (result.type === 'success') {
        storeData('userData', JSON.stringify(result));
        setIsUserLoggedIn(true);
        console.log('success in user login')

        axios.post(`${process.env.EXPO_LocalLan}/user/new`, {
          fullName: result.user.name,
          googleId: result.user.id,
          profilePhotoUrl: result.user.photoUrl,
        })
          .then((response) => {
            if (!response.data[1]) {
              console.log('You have logged in. Welcome Back!');
            } else {
              console.log('Account successfully registered');
            }
          })
          .catch((err) => console.log(err));

        return result.accessToken;
      }
      return { cancelled: true };
    } catch (e) {
      return { error: true };
    }
  }

  async function signTruckInWithGoogleAsync(configuration: Object) {
    try {
      const result = await Google.logInAsync(configuration);
      if (result.type === 'success') {
        storeData('ownerData', JSON.stringify(result));
        setAccessToken(result.accessToken);

        axios.post(`${process.env.EXPO_LocalLan}/truck/register`, {
          googleId: result.user.id,
        })
          .then((response) => {
            if (!response.data[1]) {
              console.log('You have logged in. Welcome Back!');
              setOwnerGoogleId(result.user.id);
              setIsTruckOwnerLoggedIn(true);
            } else {
              console.log('Truck successfully registered');
              setOwnerGoogleId(result.user.id);
              setIsTruckOwnerLoggedIn(true);
            }
          })
          .catch((err) => console.log(err));

        return result.accessToken;
      }
      return { cancelled: true };
    } catch (e) {
      return { error: true };
    }
  }

  const userSignIn = () => {
    signUserInWithGoogleAsync(userConfig);
  };

  const truckSignIn = () => {
    signTruckInWithGoogleAsync(truckConfig);
  };

  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.loginScreen,
    },
    title: {
      fontSize: 40,
      position: 'absolute',
      top: 50,
      fontWeight: 'bold',
      color: '#384E77',
    },
    truckGif: {
      width: 390,
      height: 200,
      marginBottom: 50,
    },
    buttonUser: {
      borderRadius: 15,
      padding: 15,
      marginBottom: 5,
      width: 300,
      backgroundColor: '#384E77',
    },
    buttonOwner: {
      borderRadius: 15,
      padding: 15,
      marginTop: 25,
      width: 300,
      backgroundColor: '#384E77',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Food Truck Forager</Text>
      <Image
        source={require('../../../assets/tacoTruck.gif')}
        style={styles.truckGif}
      />
      <View>
        <Button title="User Sign In" onPress={userSignIn} buttonStyle={styles.buttonUser} />
      </View>
      <View>
        <Button title="Truck Owner Sign In" onPress={truckSignIn} buttonStyle={styles.buttonOwner} />
      </View>
    </View>
  );
}
