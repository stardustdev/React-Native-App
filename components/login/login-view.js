import React, { Component } from 'react';
import { SocialIcon, Icon, FormLabel, FormInput, FormValidationMessage, Button } from 'react-native-elements'
import ModalDropdown from 'react-native-modal-dropdown';
import {
    StyleSheet,
    Text,
    View,
    Linking,
    Platform,
    Image,
    TouchableOpacity,
    AsyncStorage,
    Clipboard,
    ScrollView,
    KeyboardAvoidingView,
    TouchableHighlight, Alert,
} from 'react-native';
import Video from 'react-native-video';
import styles from '../includes/styles';
import {translate, Translate} from 'react-native-translate';
import TranslateFile from "../../translate/translate";

const FBSDK = require('react-native-fbsdk');
const {
    GraphRequestManager,
    GraphRequest,
    AccessToken,
    LoginManager
    } = FBSDK;

import {DOMAIN} from './../../config';
var logger;

class LoginView extends Component {

    constructor(props) {
        super(props);
        this.handleFacebookLogin = this.handleFacebookLogin.bind(this);
        this.getAccessToken = this.getAccessToken.bind(this);
        this.getFBUserData = this.getFBUserData.bind(this);
        this.getShops = this.getShops.bind(this);
        this.saveShop = this.saveShop.bind(this);
        this.FCMToken= null;

        this.state = {
            logged: false,
            login:'start',
            errorType: null,
            phoneValidated:'',
            phoneIsValidated:false,
            codeValidated:'',
            codeIsValidated:false,
            token: "",
            tokenCopyFeedback: "",
            zoneFlag: require('./../../img/flag/es.png'),
            zoneCode: "+34",
            zoneLang: "es",
            reSend: false,
        };
    }

