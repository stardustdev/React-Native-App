import React, { Component } from 'react';
import { Button, Icon } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker';
import {DOMAIN} from '../../config'
import styles from '../includes/styles';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    TouchableHighlight,
    PixelRatio,
    Alert,
    Modal
} from 'react-native';
import ImageResizer from 'react-native-image-resizer';

//Translate
import {translate, Translate} from 'react-native-translate';

const months=['','ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']
const status={
    Pendiente:'Pendiente confirmación',
    Confirmado: 'Confirmada',
    Cancelado: 'Cancelada',
    Pagado: 'Pagada'
};

class AppointmentsCard extends Component {

    constructor (props) {
        super(props);
        this.state = {
            modalVisible: false,
            modalImage:'',
            addBtn:translate("addPhoto")
        }
        this.onFinish=this.onFinish.bind(this)
        this.setModalVisible=this.setModalVisible.bind(this)
    }

    onFinish(){
        this.setState({addBtn:translate("addPhoto")})
    }

    setModalVisible(visible,src) {
        this.setState({modalVisible: visible,modalImage:src});
    }

    selectPhotoTapped() {

        let _this=this;

        this.setState({addBtn:translate("uploadImage")})

        ImagePicker.showImagePicker({
            title: translate("selectAnImage"),
            takePhotoButtonTitle:translate("takePhoto"),
            chooseFromLibraryButtonTitle:translate("chooseOneFromGallery"),
            cancelButtonTitle:translate("cancel"),
        },(response) => {
            if (response.didCancel) {
                this.setState({addBtn:translate("addPhoto")})
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
                this.setState({addBtn:translate("addPhoto")})
            }
            else if (response.customButton) {
                this.setState({addBtn:translate("addPhoto")})
            }
            else {
                ImageResizer.createResizedImage
                ( response.uri, 1024, 1024, 'JPEG', 80, 0)
                    .then((response) => {
                    _this.uploadImage(response)
                })
                    .catch((err) => {
                    console.log(err)
                });
            }
        });
    }

    uploadImage = (response)=>{
        var saveCallback=this.props.onUpload;

        const image = {
            uri: response,
            type: 'image/jpeg',
            name: 'image' + '-' + Date.now() + '.jpg'
        };

        console.log('image',image)

        let imageFormData = new FormData();
        imageFormData.append('image', image);

        var url = DOMAIN + '/api/image-upload/';
        fetch(
            url, {
                method: 'post',
                body: imageFormData
            })
            .then(res => res.json())
            .then(results => {
                const source = results.imageUrl;
                saveCallback(source, this.props.order._id, this.onFinish)
            })
            .catch(function (e) {
                console.log(e);
            });

    }

    openChatOrder(order){
        this.props.navigator.push({ name: 'Chat',
            passProps: {
                ...this.props,
                ...this.props.extra,
                customer: order.customer,
                employee: order.employee,
                appointment: order,
                selectPhotoTapped: ()=>this.selectPhotoTapped(),
            }
        })
    }

