import React, { Component } from 'react';
import { Icon, Button } from 'react-native-elements'
import { SocialIcon, FormLabel, FormInput } from 'react-native-elements'
import { ButtonGroup } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import {translate, Translate} from 'react-native-translate';
import TranslateFile from "../../translate/translate";
import Share, {ShareSheet} from 'react-native-share';
import { ShareDialog } from 'react-native-fbsdk';
import {DOMAIN} from './../../config';
import styles from "../includes/styles";
import {
    StyleSheet,
    Text,
    View,
    Image,
    AsyncStorage,
    TouchableOpacity,
    Picker, Platform
} from 'react-native';

const FBSDK = require('react-native-fbsdk');
const {
    GraphRequestManager,
    GraphRequest,
    AccessToken,
    LoginManager,
    ShareApi,
    AppInviteDialog,
} = FBSDK;

class AboutMe extends Component {

    constructor(props){
        super(props)
        this.state={
            cardEdit:false,
            bttnPhoto:translate("addPhoto"),
            imageUri: require("./../../img/def_profile.jpg"),
            img:'',
        }
        this.getAccessToken = this.getAccessToken.bind(this);
        this.getFBUserData = this.getFBUserData.bind(this);

    }
    handlePress(e) {
        if (this.props.onPress) {
            this.props.onPress(e);
        }
    }

    handleEditCard(){
        this.setState({
            cardNumber:null,
            expiration:null,
            editCard:true
        })
        this.setParentState('editCard',true)
    }

    setParentState(prop,value){
        const cb = this.props.onSliderChange;
        cb(prop,value.toString());
        this.setState({[prop]:value.toString()})
    }

    selectionLang(language){
        this.setParentState('language',language);
        //var translateFile = new TranslateFile();
        //var translateFileLang = translateFile.setLang(language);
    }

    //ADD IMAGE PROFILE
    selectPhotoProfile() {
        let _this=this;

        this.setState({bttnPhoto:translate("uploadImage")})

        ImagePicker.showImagePicker({
            title: translate("selectAnImage"),
            takePhotoButtonTitle:translate("takePhoto"),
            chooseFromLibraryButtonTitle:translate("chooseOneFromGallery"),
            cancelButtonTitle:translate("cancel")
        },(response) => {
            if (response.didCancel) {
                this.setState({bttnPhoto:translate("addPhoto")})
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                this.setState({bttnPhoto:translate("addPhoto")})
            }
            else if (response.customButton) {
                this.setState({bttnPhoto:translate("addPhoto")})
            }
            else {
                ImageResizer.createResizedImage
                ( response.uri, 1024, 1024, 'JPEG', 80, 0)
                    .then((response) => {
                    _this.uploadImageProfile(response)
                })
                    .catch((err) => {
                    console.log(err)
                });
            }
        });
    }

    uploadImageProfile = (response)=>{
        const img = {
            uri: response,
            type: 'image/jpeg',
            name: 'image' + '-' + Date.now() + '.jpg'
        };

        let imageFormData = new FormData();
        imageFormData.append('image', img);

        var url = DOMAIN + '/api/image-upload/';
        fetch(
            url, {
                method: 'post',
                body: imageFormData
            })
            .then(res => res.json())
            .then(results => {
                const source = results.imageUrl;
                const imageuri = {uri: source};
                this.setState({imageUri: imageuri });
                this.setParentState('image', source);

            })
            .catch(function (e) {
                console.log(e);
            });
    }

    //FACEBOOK
    handleFacebookLogin () {
        LoginManager.logInWithReadPermissions([
            'public_profile',
            'email',
            'read_custom_friendlists',
            'user_about_me',
            'user_birthday',
            'user_location',
            'user_friends',
            //'publish_actions',
        ]).then((result) => {
                this.getAccessToken(result);
            },
            function (error) {
                console.log('Login fail with error: ' + error)
            }
        )
    }

    getAccessToken(result){
        console.log("getAccessToken result",result)
        if (result.isCancelled) {
            console.log('Login cancelled')
        } else {
            AccessToken.getCurrentAccessToken().then((data) => {
                    //alert(data.accessToken.toString())
                    this.getFBUserData(data);
                }
            )
        }
    }

