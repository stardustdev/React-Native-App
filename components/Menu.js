import React, { Component } from 'react';
import { List, ListItem, Icon } from 'react-native-elements'
import styles from './includes/styles';
import {translate, Translate} from 'react-native-translate';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ScrollView,
    TouchableOpacity
} from 'react-native';

module.exports = class Menu extends Component {

  constructor(props){
      super(props)

      var list = [
          {
              name: translate("mHome"),
              icon: 'home',
              link: 'Home'
          },
          {
              name: translate("mTrendingStyles"),
              icon: 'trending-up',
              link: 'Trending'
          },
          {
              name: translate("mReservations"),
              icon: 'date-range',
              link: 'Appointments'
          },
          {
              name: translate("mProducts"),
              icon: 'star',
              link: 'Products'
          },
          {
              name: translate("mOrders"),
              icon: 'local-shipping',
              link: 'Shippings'
          },
          //{
          //  name: translate("mGiftCard"),
          //  icon: 'card-giftcard'
          //},
          {
              name: translate("mProfile"),
              icon: 'account-circle',
              link: 'Logged'
          },
      ]

      this.state = {
          list: list,
          name: translate("anonymous"),
      };
  }

  render(){

    const {profile, data} = this.props;
    var {name} = this.state;
    const colorAccent = StyleSheet.flatten(styles.colorAccent).color;
    let photo = require("./../img/def_profile.jpg");
    let surname = ''

    if(profile){
        //Image
        if(this.props.profile.id){
            photo = {uri:'https://graph.facebook.com/'+this.props.profile.id+'/picture?type=large'};
        }

        //Name
        if("name" in profile){
            if("givenName" in profile.name){
                name = profile.name.givenName;

            }

            if("familyName" in profile.name){
                surame = profile.name.familyName;
            }
        }
    }


    if(data){
        if("image" in data){
            if(data.image!=""){
                photo = {uri:data.image};
            }
        }

        if("name" in data){
            if(data.name!=""){
                name = data.name;
            }
        }

        if("surame" in data){
            if(data.surame!=""){
                surame = data.surame;
            }
        }
    }

    return (
        <View style={styles.container}>
          <ScrollView>
            <View style={[styles.menuHeader]}>
              <Image
                  style={{borderRadius: 40,width: 80, height: 80}}
                  source={photo}/>
              <Text style={[styles.text,styles.textLight]}>
                {name}
              </Text>
              <Text style={[styles.text,styles.textLight]}>
                {surname}
              </Text>
            </View>
            <View style={[styles.menuBody]}>
              <List containerStyle={({marginTop:0,borderBottomWidth:0})}>
                {
                    this.state.list.map((l, i) => (
                      <TouchableOpacity
                          key={i}
                          onPress = { ()=> this.props.navigator.push({
                                name: l.link,
                                passProps: {
                                  data: this.props.data,
                                  token: this.props.token,
                                  profile: this.props.profile,
                                  platform:this.props.platform
                                }
                          })}>
                        <ListItem
                            titleContainerStyle = {{padding:0}}
                            key={i}
                            title={l.name}
                            titleStyle={styles.listItem}
                            hideChevron={true}
                            leftIcon={{name:l.icon, size:30, color: colorAccent}}/>
                      </TouchableOpacity>
                  ))
                }
              </List>
            </View>
          </ScrollView>
          {/*<View style = {styles.footer}>
            <View style = {{borderRightColor: '#ededed',borderRightWidth: 1,flex:1}}>
              <Icon name = {'camera-enhance'} size = {35} color = {'#bdc6cf'} iconStyle = {{padding:5}}/>
            </View>
            <View style = {{flex:1}}>
              <Icon name = {'contacts'} size = {35} color = {'#bdc6cf'} iconStyle = {{padding:5}}/>
            </View>
            <View style = {{borderLeftColor: '#ededed',borderLeftWidth: 1,flex:1}}>
              <Icon name = {'notifications-none'} size = {35} color = {'#bdc6cf'} iconStyle = {{padding:5}}/>
            </View>
          </View>*/}
        </View>
    )
  }
};