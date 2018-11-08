import React, { Component } from 'react';
import NavigationBar from 'react-native-navbar';
import styles from './includes/styles';
import {translate, Translate} from 'react-native-translate';
import ModalDropdown from 'react-native-modal-dropdown';
import {
    TouchableOpacity,
    Text,
    Image,
    View,
    Picker,
    PickerIOS,
    AsyncStorage,
} from 'react-native';
import {Icon} from 'react-native-elements'


class Button2 extends Component {
    handlePress(e) {
        if (this.props.onPress) {
            this.props.onPress(e);
        }
    }

    render() {
        return (
            <TouchableOpacity
                onPress={this.handlePress.bind(this)}
                style={this.props.style}>
                <View>
                    <Text>{this.props.children}</Text>
                    <Icon
                        name="menu"
                        size = {30}
                        iconStyle={[styles.icons, {marginLeft:5}]}/>
                </View>
            </TouchableOpacity>
        );
    }
}


class SelectRight extends Component {
    constructor (props) {
        super(props);

        this.state = {
            multiUser: [],
            shopName: "",
            shopValue: 0,
            data:[],
        };
    }

    async componentDidMount(){
        await this.evalMultiUser();
    }

    async evalMultiUser(){
        var users = await AsyncStorage.getItem("users");
        var data = JSON.parse(await AsyncStorage.getItem("logData"));
        var token = await AsyncStorage.getItem("token");
        var shop = data.customer.shop;
        var multiUser = [];
        var shopName = '';
        var shopValue = 0;

        if(users){
            users = JSON.parse(users);
            users.map((user, index)=>{
                var name = user.shop.settings.name;
                if(shop==user.shop._id){

                    shopValue = index;
                    shopName = name;
                }

                multiUser.push({
                        name: name,
                        user: user,
                    }
                );
            });
        }

        this.setState({
            shopValue: shopValue,
            shopName: shopName,
            multiUser:multiUser,
            token:token,
            data:data,
        });
    }

    changeOptionUser(index, value) {
        var {
            token,
            data,
            multiUser
        } = this.state;

        this.setState({
            shopName: multiUser[index].user.shop.settings.name,
            shopValue: index,
        })

        this.props.navigator.push({
            name: "Login",
            passProps: {
                token: token,
                platform:this.props.platform,
                //changePage: this.props.navigator.state.routeName,
                changeUser: {
                    ...data,
                    customer:multiUser[index].user,
                    access_token:token,
                },
            }
        })
    }


    render() {
        var {
            multiUser,
            shopName,
            shopValue
        } = this.state;

        return(
            <View>
               {(this.props.platform==='ios..') &&
                   <Text
                       style={[styles.text, styles.textLight]}>
                       {shopName}
                   </Text>

               }
                {(multiUser.length > 1) &&
                    <Picker
                        selectedValue={shopValue}
                        style={[styles.text, styles.textLight, {fontSize:12, height: 50, width: 100, justifyContent: 'center'}]}
                        textStyle={[styles.text, styles.textLight, {fontSize:12}]}
                        onValueChange={(itemValue, itemIndex) => { this.changeOptionUser(itemIndex, itemValue) }}>
                        {multiUser.map((option, index)=>{
                            return (
                                    <Picker.Item
                                        label={option.name}
                                        value={index} />
                            )
                        })}
                    </Picker>
                }
           </View>
        );
    }
}

class CustomBar extends Component {
    render(){
        const leftIconSize = this.props.platform==='android' ? 96 : 36;
        const onHandleLeftPress = this.props.onHandleLeftPress

        return(
            <NavigationBar
                title={
                    <Text
                        style ={[styles.text, styles.textLight, {fontSize:20,}]}>
                        {this.props.title}
                    </Text>
                }

                leftButton = {
                    <Button2
                        menu
                        style = {{textAlign:'center',}}
                        onPress={() => onHandleLeftPress()}>
                    </Button2>
                }

                rightButton = {
                    <SelectRight
                        {...this.props}
                        platform={ this.props.platform }/>
                }

                containerStyle ={[styles.topNav]}/>
        )
    }
}

export default CustomBar;
