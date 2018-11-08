import React, { Component } from 'react';
import { ButtonGroup, Button, Slider, SideMenu, List, ListItem } from 'react-native-elements'
import {Select, Option} from "react-native-chooser";
import NavigationBar from 'react-native-navbar';
const Menu = require('./../Menu');
import {parseBackToFrontData} from './utils/parseBackToFrontData'
import {parseFrontToBackData} from './utils/parseFrontToBackData'
import AboutMe from './AboutMe'
import MyHair from './MyHair'
import MySkin from './MySkin'
import MyNails from './MyNails'
import MyBrows from './MyBrows'
import MyLash from './MyLash'
import Others from './Others'
import Pictures from './Pictures'
import {DOMAIN} from './../../config'
import {checkPaymentData} from '../products/utils/checkPaymentData'
import {RealexRemote} from './utils/rxp-remote'
import styles from '../includes/styles';
import CustomBar from '../CustomBar'

import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert, AsyncStorage
} from 'react-native';

//Translate
import {translate, Translate} from 'react-native-translate';
import TranslateFile from "../../translate/translate";

var dataArray= [];

class LoggedView extends Component {
    constructor (props) {
        super(props);

        const {data} = this.props;
        var res = this.setCustomerData(data)

        this.state={
            ...res[0],
            ...res[1],
            cardLastNumbers:data.cardLastNumbers,
            selectedTab: this.props.selectedTab ? this.props.selectedTab : 0,
            isOpen: false,
            selectedItem: 'About',
            name:data.name,
            surname:data.surname,
            image:data.image,
            language: data.language,
            loginType: data.loginType,
            phoneNumber: data.phoneNumber,
            email: data.email,
            facebook: data.facebook,
            facebookToken: data.facebookToken,
            menu: <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator } {...this.props}/>,
        }