    saveUserData = async (user)=>{
        //if (await AsyncStorage.getItem("NewFCMToken") === 'false') return false

        var FCMToken = await AsyncStorage.getItem("FCMToken");
        this.FCMToken = FCMToken; // this.props.fcmToken

        let email = user.customer.email ? {email:user.customer.email} : null
        let platform = user.customer.app.platform ? {app:{platform:user.customer.app.platform}} : null
        var body = {
            ...email,
            ...platform,
            FCMToken: FCMToken,
        }

        console.log('saveUserData user',user)
        console.log('saveUserData FCMToken',FCMToken)
        console.log('saveUserData body',body)

        fetch(
            DOMAIN+'/api/customers/'+user.customer._id, {
                method: 'put',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+user.access_token
                },
                body: JSON.stringify(body),

            }).then((response) => {
                console.log('saveUserData response',response)
                return response.json();
            })
    }

    handleFacebookLogin () {
        logger='facebook';
        this.setState({"login":'facebook'})
        LoginManager.logInWithReadPermissions([
            'public_profile',
            'email',
            'read_custom_friendlists',
            'user_about_me',
            'user_birthday',
            'user_location',
            'user_friends',
            //'publish_actions'
        ]).then(
            this.getAccessToken,
            function (error) {
                console.log('Login fail with error: ' + error)
            }
        )
    }

    getAccessToken(result){
        console.log("getAccessToken result",result)
        if (result.isCancelled) {
            console.log('Login cancelled')
            this.setState({"login":'noStorage'})
        } else {
            AccessToken.getCurrentAccessToken().then(
                this.getFBUserData
            )
        }
    }

    getFBUserData(data){
        console.log('LOGIN getFBUserData',data);
        const accessToken = data.accessToken;
        this.setState({fbToken:accessToken})
        var uri = DOMAIN + '/api/oauth/facebook/token';
        console.log("getFBUserData accessToken",accessToken)

        fetch(
            uri, {
                method: 'post',
                headers: {
                    'Authorization':'Bearer '+accessToken
                }
            })
            .then((response) => {
                console.log("getFBUserData response",response)
                return response.json();
            })
            .then((responseData) => {
                console.log("getFBUserData responseData",responseData)
                return responseData;
            })
            .then((data) => {
                console.log("getFBUserData data",data);

                if(data.profile){
                    this.updateFBUserData(data);

                }else{
                    console.log("getFBUserData dataNo")
                    this.setState({"login":'noStorage'})//phoneRequest

                    let req = new GraphRequest('/me', {
                        httpMethod: 'GET',
                        version: 'v2.5',
                        parameters: {
                            'fields': {
                                'string' : 'email'
                            }
                        }
                    }, (err, res) => {
                        console.log("getFBUserData dataNo res",res)
                        console.log("getFBUserData dataNo err",err)

                        if(!err){
                            this.setState({
                                fbEmail:res.email,
                                logger:'facebook'
                            });
                        }

                    });
                    console.log("getFBUserData dataNo req",req)
                    new GraphRequestManager().addRequest(req).start()
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .done();
    }


    updateFBUserData(data){
        console.log('updateFBUserData',data);
        var uri = DOMAIN + '/api/oauth/facebook/create';

        fetch(
            uri, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)

            }).then((response) => {
                console.log("updateFBUserData response",response)
                return response.json();

            }).then((responseData) => {
                console.log("updateFBUserData responseData",responseData)
                return responseData;

            }).then((data) => {
                console.log("updateFBUserData data",data);

                if(data.profile){
                    this.setState({
                        login:'logged',
                        logger:'facebook',
                        fbProfile:data.profile
                    },this.enterApp(data))

                }else{
                    console.log("updateFBUserData error")
                    //new GraphRequestManager().addRequest(req).start()
                    this.setState({
                        "login":'noStorage'
                    })
                }

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    checkNewUser(userId,token){
        var uri = DOMAIN + '/api/customers/new-customer/'+userId;
        var body = {
            platform:Platform.OS
        }

        fetch(
            uri, {
                method: 'post',
                headers: {
                    'Authorization':'Bearer '+token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    getShops(user){
        var uri = DOMAIN + '/api/shops';

        this.setState({
            user: user,
            login:'shop'
        });

        fetch(uri, {
                method: 'get',
                headers: {
                    'Authorization':'Bearer '+user.access_token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            }).then((response) => {
                return response.json();

            }).then((responseData) => {
                this.setState({
                    shops:responseData
                })

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    loadShops() {
        const {
            user
        } = this.state;

        this.getShops(user);
    }

    saveShop(shopId){
        const {
            user
        } = this.state;

        var uri = DOMAIN+'/api/customers/'+user.customer._id;
        var body = {
            shop:shopId
        }

        fetch(uri, {
                method: 'put',
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+user.access_token
                }

            }).then((response) => {
                return response.json();

            }).then((responseData) => {
                this.setState({
                        user:{
                            ...user,
                            //customer:responseData.customer
                            customer:{
                                //...responseData.customer,
                                ...user.customer,
                                shop:shopId
                            }
                        }},

                    ()=>{
                        this.enterApp(this.state.user, true)
                    }
                )
            })
    }


    enterAppMultiUser(users, noShop, loggerHack){
        if(!users.customer){
            Alert.alert(
                translate("Attention"),
                translate("noCustomer"));

        }if(users.customer.length>0){
            AsyncStorage.setItem("users",JSON.stringify(users.customer));
            if(users.customer[0]){
                this.enterApp({
                    ...users,
                    customer:users.customer[0]
                }, noShop, loggerHack);

            }else{
                Alert.alert(
                    translate("Attention"),
                    translate("noFirstCustomer"));
            }

        }else{
            /*
            Alert.alert(
                translate("Attention"),
                translate("noMultiCustomer"));
            */
            AsyncStorage.setItem("users",JSON.stringify({}));
            this.enterApp(users,noShop,loggerHack);
        }
    }

    enterApp(user, noShop, loggerHack){
        let logger = this.state.logger==='sms' ? 'sms' : 'facebook';
        if(loggerHack) {
            logger = loggerHack;
        }

        if(!user.customer.app.platform){
            this.checkNewUser(
                user.customer._id,
                user.access_token
            )
        }

        //setShop
        if(typeof(user.customer.shop) === 'object'){
            user.customer.shop = user.customer.shop._id;
        }

        if(!user.customer.shop && !noShop){
            this.getShops(user);
            return false;
        }

        //Translate
        var lang = this.state.zoneLang;
        if(lang && lang!=""){
            var translateFile = new TranslateFile();
            var translateFileLang = translateFile.setLang(lang);
        }
        
        const logData = {
            phone: user.phone,
            code: user.code,
            fbToken: this.state.fbToken,
            refresh_token:user.refresh_token,
            data: user.customer._id,
            profile: user.profile,
            customer: user.customer,
            lang: lang,
        }

        AsyncStorage.setItem("logger",logger);
        AsyncStorage.setItem("logData",JSON.stringify(logData));
        AsyncStorage.setItem("token",user.access_token);

        this.saveUserData(user);
        this.props.navigator.push({ name: 'Home',//Products
            passProps: {
                token: user.access_token,
                data: user.customer,
                profile:user.profile,
                platform:Platform.OS,
                lang:this.state.zoneLang,
            }
        })
    }

    async componentDidMount(){
        if(this.props.changeUser){
            console.log('LOGIN componentDidMount changeUser', this.props.changeUser);
            this.enterApp(this.props.changeUser, null);
            return;
        }

        this.setState({"login":'start'})

        //We check if past session is saved
        var logger = await AsyncStorage.getItem("logger")
        console.log('logger',logger)

        if(logger==='facebook'){
            this.setState({"login":'noStorage'})
            var fbToken = await AccessToken.getCurrentAccessToken()
            var logData = JSON.parse(await AsyncStorage.getItem("logData"));
            var FCMToken = await AsyncStorage.getItem("FCMToken");

            this.setState({fbToken:fbToken.accessToken});
            console.log('enterapp',fbToken,logData)

            if(logData && fbToken.accessToken===logData.fbToken){
                this.setState({"login":'storage'})

                //We ask for another mag token
                let uri = DOMAIN + '/api/oauth/token/';
                let body = {
                    "grant_type": "refresh_token",
                    "client_id": "web-ui",
                    "client_secret": "A$3cr3tTh4tM4tt3r$T0U$",
                    "refresh_token":logData.refresh_token,
                    "language":this.state.zoneLang,
                }
                let refresh_response = await fetch(
                    uri, {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(body)
                    })
                let refresh_data = await refresh_response.json()

                if(refresh_data.error){
                    this.setState({
                        "login":'noStorage'
                    })
                    return false
                }

                //We update the user data
                let customer = await fetch(
                    DOMAIN+'/api/customers/'+logData.data, {
                        method: 'get',
                        dataType: 'json',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization':'Bearer '+refresh_data.access_token
                        }
                    })

                let customer_response = await customer.json()
                console.log('enterapp',customer_response)

                var data = {
                    "access_token": refresh_data.access_token,
                    "refresh_token": refresh_data.refresh_token,
                    "customer" : customer_response.customer,
                    "profile": logData.profile,
                    "language":logData.language,
                }

                this.setState({
                    "logger":'facebook'
                },
                    this.enterApp(data)
                )

            }else{
                this.setState({"login":'noStorage'})
                this.handleFacebookLogin()
            }

        }else if(logger==='sms') {
            this.setState({"login":'noStorage'})
            logData = JSON.parse(await AsyncStorage.getItem("logData"))

            //We ask for another mag token
            let uri = DOMAIN + '/api/oauth/sms/token/';
            let body = {
                "grant_type": "password",
                "client_id": "web-ui",
                "client_secret": "A$3cr3tTh4tM4tt3r$T0U$",
                "username": logData.phone,
                "password": logData.code,
                "language": logData.language,
            }
            let response = await fetch(
                uri, {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                })

            console.log('logger res',response)
            let token_data = await response.json()
            console.log('logger res',token_data)

            if(token_data.error || token_data.access_token==='Code not correct' || token_data.access_token==='Phone not found'){
                this.setState({
                    login:'noStorage'
                })
                return false
            }

            //We update the user data
            let customer = await fetch(
                DOMAIN+'/api/customers/'+logData.data, {
                    method: 'get',
                    dataType: 'json',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization':'Bearer '+token_data.access_token
                    }
                })

            if(customer.statusText==='Unauthorized'){
                this.setState({"logger":null,"login":'noStorage'})

            }else{
                let customer_response = await customer.json()
                var lang = logData.language ? logData.language :this.state.zoneLang;

                data = {
                    "phone": logData.phone,
                    "code": logData.code,
                    "access_token": token_data.access_token,
                    "customer" : customer_response.customer,
                    "profile": logData.profile,
                    "language":logData.language,
                }

                //Translate
                if(lang && lang!=""){
                    var translateFile = new TranslateFile();
                    var translateFileLang = translateFile.setLang(lang);
                }

                this.setState({
                        logger:'sms'
                    }, this.enterApp(data, null, 'sms'));
            }

        }else{
            this.setState({
                login:'noStorage'
            })
        }
    }

    handlePhoneSubmit = () =>{
        let {
            phoneValidated,
            reSend
        } = this.state;

        if(!phoneValidated){
            this.setState({phoneNotEnteredAlert:true})
            return false
        }

        let data={
            phoneNumber:this.state.zoneCode+this.state.phoneValidated,
            language:this.state.zoneLang,
            resend: reSend,
        };

        fetch(
            DOMAIN+'/api/oauth/phone-number/send-code', {
                method: 'post',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(data)

            }).then((response) =>{
                console.log("LOGINRESULT PHONE response",response);
                return response.json();

            }).then((responseData) => {
                return responseData;

            }).then((data) => {
                if(!data.error){
                    if(reSend){
                        this.setState({
                            errorType:"reSendCodeEnd"
                        })
                    }

                    this.setState({
                        login:'sendCode',
                        reSend:false
                    })

                }else{
                    if(reSend){
                        this.setState({
                            errorType:"reSendCodeError"
                        })

                    }else{
                        this.setState({
                            login:'noStorage',
                        })
                    }
                }

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    handleCodeSubmit = () =>{
        const {
            phoneValidated,
            codeValidated,
            fbEmail,
            fbProfile,
            reSend
        } = this.state

        var data={
            phoneNumber:this.state.zoneCode+phoneValidated,
            language:this.state.zoneLang,
            code:codeValidated,
            email:fbEmail,
        };

        console.log("handleCodeSubmit code", data);

        fetch(
            DOMAIN+'/api/oauth/phone-number', {
                method: 'post',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(data)

            }).then((response) =>{
                console.log("LOGINRESULT CODE response",response);
                return response.json();

            }).then((data) => {
                if(!data.error){
                    let userData = {
                        "phone": this.state.zoneCode+phoneValidated,
                        "code": codeValidated,
                        "access_token": data.access_token,
                        "refresh_token": data.refresh_token,
                        "customer" : data.customer,
                        "profile": fbProfile
                    }

                    this.setState({
                        logger:'sms',
                        //user: dataArray
                    },
                        this.enterAppMultiUser(userData, null, 'sms')
                    );

                }else{
                    this.setState({
                        login:'sendCode',
                        codeValidated:"",
                        errorType:'errorCode',
                    })
                }

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    handlePhoneInput = (text)=>{
        var phone = text.replace(/[^\/\d]/g,'');
        if(phone.length>9)phone=phone.slice(0,-1);
        this.setState({
            phoneIsValidated:phone.length===9,
            phoneValidated:phone
        })
    };

    handleCodeInput = (text)=>{
        var code = text.replace(/[^\/\d]/g,'');
        this.setState({
            codeIsValidated:code.length===5,
            codeValidated:code,
            errorType:""
        })
    };

    seeTerms = () => {
        this.props.navigator.push({
            name: 'Terms'
        })
    }

    //SELECT
    onSelectZoneCode(id, value) {
        console.log("onSelectZoneCode id",id);
        console.log("onSelectZoneCode value",value);
        this.setState({
            zoneFlag: value.icon,
            zoneCode: value.value,
            zoneLang: value.lang,
        });

        //Translate
        var lang = value.lang;
        if(lang && lang!=""){
            var translateFile = new TranslateFile();
            var translateFileLang = translateFile.setLang(lang);
        }
    }


    onSelectZoneCodeRenderRow(rowData, rowID, highlighted) {
        let icon = highlighted ? require('./../../img/flag/es.png') : require('./../../img/flag/br.png');
        let evenRow = rowID % 2;
        var flag = rowData.icon;
        //{rowData.name}

        return (
            <TouchableOpacity>
            {this.state.zoneCode != rowData.value &&
                <View style={[{ margin: 5,}]}>
                    <View style={[{flex: 1, flexDirection: 'row', alignItems: 'center',}]}>
                        <Image style={{width: 25, height: 25, color: '#FFF', margin: 5,}}
                               mode='stretch'
                               source={flag}
                        />
                        <Text style={{color: '#555', fontSize: 20,}}>
                            {rowData.value}
                        </Text>
                    </View>
                </View>
            }
            </TouchableOpacity>
        );
    }

    onSelectZoneCodeRenderButtonText(rowData) {
        const {name, value, icon} = rowData;
        return "${name} - ${value}";
    }

    render(){
        const {
            login,
            reSend,
            errorType,
            phoneValidated,
            phoneIsValidated,
            codeIsValidated,
            codeValidated,
            codeError,
            phoneNotEnteredAlert
        } = this.state;
        var loginState;

        let phoneColor = phoneNotEnteredAlert ? '#8f1517' : '#fff'

        var zoneCodeOption= [
            {"name": "España", "value": "+34", "lang":"es", "icon":require("./../../img/flag/es.png")},
            {"name": "Brasil", "value": "+55", "lang":"pt", "icon":require("./../../img/flag/br.png")},
            {"name": "Inglaterra", "value": "+44", "lang":"en", "icon":require("./../../img/flag/in.png")},
        ];

                switch (login){

                    case 'start':
                        loginState =
                            <Message message={translate("messageSearchingPreviousConfiguration")}/>
                        break;

                    case 'storage':
                        loginState =
                            <Message message={translate("messageLoadingPreviousSession")}/>
                        break;

                    case 'error':
                        loginState =
                            <Message message={translate("messageTheCodeEnteredIsNotCorrect")}/>
                        break;

                    case 'noStorage':
                        loginState =
                            <View>
                                <View style={{width:'100%', height:50,}}>
                                    <View style={{flex:1, flexDirection:'row',}}>
                                        <ModalDropdown style={{flex:1, justifyContent:'center', color:'#555',}}
                                                       options={zoneCodeOption}
                                                       onSelect={(idx, value) => this.onSelectZoneCode(idx, value)}
                                                       renderButtonText={(rowData) => this.onSelectZoneCodeRenderButtonText(rowData)}
                                                       renderRow={this.onSelectZoneCodeRenderRow.bind(this)}>

                                            <View style={{flexDirection:'row', alignItems: 'center', marginLeft:20}}>
                                                <Image style={{width: 25, height: 25, color:'#555', margin:5,}}
                                                       source={this.state.zoneFlag}
                                                       mode='stretch'/>
                                                <Text
                                                    style={{color:'#FFF',fontSize:20,}}
                                                    numberOfLines={1}
                                                    ellipsizeMode={'tail'}>
                                                    {this.state.zoneCode}
                                                </Text>
                                            </View>
                                        </ModalDropdown>


                                        <View style={{flex: 1, flexDirection:'row', backgroundColor:'#CCC',}}>
                                            <View style={{height:50, flex: 1, backgroundColor:'#555'}}>
                                                <FormInput
                                                    inputStyle={[styles.messageInput,{flex: 1, color:'white', fontSize:20, backgroundColor:'#FFF'}]}
                                                    placeholder={translate('numberPhone')}
                                                    placeholderTextColor={phoneColor}
                                                    textInputRef='number'
                                                    onChangeText={(text)=>this.handlePhoneInput(text)}
                                                    value={phoneValidated}
                                                    keyboardType={'numeric'}/>
                                            </View>

                                            {phoneIsValidated &&
                                            <Icon
                                                size = {30}
                                                name='send'
                                                onPress={() => this.handlePhoneSubmit()}
                                                iconStyle={[styles.icons,styles.iconItem, {flex: 1,}]} />
                                            }
                                        </View>
                                    </View>
                                </View>

                                {/*phoneIsValidated &&
                                    <Button
                                        buttonStyle={styles.buttons}
                                        textStyle={styles.buttonsText}
                                        onPress={() => this.handlePhoneSubmit()}
                                        iconSize={35}
                                        title={translate("go_to")}/>
                                */}

                                <Text style={{alignSelf:'center',color:'white',margin:10}}>o</Text>
                                <SocialIcon
                                    //button
                                    //fontFamily = {'facebook'}
                                    //title={translate("LoginWithFacebook")}
                                    fontWeight={'bold'}
                                    fontStyle={{fontSize:20}}
                                    style={[styles.button, {width:60, height:60, alignSelf:'center'}]}
                                    onPress={() => this.handleFacebookLogin()}
                                    type='facebook'/>

                                <Text
                                    onPress={this.seeTerms}
                                    style={[styles.text, styles.textLight, {textAlign:'center', margin:10} ]}>
                                    {translate('useCondition')}
                                </Text>
                            </View>
                        break;


                    case 'phoneRequest':
                        loginState =
                            <View style={styles.messageContainer}>
                                <Text style={styles.message}>
                                    {translate("insertPhone")}
                                </Text>

                                <View style={{flexDirection:'row'}}>
                                    <FormInput
                                        inputStyle={[styles.messageInput]}
                                        placeholder="Introduce tu número de teléfono"
                                        placeholderTextColor='#888'
                                        ref='phone'
                                        textInputRef='number'
                                        onChangeText={(text)=>this.handlePhoneInput(text)}
                                        value={phoneValidated}
                                        keyboardType={'numeric'}/>

                                    {phoneIsValidated &&
                                    <Icon
                                        size = {30}
                                        name='send'
                                        onPress={() => this.handlePhoneSubmit()}
                                        iconStyle={[styles.icons,styles.iconItem]} />
                                    }
                                </View>

                                {phoneIsValidated &&
                                    <Button
                                        buttonStyle={styles.buttons}
                                        textStyle={styles.buttonsText}
                                        onPress={() => this.handlePhoneSubmit()}
                                        iconSize = {35}
                                        title={translate("send")}/>
                                }
                            </View>
                        break;

                    case 'sendCode':
                        loginState =
                            <View style={styles.messageContainer}>
                                <Text
                                    style={styles.message}>
                                    {translate("intoCode")}
                                </Text>

                                <View style={{width:'100%', height:50,}}>
                                    <View style={{flex: 1, flexDirection:'row', justifyContent:'center'}}>
                                        <View style={{flex: 3}}>
                                            <FormInput
                                                inputStyle={[styles.messageInput,{height:50 ,fontSize:20, fontWeight:'bold',}]}
                                                placeholder={translate("ConfirmationCode")}
                                                placeholderTextColor='#888'
                                                ref='code'
                                                textInputRef='number'
                                                onChangeText={(text)=>this.handleCodeInput(text)}
                                                value={codeValidated}
                                                keyboardType={'numeric'}/>
                                        </View>

                                        {codeIsValidated &&
                                        <Icon
                                            size = {30}
                                            name='send'
                                            onPress={() => this.handleCodeSubmit()}
                                            iconStyle={[styles.icons,styles.iconItem, {flex: 1,}]} />
                                        }
                                    </View>
                                </View>

                                {(errorType == 'errorCode') &&
                                <FormValidationMessage>
                                    {translate("errorCode")}
                                </FormValidationMessage>
                                }

                                {/*(codeIsValidated) &&
                                <Button
                                    buttonStyle={styles.buttons}
                                    textStyle={styles.buttonsText}
                                    onPress={() => this.handleCodeSubmit()}
                                    iconSize = {35}
                                    title={translate("send")}/>
                                */}

                                <Text
                                    style={[styles.message,styles.title,{padding:10,}]}
                                    onPress={() =>
                                        this.setState({
                                            reSend:true,
                                            errorType:"reSendCodeStart"
                                        }, () => this.handlePhoneSubmit())}>
                                    {translate("resendCode")}
                                </Text>

                                {(errorType == 'reSendCodeStart') &&
                                <FormValidationMessage>
                                    {translate("reSendCodeStart")}
                                </FormValidationMessage>
                                }

                                {(errorType == 'reSendCodeEnd') &&
                                <FormValidationMessage>
                                    {translate("reSendCodeEnd")}
                                </FormValidationMessage>
                                }

                                {(errorType == 'reSendCodeError') &&
                                <FormValidationMessage>
                                    {translate("reSendCodeError")}
                                </FormValidationMessage>
                                }

                                <Text
                                    style={[styles.message,styles.title,{padding:10,}]}
                                    onPress={() =>
                                        this.setState({
                                            "login":'noStorage',
                                            "reSend":false,
                                        })}>
                                    {translate("changeNumber")}
                                </Text>
                            </View>
                        break;

                case 'shop':
                    if (this.state.shops){
                        var shops = []

                        this.state.shops.map((shop)=>{
                            if(shop.settings.server==='prod'){
                                shops.push(
                                    <Salon
                                        salon = {shop}
                                        key = {shop._id}
                                        onSave = {this.saveShop}/>
                                )
                            }
                        })

                        shops.push(
                            <Salon
                                salon = {{
                                _id:null,
                                location:{},
                                settings:{name:translate("messageMyroomisnotAvailable"),mainPicture:{path:null}}
                                }}
                                last = {true}
                                onSave = {this.saveShop}/>
                        )

                        loginState = [
                            <View style={{flex: 1, justifyContent:'space-between',}}>
                                <Text
                                    key = {0}
                                    style = {styles.chooseSalon}>
                                    {translate("chooseSalon")}
                                </Text>
                                <View style={{flex: 1, }}>
                                    <ScrollView>
                                        {shops}
                                    </ScrollView>
                                </View>
                            </View>
                        ];


                    }else{
                        loginState = [
                            <View style={{flex: 1, justifyContent:'space-between',}}>
                                <Message message={translate("messageLoadingSalons")}/>
                                <Button
                                    buttonStyle={styles.buttons}
                                    textStyle={styles.buttonsText}
                                    onPress={() => this.loadShops()}
                                    iconSize={35}
                                    title={translate("reloadSalons")}/>
                            </View>
                    ]
                    }

                    break


        }

        return (/*
            <KeyboardAvoidingView
                style={[styles.container]}
                keyboardVerticalOffset={65}
                behavior='padding'>
            </KeyboardAvoidingView>*/
            <View style={[styles.window,{justifyContent:'center',}]}>
                <Video
                    source={require('./../../assets/splash.mp4')}
                    rate={1.0}
                    volume={1.0}
                    muted={true}
                    resizeMode={"cover"}
                    repeat
                    style={styles.video}/>

                <View style={[{/*flex: 1, justifyContent:'center',*/ alignSelf:'center', }]}>
                    <Image
                        source={require('./../../img/splash.png')}
                        style={{
                            width:'80%',
                            resizeMode:'contain',
                            alignSelf: 'center'
                        }}/>
                </View>
                <View style={[{alignSelf:'center', backgroundColor: 'transparent'}]}>
                    {loginState}
                </View>
            </View>
        );
    }

}

export class Message extends Component{
    render(){
        return (
        <View style={[styles.messageContainer,]}>
            <Text style={[styles.message]}>{this.props.message}</Text>
        </View>
        )}
}

export class Salon extends Component{
    render(){
        const {salon} = this.props
        let titleStyle = this.props.last ? styles.lastTitle : styles.salonTitle
        const onPress = this.props.onSave

        return (
            <TouchableOpacity
                onPress={()=>onPress(salon._id)}>
                <View style={styles.salonContainer}>
                    <Image
                        style={{borderRadius: 40,width: 80, height: 80}}
                        source={{uri:salon['settings'].mainPicture.path}}
                        width = {60}
                        height = {60}/>
                    <View style = {{marginLeft:15}}>
                        <Text style={titleStyle}>{salon['settings'].name}</Text>
                        <Text style={styles.salonAddress}>{salon.location.address}</Text>
                        <Text style={styles.salonCity}>{salon.location.city}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}

export default LoginView;