    getFBUserData(data){
        console.log('ABOUTME getFBUserData',data);
        const accessToken = data.accessToken;
        var uri = DOMAIN + '/api/oauth/facebook/token';
        console.log("ABOUTME getFBUserData accessToken",accessToken)

        fetch(
            uri, {
                method: 'post',
                headers: {
                    'Authorization':'Bearer '+accessToken
                },
            })
            .then((response) => {
                console.log("ABOUTME getFBUserData response",response)
                return response.json();
            })
            .then((responseData) => {
                console.log("ABOUTME getFBUserData responseData",responseData)
                return responseData;
            })
            .then((data) => {
                console.log("ABOUTME getFBUserData data",data);

                if(data.profile){
                    this.updateFBUserData(data);

                }else{
                    console.log("ABOUTME getFBUserData dataNo")
                    //new GraphRequestManager().addRequest(req).start()
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .done();
    }


    updateFBUserData(data){
        console.log('ABOUTME updateFBUserData',data);
        var uri = DOMAIN + '/api/oauth/facebook/update';
        var profile = data.profile;
        var accessToken = data.accessToken;

        var body = {
            profile:profile,
            accessToken:accessToken,
            customer:this.props.customer,
        }

        console.log("ABOUTME updateFBUserData body",body)

        fetch(
            uri, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                },
                body: JSON.stringify(body)
            })
            .then((response) => {
                console.log("ABOUTME updateFBUserData response",response)
                return response.json();
            })
            .then((responseData) => {
                console.log("ABOUTME updateFBUserData responseData",responseData)
                return responseData;
            })
            .then((data) => {
                console.log("ABOUTME updateFBUserData data",);

                if(!data.error){
                    this.setState({
                        customerEmail:data.email,
                    },

                    this.props.navigator.push({
                            name: 'Logged',
                            passProps: {
                                data: data.customer,//this.props.data
                                token: this.props.token,
                                profile: this.props.profile,
                                platform:this.props.platform,
                                selectedTab:0,
                            }
                        })
                    )

                }else{
                    console.log("ABOUTME updateFBUserData error")
                    //new GraphRequestManager().addRequest(req).start()
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .done();
    }

    handleFacebookInvite(){

        var domainDevice = Platform.select({
                                ios: DOMAIN,
                                android: DOMAIN
                            });

        var appInviteContent = {
            contentType: 'link',
            contentUrl: DOMAIN,//domainDevice
            contentDescription: translate("facebookMessageInvite"),
        };

        appInviteContent = {
            "applinkUrl": DOMAIN,
        }


        AppInviteDialog.canShow(appInviteContent).then((data) => {
            console.log("handleFacebookInvite data",data)
                // function(canShow) {}
                // if (canShow) {}
                return AppInviteDialog.show(appInviteContent);


        }).then(
            function(result) {
                console.log("handleFacebookInvite data",result)
            /*
                alert('Invite was successful with postId: ' + result.postId);
                if (result.isCancelled) {
                    alert('Invite operation was cancelled');
                } else {
                    alert('Invite was successful with postId: ' + result.postId);
                }
                */
            },
            function(error) {
                alert('Invite failed with error: ' + error);
            }
        );

    }

    handleFacebookShare(){
        const shareLinkContent = {
            contentType: 'link',
            contentUrl: DOMAIN,
            contentDescription:  translate("facebookMessageInvite"),
        };

        ShareApi.canShare(shareLinkContent).then((data) => {
                console.log("handleFacebookInvite data",data)

                //function (canShare) {}
                    //if (canShare) {}
                        return ShareApi.share(shareLinkContent, '/me', 'Some message.');


            }).then(
                function(result) {
                    alert('Share operation with ShareApi was successful');
                },
                function(error) {
                    alert('Share with ShareApi failed with error: ' + error);
                }
        );
    }

    render() {

        const buttons = [translate("women"), translate("men")]
        const {editCard} = this.state
        const {
            address,
            city,
            state,
            postalCode,
            name,
            surname,
            loginType,
            phoneNumber,
            email,
            facebook,
            facebookToken,
            image,
            language
        } = this.props

        let img = image ? {uri:image} : this.state.imageUri

        //FACEBOOK VALIDATE
        var inputPhone=false;
        var inputEmail=true;

        if(loginType=='Facebook'){
            inputPhone=true;
            inputEmail=false;
        }

        if(facebook != null && facebook != ""){
            inputEmail=false;
        }

        ///FRIENDS
        var friends = [];
        console.log("ABOUTME facebookToken",facebookToken)
        if(!(facebookToken=="" || facebookToken==='undefined') && facebook!=""){
            //var profile = JSON.parse(facebook);
            //console.log("ABOUTME facebook profile",profile)
            var uri = "/me";//"/"+profile.id+"/friends";
            console.log("ABOUTME facebook uri",uri)

            AccessToken.getCurrentAccessToken().then(
                (data) => {
                    let accessToken = data.accessToken

                    const responseInfoCallback = (error, result) => {
                        if (error) {
                            console.log("ABOUTME facebook data error",error)
                        } else {
                            console.log("ABOUTME facebook data result",result)
                        }
                    }

                    const params  = {
                        accessToken: accessToken,
                        parameters: {
                            fields: {
                                string: 'email,name,first_name,middle_name,last_name,friends'
                            }
                        }
                    }

                    const infoRequest = new GraphRequest('/me',params,responseInfoCallback);
                    new GraphRequestManager().addRequest(infoRequest).start()

                }
            )
        }

        //SHARE
        let shareOptions = {
            title: "Magnifique",
            message: translate("shareText"),
            url: DOMAIN,
            subject: translate("shareTitle") //  for email
        };


        //CARD
        var postalCode2 = postalCode ? postalCode.toString() : null;
        var cardNumber,expiration;

        if(editCard){
            cardNumber = this.state.cardNumber
            expiration = this.state.expiration
        }else{
            cardNumber = this.props.cardLastNumbers ? '**** **** **** ' + this.props.cardLastNumbers : this.state.cardNumber;
            expiration = this.props.cardLastNumbers ? '**/**' : this.state.expiration;
        }


        return (
            <View>
                <Text
                    style={[styles.text, styles.textLight, styles.title]}>
                    {translate("personalInformation")}
                </Text>

                <TouchableOpacity activeOpacity = { .5 } onPress={this.selectPhotoProfile.bind(this)}>
                  <View style={{ justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        style={{borderRadius: 40,width: 80, height: 80}}
                        onPress={this.selectPhotoProfile.bind(this)}
                        source={img}
                    />
                  </View>
                </TouchableOpacity>

                <FormLabel
                    labelStyle={[styles.text, styles.textLight]}>
                    {translate("name")}
                </FormLabel>

                <FormInput
                    onChangeText={(inputValue) => this.setParentState('name',inputValue)}
                    inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                    value = {name}/>

                <FormLabel
                    labelStyle={[styles.text, styles.textLight]}>
                    {translate("lastName")}
                </FormLabel>

                <FormInput
                    onChangeText={(inputValue) => this.setParentState('surname',inputValue)}
                    inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                    value = {surname}/>

                <View>
                    <Text
                        style={[styles.text, styles.textLight, styles.title]}>
                        {translate("sex")}
                    </Text>

                    <View>
                        <ButtonGroup
                            onPress={this.props.onPress}
                            selectedIndex={this.props.selectedIndex}
                            buttons={buttons}
                            containerStyle={[styles.buttons, {borderWidth:0}]}
                            selectedTextStyle={[styles.buttonsText, {textAlign:'center', fontWeight: 'bold',}]}
                            selectedBackgroundColor={'#fff'}
                            textStyle={[styles.buttonsText, {textAlign:'center'}]}
                        />
                    </View>
                </View>


                <View>
                    <Text
                        style={[styles.text, styles.textLight, styles.title]}>
                        {translate("myAccount")}
                    </Text>

                    <FormLabel
                        labelStyle={[styles.text, styles.textLight]}>
                        {translate("numberPhone")}
                    </FormLabel>

                    <FormInput
                        editable={inputPhone}
                        onChangeText={(inputValue) => this.setParentState('phoneNumber',inputValue)}
                        inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                        value = {phoneNumber}/>

                    <FormLabel
                        labelStyle={[styles.text, styles.textLight]}>
                        {translate("email")}
                    </FormLabel>

                    <FormInput
                        editable={inputEmail}
                        onChangeText={(inputValue) => this.setParentState('email',inputValue)}
                        inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                        value = {email}/>

                    <SocialIcon
                        //button
                        //fontFamily = {'facebook'}
                        //title={translate("InviteWithFacebook..")}
                        fontWeight={'bold'}
                        fontStyle={{fontSize:20}}
                        style={[styles.button, {width:60, height:60, alignSelf:'center'}]}
                        onPress={() => this.handleFacebookInvite()}
                        type='facebook'/>

                    <Button
                        buttonStyle={styles.buttons}
                        textStyle={styles.buttonsText}
                        onPress={()=>{Share.open(shareOptions);}}
                        title={translate("shareApp")}/>
                </View>


                <View>
                    <View>
                        <Text
                            style={[styles.text, styles.textLight, styles.title]}>
                            {translate("myAddress")}
                        </Text>

                        <FormLabel
                            labelStyle={[styles.text, styles.textLight]}>
                            {translate("pAddress")}
                        </FormLabel>

                        <FormInput
                            onChangeText={(inputValue) => this.setParentState('address',inputValue)}
                            inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                            value = {address}/>

                        <FormLabel
                            labelStyle={[styles.text, styles.textLight]}>
                            {translate("city")}
                        </FormLabel>

                        <FormInput
                            onChangeText={(inputValue) => this.setParentState('city',inputValue)}
                            inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                            value = {city}/>

                        <FormLabel
                            labelStyle={[styles.text, styles.textLight]}>
                            {translate("state")}
                        </FormLabel>

                        <FormInput
                            onChangeText={(inputValue) => this.setParentState('state',inputValue)}
                            inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                            value = {state}/>

                        <FormLabel
                            labelStyle={[styles.text, styles.textLight]}>
                            {translate("postalCode")}
                        </FormLabel>

                        <FormInput
                            onChangeText={(inputValue) => this.setParentState('postalCode',inputValue)}
                            inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                            value = {postalCode2}
                            keyboardType={'numeric'}/>
                    </View>

                    <View>
                        <Text style={[styles.text, styles.textLight, styles.title]}>
                            {translate("language")}
                        </Text>

                        {/*
                        <Text style={[styles.text, styles.textLight]}>
                            {translate("LanguagesAvailable")}
                        </Text>
                        */}
                        <View style={styles.sliderStyle}>
                            <Picker
                                style={{color:'#00B1C6'}}
                                selectedValue={language}
                                onValueChange={(language) => this.selectionLang(language)}>
                                <Picker.Item label={translate("spanish")} value={'es'} />
                                <Picker.Item label={translate("english")} value={'en'} />
                                <Picker.Item label={translate("Portuguese")} value={'pt'} />
                            </Picker>
                        </View>

                    </View>

                    <View>
                        <Text
                            style={[styles.text, styles.textLight, styles.title]}>
                            {translate("myCard")}
                        </Text>

                        <TouchableOpacity
                            onPress={this.handleEditCard.bind(this)}>
                            <View style={[styles.boxEdit]}>
                                <Icon
                                    name="edit"
                                    size = {20}
                                    iconStyle={[styles.icons]}/>
                                <Text style={[styles.text, styles.textLight]}>
                                    {translate("edit")}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        <FormLabel
                            labelStyle={[styles.text, styles.textLight]}>
                            {translate("number")}
                        </FormLabel>

                        <FormInput
                            onChangeText={(inputValue) => this.setParentState('cardNumber',inputValue)}
                            inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                            keyboardType={'numeric'}
                            value = {cardNumber}/>

                        <FormLabel
                            labelStyle={[styles.text, styles.textLight]}>
                            {translate("expiration")}
                        </FormLabel>

                        <FormInput
                            onChangeText={(inputValue) => this.setParentState('expiration',inputValue)}
                            inputStyle={[styles.messageInput,{ textAlign:'left' }]}
                            value = {expiration}
                            keyboardType={'numeric'}/>
                    </View>
                </View>
            </View>
        );
    }
}

export default AboutMe;