        this.closeSession = this.closeSession.bind(this)
        this.toggleSideMenu = this.toggleSideMenu.bind(this)
        this.updateIndex = this.updateIndex.bind(this)
        this.onSliderChange = this.onSliderChange.bind(this)
        this.savePayer = this.savePayer.bind(this)
        this.saveCard = this.saveCard.bind(this)
        this.validatePD = this.validatePD.bind(this)
    }

    setCustomerData(data){
        const parsedBackData=parseBackToFrontData(data)
        dataArray=parsedBackData[1];

        let shippingAddress=null;
        if(data.shippingAddress.length>0){
            shippingAddress={
                address:data.shippingAddress[0].address,
                city:data.shippingAddress[0].city,
                state:data.shippingAddress[0].state,
                postalCode:data.shippingAddress[0].postalCode
            }
        }
        return [parsedBackData[0],shippingAddress]
    }

    onSliderChange(prop,state){
        //if(prop==='address'||'city'||'state'||'postalCode'){
        //    this.setState({shippingAddress:{...this.state.shippingAddress,[prop]:state}})
        //}else {
            this.setState({
                [prop]:state
            })
        //}
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    updateMenuState(isOpen) {
        this.setState({ isOpen, });
    }

    onMenuItemSelected = (item) => {
        this.setState({
            isOpen: false,
            selectedItem: item,
        });
    }

    onSideMenuChange (isOpen: boolean) {
        this.setState({
            isOpen: isOpen
        })
    }

    toggleSideMenu () {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    updateIndex (selectedIndex) {
        if(selectedIndex!=this.state.selectedIndex){
            this.setState({selectedIndex})
        }
    }

    updateTab (selectedTab) {
        if(selectedTab!=this.state.selectedTab){
            this.setState({
                selectedTab
            })
        }
    }

    async savePayer(){
        var body={
            customer:this.props.data._id
        }
        var url = DOMAIN + '/api/payments/payer';
        var response=false;
        await fetch(
            url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                },
                body: JSON.stringify(body)
            })
            .then(res => res.json())
            .then(results => {
                response = results.message==='OK'
            })
            .catch(function (e) {
                console.log(e);
            });
        return response
    }

    async saveCard(){
        var name = this.state.name || this.props.name;
        var surname = this.state.name || this.props.name;
        var completeName = name+' '+surname;
        var expiration = this.state.expiration || this.props.expiration
        var expiracy=expiration.substr(0,2)+expiration.substr(expiration.length-2)
        var response=false;

        var body={
            customer:this.props.data._id,
            cardNumber:this.state.cardNumber,
            expiration:expiracy,
            name:completeName
        }

        console.log('saveCard body', body)
        var url = DOMAIN + '/api/payments/card';
        await fetch(
            url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                },
                body: JSON.stringify(body)
            })
            .then(res => {
                console.log('saveCard res', res)
                res.json()
            })
            .then(results => {
                console.log('saveCard results', results)
                response = results.message==='OK'
            })
            .catch(function (e) {
                console.log(e);
            });
        return response
    }

    onSave(){
        const cardLastNumbers = this.state.cardNumber ? this.state.cardNumber.substring(12) : null;
        const data = parseFrontToBackData(this.state)
        const {address,city,state,postalCode,cardNumber,expiration,name,surname,editCard,image,language, loginType, phoneNumber, email} = this.state
        const body ={
            ...data,
            shippingAddress:[{
                address:address,
                city:city,
                state:state,
                postalCode:postalCode
            }],
            cardLastNumbers:cardLastNumbers,
            name:name,
            surname:surname,
            image:image,
            language:language,
            loginType: loginType,
            phoneNumber: phoneNumber,
            email:email,
        }

        console.log("onSave body",body);
        if((this.props.data.cardSaved==='false' || editCard) && cardNumber && expiration){
            if(this.props.data.payerSaved==='false' && (!address || !city || !state || !postalCode)){
                let message = translate("mSaveCardEnterAddress")
                Alert.alert(translate("Attention"),message)
                return false;
            }
            var cardHolder=name+' '+surname;
            var expiracy=expiration.substr(0,2)+expiration.substr(expiration.length-2)
            if (this.validatePD(cardNumber,cardHolder,expiracy) === false){
                let message = translate("mErrorData");
                Alert.alert(translate("Attention"),message)
                return false;
            }
        }

        fetch(
            DOMAIN+'/api/customers/'+this.props.data._id, {
                method: 'put',
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }
            })

            .then((response) =>
            {
                return response.json();
            })
            .then((responseData) => {
            console.log('responseData',responseData);
                return responseData;
            })
            .then((data) => {
                var payerSaved=false,cardSaved=false;
                if(this.props.data.payerSaved==='false' && address && city && state && postalCode){
                    var resultPayer = this.savePayer() //TODO: Fix this with async or cb
                    console.log('saving payer', resultPayer)
                    this.props.data.payerSaved=true;
                    payerSaved=true
                }

                if((this.props.data.cardSaved==='false' || editCard) && this.props.data.payerSaved!==false && cardNumber && expiration) {
                    var resultCard = this.saveCard() //TODO: Fix this with async or cb
                    console.log('saving card', resultCard)
                    cardSaved=true
                }

                if(data.status==='OK' && this.props.referer){

                    var res=checkPaymentData(data.customer,payerSaved,cardSaved)
                    if(res===true){
                        this.props.navigator.push({ name: 'CheckOut',
                            passProps: {
                                data: {
                                    ...body,
                                    _id:this.props.data._id
                                },
                                token: this.props.token,
                                profile: this.props.profile,
                                platform:this.props.platform,
                            }
                        })
                    }else{
                        Alert.alert(translate("Attention"),res)
                    }
                }else if(data.status==='OK'){
                    Alert.alert('','Datos guardados con éxito')

                    //Translate
                    var lang = data.customer.language;
                    console.log("userData save return", lang);
                    if(lang && lang!=""){
                        var translateFile = new TranslateFile();
                        var translateFileLang = translateFile.setLang(lang);
                    }

                    //SET TRANSLATE TO LogData
                    AsyncStorage.getItem("logData").then((value) => {
                        var logData = JSON.parse(value);

                        const newlogData = {
                            ...logData,
                            language:lang,
                        }

                        AsyncStorage.setItem("logData",JSON.stringify(newlogData));

                        this.setState({
                            language:lang,
                            menu: <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator } {...this.props}/>,
                        })

                    }).done();

                }else{
                    Alert.alert(translate("error"),translate("mErrorSaveData"))
                }
            })

        .catch((error) => {
            console.error(error);
        })
        .done();
    }

    validatePD(cardNumber,cardHolder,expiration){
        var cardNumberCheck = RealexRemote.validateCardNumber(cardNumber);
        var cardHolderNameCheck = RealexRemote.validateCardHolderName(cardHolder);
        var expiryDateFormatCheck = RealexRemote.validateExpiryDateFormat(expiration);
        var expiryDatePastCheck = RealexRemote.validateExpiryDateNotInPast(expiration);
        return !(cardNumberCheck == false || cardHolderNameCheck == false || expiryDateFormatCheck == false || expiryDatePastCheck == false);
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
            })
            .then((response) =>
            {
                return response.json();
            })
            .then((responseData) => {

                return responseData;
            })
            .then((data) => {
                var res = this.setCustomerData(data.customer)

                this.setState({
                    ...res[0],
                    ...res[1],
                    name:data.customer.name,
                    surname:data.customer.surname,
                    image:data.customer.image,
                    language:data.customer.language,
                    cardLastNumbers:data.customer.cardLastNumbers
                })
            })

            .catch((error) => {
                console.error(error);
            })
            .done();
    }


    async closeSession() {
        //LoginManager.logOut();
        await AsyncStorage.setItem("logger",'none');
        await AsyncStorage.setItem("logData",'none');
        await AsyncStorage.setItem("users",'none');
        await AsyncStorage.setItem("token",'none');
        this.props.navigator.push({ name: 'Login'})
    }

    componentDidMount(){
        if(this.props.referer==='CheckOut'){
            Alert.alert(translate("Attention"),translate("mAddData"))
        }
        this.getCustomer();
    }

    componentWillUpdate(){

    }

    render(){
        //const buttons = ['Sobre Mi','Pelo','Piel','Uñas','Cejas','Pestañas']
        const buttons = [translate("aboutMe"),translate("hair"),translate("others"), translate("photos")]
        const menu = this.state.menu;

        var {
            selectedIndex,
            selectedTab,
            sliderType,
            sliderTexture,
            sliderColor,
            sliderState
        } = this.state;

        const {
            sliderSkinType,
            sliderNailType,
            sliderNailPolish,
            sliderBrowType,
            sliderLashType,
            cardLastNumbers,
            hashedExpiration,
            hashedCVV,
            address,
            city,
            state,
            postalCode,
            name,
            surname,
            image,
            language,
            loginType,
            phoneNumber,
            email,
            facebook,
            facebookToken
        } = this.state;

        let buttonShow = true;
        let tab = null;

        switch (this.state.selectedTab){
            case 0:
                tab =
                    <AboutMe
                        {...this.props}
                        styles = {styles}
                        selectedIndex = {this.state.selectedIndex}
                        onPress = {this.updateIndex}
                        onSliderChange = {this.onSliderChange}
                        cardLastNumbers = { cardLastNumbers }
                        hashedExpiration = { hashedExpiration }
                        hashedCVV = { hashedCVV }
                        address = { address }
                        city = { city }
                        state = { state }
                        postalCode = { postalCode }
                        name = {name}
                        surname = {surname}
                        image = {image}
                        loginType = {loginType}
                        email = {email}
                        phoneNumber = {phoneNumber}
                        facebook = {facebook}
                        facebookToken= {facebookToken}
                        customer = {this.props.data._id}
                        language = {language}
                    />;
                break;

            case 1:
                tab =
                    <MyHair
                        {...this.props}
                        styles = {styles}
                        sliderType = {sliderType}
                        sliderTexture = {sliderTexture}
                        sliderColor = {sliderColor}
                        sliderState = {sliderState}
                        onSliderChange = {this.onSliderChange}
                    />;
                break;

            case 2:
                tab =
                    <Others
                        styles = {styles}
                        sliderSkinType = {sliderSkinType}
                        sliderNailType = {sliderNailType}
                        sliderNailPolish = {sliderNailPolish}
                        sliderBrowType = {sliderBrowType}
                        sliderLashType = {sliderLashType}
                        onSliderChange = {this.onSliderChange}
                        {...this.props}
                        />;
                break;


            case 3:
                buttonShow = false;
                tab =
                    <Pictures
                        styles = {styles}
                        {...this.props}
                        />;
                break;


            case 2:
                tab =
                    <MySkin
                        styles = {styles}
                        sliderSkinType = {sliderSkinType}
                        onSliderChange = {this.onSliderChange}
                        {...this.props}
                    />;
                break;

            case 3:
                tab =
                    <MyNails
                        styles = {styles}
                        sliderNailType = {sliderNailType}
                        sliderNailPolish = {sliderNailPolish}
                        onSliderChange = {this.onSliderChange}
                        {...this.props}
                    />;
                break;

            case 4:
                tab =
                    <MyBrows
                        styles = {styles}
                        sliderBrowType = {sliderBrowType}
                        onSliderChange = {this.onSliderChange}
                        {...this.props}
                    />;
                break;

            case 5:
                tab =
                    <MyLash
                        styles = {styles}
                        sliderLashType = {sliderLashType}
                        onSliderChange = {this.onSliderChange}
                        {...this.props}
                    />;
                break;


        }


        var button = null;
        if(buttonShow){
            button = <Button
                buttonStyle={[styles.buttons]}
                textStyle={[styles.buttonsText]}
                onPress = {this.onSave.bind(this)}
                title={translate("saveChange")} />;
        }

        return (
        <SideMenu
            menu={menu}
            isOpen={this.state.isOpen}
            onChange={(isOpen) => this.updateMenuState(isOpen)}>
            <CustomBar
                {...this.props}
                title = {translate("mProfile")}
                platform = {this.props.platform}
                onHandleLeftPress = {this.toggle.bind(this)} />

            <View style={styles.window}>

                <ScrollView>
                    <View>

                        <ButtonGroup
                            onPress={this.updateTab.bind(this)}
                            selectedIndex={selectedTab}
                            buttons={buttons}
                            containerStyle={[styles.buttons, {borderWidth:0}]}
                            selectedTextStyle={[styles.buttonsText, {textAlign:'center', fontWeight: 'bold',}]}
                            selectedBackgroundColor={'#fff'}
                            textStyle={[styles.buttonsText, {textAlign:'center'}]} />

                        {tab}

                        {button}

                        {(selectedTab == 0) &&
                            /*
                            <Text
                                style={[styles.text, styles.textLight, styles.title]}>
                                {translate("myAccount")}
                            </Text>
                               */
                            <Button
                                buttonStyle={[styles.buttons, styles.buttonsDisable]}
                                textStyle={[styles.buttonsText, styles.buttonsDisableText]}
                                onPress={this.closeSession}
                                iconSize = {35}
                                icon = {{name:'power-settings-new'}}
                                title={translate("signOff")}/>
                        }
                    </View>
                </ScrollView>
            </View>
        </SideMenu>

        )
    }
}

export default LoggedView;
