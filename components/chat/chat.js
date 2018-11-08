import React, { Component } from 'react';
import {FormInput, Button, Icon, SideMenu } from 'react-native-elements'
import AutoScroll from 'react-native-auto-scroll';
import Moment from 'moment';
import CustomBar from '../CustomBar'
import {DOMAIN} from '../../config'
import styles from '../includes/styles';
const Menu = require('./../Menu');
import {translate, Translate} from 'react-native-translate';
import {
    StyleSheet,
    ScrollView,
    Text,
    View,
    Image,
    TouchableOpacity,
    TouchableHighlight,
    PixelRatio,
    Alert,
    Modal
} from 'react-native';



class Chat extends Component {

    constructor (props) {
        super(props);
        this.state = {
            appointment:null,
            customer:this.props.customer._id,
            employee:this.props.employee._id,
            messages:[],
            setMessage:"",
            modalVisibleImages:false,
        }
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    updateMenuState(isOpen) {
        this.setState({ isOpen, });
    }

    onMenuItemSelected = (item) => {
        this.setState({
            isOpen: false,
            selectedItem: item
        });
    }

    toggleSideMenu () {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    onModalChangeVisible(value){
        this.setState({
            modalVisibleImages:value,
        })
    }


    getChat(){
        var URL = DOMAIN+'/api/chat/';

        var body = {
            "customer": this.props.customer._id,
            "employee": this.props.employee._id,
            "appointment": this.props.appointment._id,
        }

        var data = {
            method: 'post',
            dataType: 'json',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization':'Bearer '+this.props.token
            },
            body: JSON.stringify(body)
        }

        this.setState({
            messages:this.state.messages,
        }, function(){   })

        fetch(URL, data)
            .then((response) => {
                return response.json();
            })
            .then((responseData) => {
                return responseData;
            })
            .then((data) => {
                console.log("CHAT get messages data",data)
                this.setState({
                    messages:data.chats
                })
            })
            .catch((error) => {
                console.error(error);
            })
            .done();

    }

    setMessage = async ()=>{
        var URL = DOMAIN+'/api/chat/send/';
        var message = this.state.setMessage;
        var messages = this.state.messages;
        var sendby = "customer";

        var body = {
            "customer": this.props.customer._id,
            "employee": this.props.employee._id,
            "appointment": this.props.appointment._id,
            "sendby": sendby,
            "message": message,
        }

        console.log("CHAT set body",body)
        /*
        messages.push(body);
        this.setState({
            messages:messages,
            setMessage:"",
        }, function(){  })
        */

        let response = await fetch(
            URL, {
                method: 'post',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                },
                body: JSON.stringify(body)
            });

        let result = await response.json()
        //console.log("CHAT set result",result);
        //console.log("CHAT set result chats",result.chats);

        this.setState({
            messages:result.chats,
            setMessage:"",
        }, function(){  })

        if("error" in result){
            console.log("CHAT set result false",result);
            return false;

        }else{
            return true;
        }
    }

    handleMessageInput = (text)=>{
        this.setState({setMessage:text})
    };


    handleMessageSubmit = async ()=>{
        console.log("handleMessageSubmit",'send')

        if(await this.setMessage()){
            console.log("handleMessageSubmit setMessage",'true')

        }else{
            console.log("handleMessageSubmit setMessage",'false')
            this.setState({}, this.getChat())
        }
    }

    returnToAppointments(){
        this.props.navigator.push({ name: 'Appointments',
            passProps: {
                ...this.props,
            }
        })
    }

    async componentDidMount(){
        this.getChat();
        var timer = setInterval(() => {
            this.getChat();
            console.log('setInterval getChat');
        }, 5000);
    }


    componentWillUnmount() {
        clearInterval(timer);
    }

    render(){
        const order = this.props.appointment;
        const {setMessage, messages} = this.state;
        const menu = <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator} {...this.props}/>;

        var employeeShop =  this.props.employee ? this.props.employee.shop.settings.name : translate("Nameless")

        var employee = this.props.employee ? this.props.employee.name ? this.props.employee.name : translate("Nameless") : translate("Nameless")
        var employeeName = employee.toUpperCase();

        var customer = this.props.customer ? this.props.customer.name ? this.props.customer.name : translate("Nameless"): translate("Nameless")
        var customerName = customer.toUpperCase();

        var messagesHTML = [];
        if(messages.length>0){
            messages.map((v)=>{
                console.log("CHAT messages",v)
                var message = v.message;
                var sendby = v.sendby;
                var sendbyName = "";
                var messageStyle = {};
                var messageAlign = {textAlign:'left',};
                var messageContent = {justifyContent: 'flex-start'};

                if(sendby=="employee"){
                   sendbyName = employeeName;//"Estilista: "+
                    messageStyle = styles.messageCustomer;

                }else if(sendby=="customer"){
                    sendbyName = customerName;//"Cliente: "+
                    messageStyle = styles.messageMy;
                    messageAlign = {textAlign:'right',};
                    messageContent = {justifyContent: 'flex-end'};
                }


                messagesHTML.push(
                    <View style = {[{flex: 1, flexDirection: 'row',},messageContent]}>
                        <View style = {[styles.messageGeneral,messageContent,messageStyle]}>
                            <Text style = {[styles.messageGeneralTitle,messageAlign]}>{sendbyName}</Text>
                            <Text style = {[styles.messageGeneralContent,messageAlign]}>{message}</Text>
                        </View>
                    </View>
                )

            });
        }

        var appointmentDate = "";
        var appointmentTime = "";
        var appointmentServicesNames = "";
        var appointmentStatus = "";
        var images = [];