    render(){
        const {order,onCancel,onUpdateStatus,shop} = this.props;
        const onDeleteImage = this.props.onDeleteImage;
        var ImageText = translate("sendPhoto");

        var imagesArray = order.images.map((v,i)=>{
                ImageText = translate("addNewPhoto");
                return (
                    <TouchableOpacity key={i} onPress={()=>this.setModalVisible(true,v)}>
                        <Image key={i} style={styles.avatar} source={{uri:v}} />
                    </TouchableOpacity>
                )
            });


        let orderSt = status[order.status] ? status[order.status].toUpperCase() : ''

        return(
            <View>
                <View style = {[styles.box, styles.boxLight]}>

                    <View style = {{flexDirection:'row',borderBottomColor:'#DDDDDD',borderBottomWidth:1}}>
                        <Icon
                            size = {30}
                            name='location-on'
                            iconStyle={[styles.icons,styles.iconItem]} />
                        <Text style = {[styles.text]}>
                            {order.shop.settings.name}
                        </Text>
                    </View>


                    {/*
                    <Text style = {[styles.text]}>
                        {translate("paymentMode")}: {translate("paymentPlace")}
                    </Text>
                    {shop.settings.showAppServicesPrice === true &&
                        <Text style={[]}>
                            {translate("paymentTotal")}: {order.totalPrice} ‎€
                        </Text>
                    }
                    */}

                    <View style={[styles.dateContain]}>
                        <Text style = {styles.date}>
                            {order.date.substring(0,6).toUpperCase()} {order.time}
                        </Text>
                    </View>

                    <Text  style = {styles.text}>{translate("stylist")}:
                        {order.dresser.toUpperCase()}
                    </Text>

                    <Text style = {styles.text}>
                        {order.servicesNames}
                    </Text>

                    <Text
                        style = {styles.text}
                        onPress={()=>onUpdateStatus(order)}>
                        {translate("status")}: {orderSt}
                    </Text>


                    <View style={[styles.iconsContain,{justifyContent:"flex-end"}]}>

                        {/*(order.status == 'Pendiente') && */}
                        <TouchableHighlight
                            onPress={()=>onUpdateStatus(order)}>
                            <View>
                                <Icon
                                    name="announcement"
                                    size = {30}
                                    iconStyle={[styles.icons, styles.iconAppointment, {color:"#6acc01",}]}/>
                            </View>
                        </TouchableHighlight>

                        <TouchableHighlight
                            onPress={this.selectPhotoTapped.bind(this)}>
                            <View>
                                <Icon
                                    name="camera"
                                    size = {30}
                                    iconStyle={[styles.icons, styles.iconAppointment]}/>
                            </View>
                        </TouchableHighlight>

                        <TouchableHighlight
                            onPress={()=>this.openChatOrder(order)}>
                            <View>
                                <Icon
                                    name="chat"
                                    size = {30}
                                    iconStyle={[styles.icons, styles.iconAppointment]}/>
                            </View>
                        </TouchableHighlight>

                        {(order.status !== 'Cancelado' && this.props.tab === 0) &&
                        <TouchableHighlight
                            onPress={()=>onCancel(order)}>
                            <View>
                                <Icon
                                    name="cancel"
                                    size = {40}
                                    iconStyle={[styles.icons, styles.iconAppointment, styles.iconItemDisable]}/>
                            </View>
                        </TouchableHighlight>
                        }

                    </View>

                    <Text
                        style = {[styles.text, {textAlign:'center'}]}
                        onPress={this.selectPhotoTapped.bind(this)}>
                        {ImageText}
                    </Text>
                    <View style={styles.avatarContainer}>
                        { imagesArray }
                    </View>

                    {/*
                    <Button
                        buttonStyle={{backgroundColor:'rgb(48, 187, 116)',marginLeft:10,marginRight:10,marginTop:0,marginBottom:10,borderRadius:10}}
                        textStyle={{fontFamily:'HelveticaNeueLTStd-Md',fontSize:18}}
                        onPress={this.selectPhotoTapped.bind(this)}
                        title={this.state.addBtn}/>


                    <Button
                        buttonStyle={{backgroundColor:'#00B1C6',marginLeft:10,marginRight:10,marginTop:0,marginBottom:20,borderRadius:10}}
                        textStyle={{fontFamily:'HelveticaNeueLTStd-Md',fontSize:18}}
                        onPress={()=>this.openChatOrder(order)}
                        title={translate("openChat")}/>


                    {(order.status == 'Pendiente') &&
                        <Button
                            buttonStyle={[styles.buttons]}
                            textStyle={styles.buttonsText}
                            onPress={()=>onUpdateStatus(order)}
                            title={translate("updateAppointment")}/>
                    }

                    {(order.status !== 'Cancelado' && this.props.tab===0) &&
                    <Button
                        buttonStyle={[styles.buttons, styles.buttonsDisable]}
                        textStyle={styles.buttonsText}
                        onPress={()=>onCancel(order)}
                        title={translate("cancelAppointment")}/>
                    }

                    */}

                </View>


                <Modal
                    animationType={"slide"}
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {this.setModalVisible(!this.state.modalVisible)}}>
                    <View style={{marginTop: 0,flex:1}}>
                        <View style={styles.modalImageContainer}>
                            <Image
                                style={styles.modalImage}
                                source={{uri:this.state.modalImage}}
                                resizeMode="contain"/>
                            <View style={[styles.avatarContainer,{marginTop:10}]}>
                                <Button
                                    buttonStyle={[styles.buttons]}
                                    textStyle={styles.buttonsText}
                                    title={translate("close")}
                                    onPress={() => {
                                      this.setModalVisible(!this.state.modalVisible)
                                    }}
                                />
                                <Button
                                    buttonStyle={[styles.buttons]}
                                    textStyle={styles.buttonsText}
                                    title='ELIMINAR'
                                    onPress={() => {
                                          onDeleteImage(this.state.modalImage,order,this.setModalVisible)
                                        }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>

            </View>
        );
    }
}

export default AppointmentsCard;
