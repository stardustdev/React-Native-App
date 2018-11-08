import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Navigator,
    AsyncStorage,
    Linking
} from 'react-native';
import { Platform } from 'react-native';

import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from "react-native-fcm";

import LoginView from './components/login/login-view';
import LoggedView from './components/profile/logged-view';
import AppointmentsView from './components/appointments/appointments-view';
import NewAppointmentView from './components/appointments/new-appointment-view';
import TrendingView from './components/news/trending-view';
import PostView from './components/news/post-view';
import ProductsView from './components/products/products-view';
import ProductView from './components/products/product-view';
import CheckOut from './components/products/check-out';
import ShippingView from './components/products/shippings';
import PushController from "./components/login/PushController";
import TermsView from "./components/login/terms-view";
import HomeView from './components/home/home-view';
import Chat from './components/chat/chat';
import TranslateFile from './translate/translate';

export default class Magnifique extends Component {
    props: {
        navigator: Navigator
        };

    onChangeToken = (token)=>{
        AsyncStorage.setItem("FCMToken",token)
        AsyncStorage.setItem("NewFCMToken",'true')
    }

    async componentDidMount() {

        //Translate
        var translateFile = new TranslateFile();
        var translateFileLang = translateFile.setLang("");

        await AsyncStorage.setItem("NewFCMToken",'false')
        await AsyncStorage.removeItem("FCMToken")
        var FCMToken = await AsyncStorage.getItem("FCMToken")

        //if (FCMToken) return null;

        FCM.requestPermissions();

        FCM.getFCMToken().then(token => {
            console.log("TOKEN (getFCMToken)", token);
            this.onChangeToken(token);
        });

        if(Platform.OS === 'ios'){
            FCM.getAPNSToken().then(token => {
                console.log("APNS TOKEN (getFCMToken)", token);
            });
        }

        FCM.getInitialNotification().then(notif => {
            console.log("INITIAL NOTIFICATION", notif)

            //OPEN URL
            var url = notif.url;
            console.log("INITIAL NOTIFICATION notif.url", url)
            if(url!="" && url!==undefined){
                Linking.canOpenURL(url).then(supported => {
                    if (supported) {
                        Linking.openURL(url);
                    }else{
                        console.log("Don't know how to open URI: " + url);
                    }
                });
            }
        });

        this.notificationListener = FCM.on(FCMEvent.Notification, notif => {
            console.log("Notification", notif);

            //if(notif.local_notification){
                FCM.presentLocalNotification({
                    vibrate: 500,
                    title: notif.fcm.title,
                    body: notif.fcm.body,
                    action: notif.fcm.action,
                    urlType: notif.urlType,
                    url: notif.url,
                    priority: "high",
                    show_in_foreground: true,
                    //picture: 'https://www.magnifique.me/img/logo.png'
                });

            //    return;
            //}
            if(notif.opened_from_tray){

                //OPEN URL
                var url = notif.url;
                console.log("NOTIFICATION notif.url", url)
                if(url!="" && url!==undefined){
                    Linking.canOpenURL(url).then(supported => {
                        if (supported) {
                            Linking.openURL(url);
                        }else{
                            console.log("Don't know how to open URI: " + url);
                        }
                    });
                }

                return;
            }


            if(Platform.OS ==='ios'){
                //optional
                //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
                //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
                //notif._notificationType is available for iOS platfrom
                switch(notif._notificationType){
                    case NotificationType.Remote:
                        notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
                        break;
                    case NotificationType.NotificationResponse:
                        notif.finish();
                        break;
                    case NotificationType.WillPresent:
                        notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
                        break;
                }
            }

            this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
                console.log("TOKEN (refreshUnsubscribe)", token);
                this.onChangeToken(token);
            });

            // direct channel related methods are ios only
            // directly channel is truned off in iOS by default, this method enables it
            FCM.enableDirectChannel();
            this.channelConnectionListener = FCM.on(FCMEvent.DirectChannelConnectionChanged, (data) => {
                console.log('direct channel connected' + data);
            });
            setTimeout(function() {
                FCM.isDirectChannelEstablished().then(d => console.log(d));
            }, 1000);
        })
    }

    componentWillUnmount() {
        this.notificationListener.remove();
        //this.refreshTokenListener.remove();
    }


    render() {
        return (
            <Navigator
                initialRoute={{ name: "Login"}}
                renderScene= { this.renderScene }
            />
        );
    }

    renderScene(route, navigator) {
        if (route.name == "Login") {
            return <LoginView navigator={navigator} {...route.passProps} />
        }
        if (route.name == "Logged") {
            return <LoggedView navigator={navigator} {...route.passProps} />
        }
        if (route.name == "Appointments") {
            return <AppointmentsView navigator={navigator} {...route.passProps} />
        }
        if (route.name == "Chat") {
            return <Chat navigator={navigator} {...route.passProps} />
        }
        if (route.name == "Trending") {
            return <TrendingView navigator={navigator} {...route.passProps}/>
        }
        if (route.name == "Post") {
            return <PostView navigator={navigator} {...route.passProps}/>
        }
        if (route.name == "Products") {
            return <ProductsView navigator={navigator} {...route.passProps}/>
        }
        if (route.name == "Product") {
            return <ProductView navigator={navigator} {...route.passProps}/>
        }
        if (route.name == "Shippings") {
            return <ShippingView navigator={navigator} {...route.passProps}/>
        }
        if (route.name == "NewAppointment") {
            return <NewAppointmentView navigator={navigator} {...route.passProps}/>
        }
        if (route.name == "CheckOut") {
            return <CheckOut navigator={navigator} {...route.passProps}/>
        }
        if (route.name == "Terms") {
            return <TermsView navigator={navigator} {...route.passProps}/>
        }
        if (route.name == "Home") {
            return <HomeView navigator={navigator} {...route.passProps}/>
        }
    }
}

AppRegistry.registerComponent('App', () => App);