        if(this.props.order !== null){
            var offset = Moment().utcOffset();
            var start= Moment.utc(this.props.order.start).utcOffset(offset).format("YYYY-MM-DD-HH:mm");
            appointmentDate = Moment.utc(order.start).utcOffset(offset).format("DD-MM-YYYY");
            appointmentTime = start.substring(11,16);

            var ServicesPrice = 0;
            var ServicesNames = "";
            this.props.order.services.map( (v)=> {
                order.shop.services.map( (w)=> {
                    if(v==w._id){
                        ServicesPrice+=w.price;
                        ServicesNames+=w.name;
                        ServicesNames+=',';
                    }
                })
            })

            appointmentServicesNames = ServicesNames;
            appointmentStatus = order.status ? order.status.toUpperCase() : '';
            images = order.images;
        }

        return(
            <SideMenu
                menu={menu}
                isOpen={this.state.isOpen}
                onChange={(isOpen) => this.updateMenuState(isOpen)}>

                <CustomBar
                    {...this.props}
                    title = 'Chat'
                    platform = {this.props.platform}
                    onHandleLeftPress = {this.toggle.bind(this)} />

                <View style = {styles.window}>
                    <View>
                        <Text
                            style = {styles.option}
                            onPress = {() => this.returnToAppointments()}>
                            {translate("toReturn")}
                        </Text>
                    </View>

                    <View style = {[styles.box, styles.boxLight,{flex:undefined}]}>

                        <View style={[styles.dateContain]}>
                            <Text style = {[styles.date]}>{appointmentDate} {appointmentTime}</Text>
                        </View>

                        <View style = {{flexDirection:'row',borderBottomColor:'#DDDDDD',borderBottomWidth:1}}>
                            <Icon
                                size = {30}
                                name='location-on'
                                iconStyle={[styles.icons,styles.iconItem]} />
                            <Text style = {[styles.text]}>
                                {employeeShop}
                            </Text>
                        </View>

                        {/*
                        <Text style={[styles.text]}>{customerName}</Text>
                        */}

                        <Text style={[styles.text, { textAlign:'center'}]}>{employeeName}</Text>
                        <Text style={[styles.text, { textAlign:'center'}]}>{appointmentServicesNames}</Text>

                        {/*images.length>0 &&
                        <View>
                            <Text
                                style = {[styles.text]}
                                onPress = {()=>this.setState({modalVisibleImages:true})}>{translate("seeImages")}</Text>
                        </View>
                        */}
                    </View>

                    <AutoScroll style={styles.scrollView}>
                        <View>
                            {messagesHTML}
                        </View>
                    </AutoScroll>
                </View>

                <View style={styles.messageContent}>
                    <View style={styles.setMessage}>
                        <View style={styles.messageSectionInput}>
                            <FormInput
                                inputStyle={[styles.messageInput, styles.messageInputLight]}
                                placeholder={ translate("Message")}
                                textInputRef='message'
                                onChangeText={(text)=>this.handleMessageInput(text)}
                                value={setMessage}
                                keyboardType={'text'} />
                        </View>

                        <View style={styles.iconsContain}>
                            <TouchableHighlight
                                onPress={() => this.handleMessageSubmit()}>
                                <View>
                                    <Icon
                                        name="send"
                                        size = {30}
                                        iconStyle={[styles.icons, styles.iconItem]}/>
                                </View>
                            </TouchableHighlight>

                            <TouchableHighlight
                                onPress={() => this.props.selectPhotoTapped()}>
                                <View>
                                    <Icon
                                        name="camera"
                                        size = {30}
                                        iconStyle={[styles.icons, styles.iconItem]}/>
                                </View>
                            </TouchableHighlight>

                            {images.length>0 &&
                            <TouchableHighlight
                                onPress={() => this.setState({modalVisibleImages:true})}>
                                <View>
                                    <Icon
                                        name="image"
                                        size = {25}
                                        iconStyle={[styles.icons,styles.iconItem]}/>
                                </View>
                            </TouchableHighlight>
                            }
                        </View>
                    </View>
                    <ModalImages
                        visible={this.state.modalVisibleImages}
                        onModalChangeVisible = {(visible)=>this.onModalChangeVisible(visible)}
                        images={images}
                        styles={styles}/>
                </View>
            </SideMenu>
        );
    }
}

class ModalImages extends Component{

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: this.props.visible,
            images: this.props.images,
        }
        console.log("modalImages",this.state)
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
        this.props.onModalChangeVisible(visible);
    }

    componentWillReceiveProps(nextProps){
        if(this.props != nextProps) {
            this.setState({modalVisible: nextProps.visible,images:nextProps.images})
        }
    }

    render() {
        var styles = this.props.styles;
        var images = this.state.images;
        console.log("modalImages images",images)
        var imagesArray = images.map((v,i)=>{
            return (
                <TouchableOpacity key={i} onPress={()=>this.setModalVisible(true,v)}>
                    <Image key={i} style={styles.avatar} source={{uri:v}} />
                </TouchableOpacity>
            )
        });

        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {this.setState({modalVisible:false})}}
                    style={styles.SelectModals}>

                    <View>
                        <Button
                            key={'0'}
                            buttonStyle={styles.SelectModalsClose}
                            textStyle={styles.SelectModalsCloseText}
                            onPress = {()=>{this.setModalVisible(false)}}
                            title={translate("close")}/>
                        <ScrollView>
                            <View style={[styles.avatarContainer,styles.SelectOption,{paddingTop:20, paddingBottom:20,}]}>
                                {imagesArray}
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        );
    }
}

export default Chat;