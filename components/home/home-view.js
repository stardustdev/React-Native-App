
import React, { Component } from 'react';
import { ButtonGroup, Button, Slider, SideMenu, List, ListItem } from 'react-native-elements'
import {Select, Option} from "react-native-chooser";
import NavigationBar from 'react-native-navbar';
import {DOMAIN} from './../../config'
import CustomBar from '../CustomBar'
import ViewPosts from './ViewPosts'
import ViewWall from './ViewWall'
import ViewAppointments from './ViewAppointments'
import AppointmentsView from './../appointments/appointments-view'
import styles from '../includes/styles';
import {translate, Translate} from 'react-native-translate';
import TranslateFile from "../../translate/translate";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert, AsyncStorage
} from 'react-native';

const Menu = require('./../Menu');


class HomeView extends Component {
    constructor (props) {
        super(props);

        const {data} = this.props;

        this.state={
            isOpen: false,
            data: data,
            name:data.name,
            surname:data.surname,
            image:data.image,
            menu:<Text>..</Text>
        }

    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    updateMenuState(isOpen) {
        this.setState({ isOpen, });
    }


    getShop = () =>{
        console.log('getShop this.props.data.shop ',this.props.data.shop);
        fetch(
            DOMAIN+'/api/shops/'+this.props.data.shop, {
                method: 'get',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }
            }).then((response) => {
                return response.json();

            }).then((responseData) => {
                return responseData;

            }).then((data) => {
                console.log('getShop data ',data);
                this.setState({
                    opening:data.shop.opening ? data.shop.opening : null,
                    shop:data.shop
                })

            }).catch((error) => {
                console.error(error);

            }).done();
    }


    getCustomer(){
        fetch(
            DOMAIN+'/api/customers/'+this.props.data._id, {
                method: 'get',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }

            }).then((response) => {
                return response.json();

            }).then((responseData) => {
                return responseData;

            }).then((data) => {

                //Translate
                var lang = data.customer.language;
                if(lang && lang!=""){
                    var translateFile = new TranslateFile();
                    var translateFileLang = translateFile.setLang(lang);

                    //SET TRANSLATE TO LogData
                    AsyncStorage.getItem("logData").then((value) => {
                        var logData = JSON.parse(value);

                        const newlogData = {
                            ...logData,
                            language:lang,
                        }

                        AsyncStorage.setItem("logData",JSON.stringify(newlogData));
                    }).done();

                }

                this.setState({
                    data:data.customer,
                    name:data.customer.name,
                    surname:data.customer.surname,
                    image:data.customer.image,
                    language:lang,
                    menu:<Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator } {...this.props}/>,
                })

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    componentDidMount(){
        this.getCustomer();
        this.getShop();
    }

    render(){
        const {shop, menu} = this.state
        const {name, surname, image} = this.state
        //const menu = <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator } {...this.props}/>;

        var ShopName = null
        var ShopDescriptions = null
        var ShopMessageWelcome = null
        var TextShopMessageWelcome = null
        var TextShopDescriptions = null

        if(shop){
          ShopName = this.state.shop.settings.name ? this.state.shop.settings.name : translate("shopName")
          ShopDescriptions = this.state.shop.settings.descriptions ? this.state.shop.settings.descriptions : ""//translate("shopDescription")
          ShopMessageWelcome = this.state.shop.settings.MessageWelcome ? this.state.shop.settings.MessageWelcome : ""//translate("shopMessageWelcome")
        }

        if(!ShopDescriptions && ShopDescriptions!=''){
            TextShopDescriptions = (<Text style = {styles.center}>ShopDescriptions</Text>)
        }

        if(!ShopMessageWelcome && ShopMessageWelcome!=''){
            TextShopMessageWelcome = (<Text style = {styles.center}>ShopMessageWelcome</Text>)
        }

        return (
        <SideMenu
            menu={menu}
            isOpen={this.state.isOpen}
            onChange={(isOpen) => this.updateMenuState(isOpen)}>
            <CustomBar
                {...this.props}
                title = {translate("home")}
                platform = {this.props.platform}
                onHandleLeftPress = {this.toggle.bind(this)} />
            <View style={styles.window}>

                <View>
                    <Text style = {[styles.text, styles.title, styles.textLight, {textAlign: 'center',}]}>{ShopName}</Text>
                    {(TextShopDescriptions && TextShopDescriptions!="") &&
                    <Text style = {[styles.text, styles.textLight, {textAlign: 'center',}]}>{TextShopDescriptions}</Text>
                    }

                    {(TextShopMessageWelcome && TextShopMessageWelcome!="") &&
                    <Text style = {[styles.text, styles.textLight, {textAlign: 'center',}]}>{TextShopMessageWelcome}</Text>
                    }
                </View>
                <ScrollView>
                    <View>
                        <ViewAppointments
                            onSliderChange = {this.onSliderChange}
                            {...this.props}/>

                <ViewPosts
                    onSliderChange = {this.onSliderChange}
                    {...this.props}/>

                    </View>
                </ScrollView>
            </View>
        </SideMenu>

        )
    }
    componentWillUpdate(){

    }
}

export default HomeView;
