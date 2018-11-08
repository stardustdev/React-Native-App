import React, { Component } from 'react';
import { ButtonGroup, Button, SideMenu, List, ListItem, Icon, CheckBox,  } from 'react-native-elements'
import NavigationBar from 'react-native-navbar';
import {DOMAIN} from './../../config'
import DatePicker from 'react-native-datepicker'
import Moment from 'moment';
import AppointmentsCard from './AppointmentCard'
import CustomBar from '../CustomBar'
import styles from '../includes/styles';
const Menu = require('./../Menu');
import {translate, Translate} from 'react-native-translate';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    PixelRatio,
    Picker,
    Alert,
    Modal,
    TouchableHighlight
} from 'react-native';

const status={
    Pendiente:'Pendiente confirmación',
    Confirmado: 'Confirmada',
    Cancelado: 'Cancelada',
    Pagado: 'Cancelada'
};

const months=['','ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']

class AppointmentsView extends Component {

    constructor (props) {
        super(props);

        this.state = {
            isOpen: false,
            selectedItem: 'About',
            selectedIndex: 0,
            orderlist: null,
            avatarSource: null,
            videoSource: null,
            images:[],
            modalVisible: false,
            servicesModalVisible: false,
            dressersModalVisible: false,
            saveBtn:translate("saveAppointment"),
            opening:null,
            step:0,
            service: [],
            newOrder:{
                services: [],
                servicesNames:'',
                duration:0,
                totalPrice:0,
                date: null,
            },
            shop:{
                settings: [],
            },
        };
        this.toggleSideMenu = this.toggleSideMenu.bind(this)
        this.updateStatus = this.updateStatus.bind(this)
        this.cancelAppointment = this.cancelAppointment.bind(this)
        this.saveAppointment = this.saveAppointment.bind(this)
        this.updateIndex = this.updateIndex.bind(this)
        this.loadAppointmentData = this.loadAppointmentData.bind(this)
        this.addServiceToNewAppointment = this.addServiceToNewAppointment.bind(this)
        this.addDresserToNewAppointment = this.addDresserToNewAppointment.bind(this)
        this.changeDresserToNewAppointment = this.changeDresserToNewAppointment.bind(this)
        this.getAppointments = this.getAppointments.bind(this)
        this.saveImage = this.saveImage.bind(this)
        this.deleteImage = this.deleteImage.bind(this)
    }

    saveImage(src,id,cb){

        var body={
            id:id,
            photoUrl:src
        };
        var url = DOMAIN+'/api/appointments/image/';
        fetch(
            url, {
                method: 'post',
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }
            })
            .then(res => res.json())
            .then(results => {
                this.getAppointments()
                cb();
            })
            .catch(function(e) {
                console.log(e);
            });
    }

    deleteImage(src,order,cb){

        const images = order.images.filter((v)=>{
            return v !== src;
        });

        var body={
            images:images,
            employee:order.employee,
            end:order.end,
            start:order.start,
            shop:order.shop
        };
        var url = DOMAIN+'/api/appointments/'+order._id;
        fetch(
            url, {
                method: 'put',
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }
            })
            .then(res => res.json())
            .then(results => {
                this.getAppointments()
                cb(false);
            })
            .catch(function(e) {
                console.log(e);
            });
    }

    addServiceToNewAppointment(service){

        const {
            step,
            allServices,
            shop,
            newOrder
        } = this.state;

        if(service===0){
            this.setState({
                newOrder:{
                        ...this.state.newOrder,
                        services: [],
                        servicesNames:'',
                        duration:0,
                        totalPrice:0
                    },
                  servicesModalVisible:false
            })
            return false;
        }


        var services = newOrder.services || [];
        //No adding service if already in array
        var exit=false;
        services.map((serv)=> {
            /*
            if(serv===service){
                exit=true;
            }
            */
        })
        if(exit)return false;

        services.push(service);
        var totalPrice = 0;
        var duration = 0;

        var servicesNames='';
        var first=true;
        allServices.map((v)=>{
            services.map((w)=>{
                if(w===v._id){
                    servicesNames = first ? '' : servicesNames+' - ';
                    servicesNames+= v.name;
                    first = false;
                    totalPrice+=v.price
                    duration+=v.duration
                }
            });
        });

        let newStep = step;
        if (step===0){
            newStep=1
        }

        this.setState({
            newOrder:{
                ...this.state.newOrder,
                services: services,
                servicesNames:servicesNames,
                duration:duration,
                totalPrice:totalPrice
            },
            servicesModalVisible:false,
            step:newStep
        })

    }

    addDresserToNewAppointment(employee){

        const {allEmployees} = this.state;

        var employeesNames='';

        allEmployees.map((v)=>{
            if(employee===v._id){
               employeesNames=v.name.toUpperCase()
            }
        })

        this.setState({
          newOrder:{
              ...this.state.newOrder,
              employee: employee,
              employeesNames:employeesNames,
              date:null,
              time:null
          },
          dressersModalVisible:false,
          step:2
      })
    }

    changeDresserToNewAppointment(){
        this.setState({
            modalVisible: false,
            servicesModalVisible: false,
            dressersModalVisible:false,
            step:1
        })
    }

    loadAppointmentData(){
        this.setState({step:0})
        fetch(
            DOMAIN+'/api/shops/'+this.props.data.shop, {
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

            var nodes=[<Picker.Item label={translate("addService")} value={0} />];
                responseData.shop.services.map(({name, _id}) =>
                    nodes.push(<Picker.Item label={name} value={_id} />)
                )
                this.setState({allServices:responseData.shop.services,selectorServices:nodes,newOrder:{},saveBtn:translate("saveAppointment")});

            })
            .catch(function(e) {
                console.log(e);
            });

        fetch(
            DOMAIN+'/api/employees/shop/'+this.props.data.shop, {
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
                var nodes=[<Picker.Item label={translate("selectStylist")}value={0} />];

                let dressers = responseData.filter((v)=>{
                    return v.roles==='Estilista'
                })

                dressers.map(({name, _id}) =>
                    nodes.push(<Picker.Item label={name} value={_id} />)
                )
                this.setState({allEmployees:responseData,selectorEmployees:nodes,dressers:dressers});
            })
            .catch(function(e) {
                console.log(e);
            });
    }

    selectPhotoTapped() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                return new Promise((resolve, reject) => {

                    let imageFormData = new FormData();

                    imageFormData.append('image', response);

                    var url = DOMAIN+'/api/image-upload/';
                    fetch(
                        url, {
                            method: 'post',
                            body: imageFormData
                        })
                        .then(res => res.json())
                        .then(results => {
                            const source =  results.imageUrl;
                            this.saveImage(source)
                        })
                        .catch(function(e) {
                            console.log(e);
                        });
                });
            }
        });
    }

    updateIndex (selectedIndex) {
        if(selectedIndex!=this.state.selectedIndex){
            this.setState({selectedIndex})
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

    cancelAppointment(order){
        Alert.alert(
            translate("cancelReservation"),
            translate("cancelReservationMessage"),
            [
                {text: translate("cancelReservationCancel"), onPress: () => console.log('Cancel'), style: 'cancel'},
                {text: translate("cancelReservationOk"), onPress: () => {

                    fetch(
                        DOMAIN+'/api/appointments/'+order._id, {
                            method: 'put',
                            dataType: 'json',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json',
                                'Authorization':'Bearer '+this.props.token
                            },
                            body:JSON.stringify(
                                {status:'Cancelado'}
                            )
                        })
                        .then((response) =>
                        {
                            order.status='Cancelado';
                            this.setState(this.state);
                            return response.json();
                        })
                        .catch((error) => {
                            console.error(error);
                        })
                        .done();

                    }},
            ],  { cancelable: false }
        );
    }

    updateStatus(order){
        Alert.alert(
            translate("confirmReservation"),
            translate("confirmReservationMessage"),
            [
                {text: translate("confirmReservationCancel"), onPress: () => console.log('Cancel'), style: 'cancel'},
                {text: translate("confirmReservationOk"), onPress: () => {

                        fetch(
                            DOMAIN+'/api/appointments/'+order._id, {
                                method: 'put',
                                dataType: 'json',
                                headers: {
                                    'Accept': 'application/json',
                                    'Content-Type': 'application/json',
                                    'Authorization':'Bearer '+this.props.token
                                },
                                body:JSON.stringify(
                                    {status:'Confirmado'}
                                )

                            }).then((response) =>{
                            order.status='Confirmado';
                            this.setState(this.state);
                            return response.json();

                        }).catch((error) => {
                            console.error(error);

                        }).done();

                }},
            ],  { cancelable: false }
        );
    }

    getOpening = () =>{

        fetch(
            DOMAIN+'/api/shops/'+this.props.data.shop, {
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

                this.setState({
                    opening:data.shop.opening,
                    shop:data.shop
                })

                //new Appointment
                this.newAppointment();
            })
            .catch((error) => {
                console.error(error);
            })
            .done();
    }


    getAppointments(){
        fetch(
            DOMAIN+'/api/appointments/customer/'+this.props.data._id, {
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
                this.setState({
                    orderlist:data,
                    newOrder:false
                })
            })
            .catch((error) => {
                console.error(error);
            })
            .done();
    }

    saveAppointment(order){
        var d = Moment(order.date,'DD-MM-YYYY')._d;
        var e = Moment(order.time,'HH:mm')._d;
        var ih = new Date(e).getHours();
        var im = new Date(e).getMinutes();

        var iniTime = new Date(new Date(d.setHours(ih)).setMinutes(im));
        var endTime = new Date(iniTime);
        endTime.setMinutes(endTime.getMinutes() + order.duration)

        var data={
            ...order,
            shop:this.props.data.shop,
            start:iniTime,
            end:endTime,
            customer:this.props.data._id,
            createdBy:'Customer'
        };

        if(!order.date){
            Alert.alert(translate("Attention"),translate("mNotselectedDate"));
            return false;
        }
        if(!order.time){
            Alert.alert(translate("Attention"),translate("mNotselectedTime"));
            return false;
        }
        if(new Date(iniTime).getTime()<new Date().getTime()){
            Alert.alert(translate("Attention"),translate("mDateCanNotPassed"));
            return false;
        }
        if(!order.employee){
            Alert.alert(translate("Attention"),translate("mYouSelectedStylist"));
            return false;
        }
        if(!order.services){
            Alert.alert(translate("Attention"),translate("mNotSelectedService"));
            return false;
        }

        this.setState({saveBtn:translate("saving")})
        fetch(
            DOMAIN+'/api/appointments/', {
                method: 'post',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                },
                body:JSON.stringify(data)
            })
            .then((response) =>
            {
                this.setState({step:0,newOrder:false})
                this.getAppointments()
            })
            .catch((error) => {
                console.error(error);
            })
            .done();
    }

    dateSelect = (date,newOrder)=>{
        let day = Moment(date,'DD-MM-YYYY').hour(8)
        let nOfDay = day.day();
        let today=Moment().hour(0);
        if (day<today){
            Alert.alert (translate("Attention"),translate("mCanNotSelectPastDate"))
        /*
        }else if (nOfDay === 0){
            Alert.alert (translate("Attention"),translate("mSundayHairdressingClosed"))
        }else if (nOfDay === 1){
            Alert.alert (translate("Attention"),translate("mMondayHairdressingClosed"))
         */

        }else {
            this.setState({
                modalVisible:true,
                newOrder:{
                    ...newOrder,
                    date: date,
                    time: null
                }
            }, () => {

            })
        }
    }

    //timeSelect = (time,newOrder)=>{
    //    let hour = parseInt(time.substring(0,2))
    //    if (hour<10 || hour>19){
    //        Alert.alert ('Atención','El horario de apertura es de 10 a 20h. Por favor, elige otra hora.')
    //    }else {
    //        this.setState({newOrder:{...newOrder,time: time}})
    //    }
    //}

    onModalChangeVisible(value){
      this.setState({
          modalVisible:value,
          servicesModalVisible: false,
          dressersModalVisible: false,
      })
    }

    async componentDidMount(){
        this.getOpening()
        this.getAppointments()
    }

    newAppointment(){
      if(this.props.newAppointment){
        this.props.newAppointment=false;
        this.loadAppointmentData();
      }
    }

    setTime(hour){
        var { newOrder } = this.state;
        this.setState({
          newOrder:{
            ...newOrder,
            time:hour
          },
          modalVisible:false,
          step:5
        })
    }

    render(){
        const buttons = [translate("upcoming"),translate("previous")]
        const menu = <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator} {...this.props}/>;
        var { step,allServices,dressers,selectedIndex,newOrder,shop,saveBtn,modalVisible,servicesModalVisible,dressersModalVisible } = this.state;
        var time=null, date=null,dresser=null;
        var appointmentsView=null;
        var newAppointmentView=null;
        var timeSelected = !newOrder ? translate("selectHour") : newOrder.time ? newOrder.time : translate("selectHour")


        let {year, month, day} = new Date();
        let min = new Date(year, month, day, 11);
        let max = new Date(year, month, day, 20);


        const newAppointmentBtn = shop ? (
            <Button
                key='123'
                buttonStyle={styles.buttons}
                textStyle={styles.buttonsText}
                title={translate("newAppointment")}
                onPress={() => this.loadAppointmentData()}
                iconSize = {35}/>
        ) : null;

        if(newOrder){
            var newStatus = !newOrder.status ? translate("waitingSelections") : status[newOrder.status] ? status[newOrder.status].toUpperCase() : translate("unknown");
            var servicesNames = newOrder.servicesNames ? newOrder.servicesNames : ''
            var employeesNames = newOrder.employeesNames ? newOrder.employeesNames : ''
            var totalPrice = newOrder.totalPrice ? newOrder.totalPrice : 0

                newAppointmentView=(
                <View style = {[styles.box, styles.boxLight]}>

                    {/*
                    <Text style = {[styles.text]}>
                        {translate("paymentMode")}: {translate("paymentPlace")}
                    </Text>
                    */}

                    {/*
                    <Text style = {[styles.timetable]}>{translate("salonHour")}</Text>
                    */}

                    {step == 0 &&
                    <View>
                        <Text style={[styles.boxEditSteps]}>
                            {translate("step")}  {step+1}
                        </Text>
                        <Button
                            key='234'
                            buttonStyle={[styles.buttons]}
                            textStyle={styles.buttonsText}
                            onPress = {()=>this.setState({servicesModalVisible:true})}
                            title={translate("addService")}/>
                    </View>
                    }

                    {step > 0 &&
                    <View style={[styles.boxEdit]}>
                        <Icon
                            name="edit"
                            size = {20}
                            iconStyle={[styles.icons]}/>
                        <Text style = {[styles.text]}
                              onPress = {()=>this.setState({servicesModalVisible:true})}>
                            {servicesNames}
                        </Text>
                    </View>
                    }


                    {step == 1 &&
                        <View>
                            <Text style={[styles.boxEditSteps]}>
                                {translate("step")}  {step+1}
                            </Text>
                            <Button
                                key='235'
                                buttonStyle={[styles.buttons]}
                                textStyle={styles.buttonsText}
                                onPress = {()=>this.setState({dressersModalVisible:true})}
                                title={translate("selectStylist")}/>
                        </View>
                    }

                    {step > 1 &&
                        <View style={[styles.boxEdit]}>
                            <Icon
                                name="edit"
                                size = {20}
                                iconStyle={[styles.icons]}/>
                            <Text style={[styles.text]}
                                  onPress = {()=>this.setState({dressersModalVisible:true})}>
                                {translate("stylist")}: {employeesNames}
                            </Text>
                        </View>
                    }

                    {/*step == 1 &&
                    <Button
                        key='234'
                        buttonStyle={[styles.buttons]}
                        textStyle={styles.buttonsText}
                        onPress = {()=>{this.changeDresserToNewAppointment()}}
                        title={translate("changeStylist")}/>
                    */}


                    {/*
                    <View style = {{flexDirection:'row',borderBottomColor:'#DDDDDD',borderBottomWidth:1}}>
                        <Icon
                            size = {30}
                            iconStyle = {{marginLeft:15}}
                            name='location-on' />
                        <View>
                            <Text style = {styles.centerTitle}>{translate("place")}</Text>
                            <Text style = {styles.center}>{shop.settings.name}</Text>
                        </View>
                    </View>
                    */}
                    {step > 1 &&
                    <View>
                        {step == 2 &&
                            <Text style={[styles.boxEditSteps]}>
                                {translate("step")} {step + 1}
                            </Text>
                        }
                        <View style={[styles.dateContain]}>
                            <View style={[styles.date, styles.boxEdit]}>
                                {/*
                                <Text style={styles.date_header}>{translate("date")}</Text>
                                */}
                                <Icon
                                    name="edit"
                                    size = {20}
                                    iconStyle={[styles.icons]}/>
                                <DatePicker
                                    date={newOrder.date}
                                    mode="date"
                                    placeholder={translate("selectDate")}
                                    format="DD-MM-YYYY"
                                    confirmBtnText="Confirmar"
                                    cancelBtnText="Cancelar"
                                    onDateChange={(date) => {this.dateSelect(date,newOrder)}}
                                    showIcon={false}
                                    customStyles={
                                        {dateInput:{borderWidth:0},
                                            placeholderText:[styles.text, styles.textLight],
                                            dateText:[styles.text, styles.textLight]
                                        }
                                    }/>
                            </View>

                            <View style={[styles.date, styles.boxEdit]}>
                                {/*
                                <Text style={styles.time_header}>{translate("time")}</Text>
                                 */}
                                <Icon
                                    name="edit"
                                    size = {20}
                                    iconStyle={[styles.icons]}/>
                                <Text
                                    style={[styles.text, styles.textLight]}
                                    onPress={()=>this.setState({modalVisible:true})}>
                                    {timeSelected}
                                </Text>

                            </View>
                        </View>
                    </View>
                    }

                    {step < 5 &&
                    <Text style={[styles.text, styles.boxEdit]}>{translate("status")}: {newStatus}</Text>
                    }

                    {step > 4 &&
                    <View>
                        {shop.settings.showAppServicesPrice === true &&
                        <Text style = {[styles.text, {textAlign:'center'}]}>
                            {translate("paymentTotal")}: {totalPrice} ‎€
                        </Text>
                        }
                        <Button
                            key='234'
                            buttonStyle={[styles.buttons]}
                            textStyle={styles.buttonsText}
                            onPress={()=>this.saveAppointment(newOrder)}
                            title={saveBtn}/>
                    </View>
                    }
                </View>
            )
        }

        //var cancelButtons = ()=>{
        //    var confirm=null
        //    var button = (
        //        <Button
        //            buttonStyle={styles.buttons}
        //            textStyle={styles.buttonsText}
        //            onPress={this.cancelAppointment}
        //            title='CANCELAR RESERVA'/>
        //    )
        //    if (cancel){
        //        confirm = (
        //
        //        )
        //    }
        //}

        const orderlist = this.state.orderlist ;

        if(orderlist){
            var orders;

            orderlist.sort(function(a,b){
                //console.log("orderlist.sort a.start",a.start);
                return new Date(a.start).getTime() - new Date(b.start).getTime();
                //return parseInt(a.OrderId)  - parseInt(b.OrderId);
            });

            var nextAppointments = orderlist.filter((v)=>{
                return (new Date(v.start).getTime()>new Date().getTime())&&v.status!=='Cancelado';
            });

            var pastAppointments = orderlist.filter((v)=>{
                return (new Date(v.start).getTime()<new Date().getTime())&&v.status!=='Cancelado';
            });

            if(selectedIndex===0){
                orders = nextAppointments
            }else{
                orders = pastAppointments
            }

            if(orders.length>0){
                appointmentsView = [
                    newAppointmentBtn,
                    newAppointmentView,
                    orders.map((order)=>{

                        var price=0;
                        var services='';
                        var offset = Moment().utcOffset();
                        var start=Moment.utc(order.start).utcOffset(offset).format("YYYY-MM-DD-HH:mm");
                        order.date=start.substring(8,10)+'-'+months[parseInt(start.substring(5,7))];
                        order.time=start.substring(11,16);
                        order.dresser=order.employee.name;
                        console.log("Appointment ID",order._id);

                        order.products.map( (v)=> {
                            price+=v.price;
                        });
                        let first=false;
                        order.services.map( (v)=> {
                            order.shop.services.map( (w)=> {
                                if(v==w._id){
                                    price+=w.price;
                                    if(first)services+=' - ';
                                    services+=w.name;
                                    first=true
                                }
                            })

                        })

                        order.totalPrice=price;
                        order.servicesNames=services;

                        return (
                            <AppointmentsCard
                                key={order._id}
                                order = {order}
                                onCancel = {this.cancelAppointment}
                                onUpdateStatus = {this.updateStatus}
                                onUpload = {this.saveImage}
                                onDeleteImage = {this.deleteImage}
                                tab = {selectedIndex}
                                shop = {shop}
                                token={this.props.token}
                                navigator={this.props.navigator}
                                extra={this.props}
                            />
                        )
                    })
                ]
            }else{
                if(selectedIndex===0){
                    if(newOrder){
                        appointmentsView=[newAppointmentView];
                    }else{
                        appointmentsView=newAppointmentBtn;
                    }
                }else{
                    appointmentsView=(
                        <Text style={styles.message}>No tienes ninguna cita anterior</Text>
                    )
                }
            }
        }else{
            if(selectedIndex===0){
                if(newOrder){
                    appointmentsView=newAppointmentView;
                }else{
                    appointmentsView=newAppointmentBtn;
                }
            }else{
                appointmentsView=(
                    <Text style={styles.message}>No tienes ninguna cita anterior</Text>
                )
            }
        }

        dresser = newOrder ? newOrder.employee : null;
        var modalDate = newOrder ? newOrder.date : null;

        return (
        <SideMenu
            menu={menu}
            isOpen={this.state.isOpen}
            onChange={(isOpen) => this.updateMenuState(isOpen)}>
            <CustomBar
                {...this.props}
                title = {translate("myAppointments")}
                platform = {this.props.platform}
                onHandleLeftPress = {this.toggle.bind(this)}/>
                <View style={[styles.window]}>

                    <ScrollView>
                        <View>

                            {this.props.data.shop ? (
                                <ButtonGroup
                                    buttons={buttons}
                                    onPress={this.updateIndex}
                                    selectedIndex={selectedIndex}
                                    containerStyle={[styles.buttons, {borderWidth:0}]}
                                    textStyle={[styles.buttonsText, {textAlign:'center'}]}
                                    selectedBackgroundColor={'#fff'}/>
                            ):(
                                <Text style={styles.noShop}>{translate("withoutSalonSelected")}</Text>

                            )}

                            {appointmentsView}

                            <ServicesModal
                                visible={servicesModalVisible}
                                services={allServices}
                                addService={(id)=>this.addServiceToNewAppointment(id)}
                                onModalChangeVisible = {(visible)=>this.onModalChangeVisible(visible)}
                                styles={styles}/>

                            <DressersModal
                                visible={dressersModalVisible}
                                dressers={dressers}
                                addDresser={(id)=>this.addDresserToNewAppointment(id)}
                                onModalChangeVisible = {(visible)=>this.onModalChangeVisible(visible)}
                                styles={styles}/>

                            <TimeModal
                                visible={modalVisible}
                                setTime={(hour)=>this.setTime(hour)}
                                onModalChangeVisible = {(visible)=>this.onModalChangeVisible(visible)}
                                changeDresser = {()=>this.changeDresserToNewAppointment()}
                                duration={this.state.newOrder.duration}
                                shop={this.props.data.shop}
                                dresser={dresser}
                                date={modalDate}
                                opening={this.state.opening}
                                token={this.props.token}
                                styles={styles}/>

                    </View>
                </ScrollView>
            </View>
        </SideMenu>

        )
    }
}

class TimeModal extends Component{

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: this.props.visible,
            hours : []
        }
    }

    changeDresser(){
        this.props.changeDresser()
    }

    getTimeTable(dresser,date){
        var body={
            shop:this.props.shop,
            dresser:dresser,
            date:date
        };

        if(date){
            var url = DOMAIN+'/api/appointments/date/';
            fetch(
                url, {
                    method: 'post',
                    body: JSON.stringify(body),
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization':'Bearer '+this.props.token
                    }
                })
                .then(res => res.json())
                .then(results => {
                    this.getFreeHours(results)
                })
                .catch(function(e) {
                    console.log(e);
                });
        }

    }

    getHourInt(hour){
      return hour.toString().replace('00','')
    }

    getFreeHours = (appointments)=>{
        var hours = [];
        const {
            date,
            duration
        } = this.props;


        var dateSplit = date.split('-')
        var dateText = dateSplit[2]+'-'+dateSplit[1]+'-'+dateSplit[0]
        var dateNew = new Date(dateText);

        var dateWeekDay = Moment(dateNew).isoWeekday();
        var DataOpeningDay  = this.props.opening[dateWeekDay]

        //setOpening
        var start = DataOpeningDay.morning.start;
        var end = DataOpeningDay.evening.end;
        if(start!=null && end!=null){

            start = this.getHourInt(start);
            if(start/100 > 1){
                start = (start/100)|0;
            }

            end = this.getHourInt(end);
            if(end/100 > 1){
                end = (end/100)|0;
            }

          for(var i=start*1; i<=(end-1); i++){
            hours.push(i.toString())
          }

          var middayend = DataOpeningDay.morning.end;
          var middaystart = DataOpeningDay.evening.start;
          if(middaystart!==null && middayend!==null){
            middaystart = this.getHourInt(middaystart);
            middayend = this.getHourInt(middayend);

            for(var i=middayend; i<=middaystart; i++){
              var index = array.indexOf(i)
              if (index !== -1) {
                  hours.splice(index, 1);
              }
            }
          }
        }


        //setAppointment
        if(appointments){
            appointments.map((apntmt)=>{
                if(apntmt.status!='Cancelado' && apntmt.status!='Eliminado' && apntmt.status!='Pendiente'){
                    let startH = parseInt(Moment(apntmt.start).format('HH'));
                    let endH = Moment(apntmt.end).format('HH');
                    let endM = Moment(apntmt.end).format('mm');

                    let end = endM==='00' ? parseInt(endH) : parseInt(endH) + 1;

                    for (let x=startH;x<=end-1;x++){
                        var index = hours.indexOf(x.toString());
                        if (index !== -1) {
                            hours.splice(index, 1);
                        }
                    }
                }
            })
        }

        //setCurrentHour
        var today = new Date();
        let hour = today.getHours();
        let month = parseInt(today.getMonth()+1);
        if(month<10){
            month = '0'+month;
        }

        let day= today.getDate()+"-"+month+"-"+ today.getFullYear();
        let nday = Moment().hour(0);


        if (day==date){//day==nday
            for (let x=hour;x>0;x--){
                var index = hours.indexOf(x.toString());
                if (index !== -1) {
                    hours.splice(index, 1);
                }
            }
        }


        //setHourDuration
        var lengthHours = hours.length;
        hours.map((hour) => {

        });

/*
        for (let x=0; x<=lengthHours; x++){
            var search = duration
            var index = hours.indexOf(x.toString());
            var indexSearhc = hours.indexOf(x.toString());
            if (index !== -1) {
                hours.splice(index, 1);
            }
        }

*/

        this.setState({
            hours:hours
        });

        if(hours.length==0 && this.state.modalVisible === true){
            //this.props.onModalChangeVisible(false);
            Alert.alert(
                translate("Attention"),
                translate("mNoAvailableForSelectedDay")
            );
        }
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
        this.props.onModalChangeVisible(visible);
    }

    onTimeSelect(hour){
      var duration = this.props.duration;
      var hours = this.state.hours;

        if(hour.replace(':00','')-(-duration/60)>hours[hours.length]){
            this.props.onModalChangeVisible(false);
            //Alert.alert(translate("Attention"),'Su servicio es de aproximadamente '+duration+' minutos, no pude seleccionar este horario.')
            Alert.alert(translate("Attention"),translate("mMustSelectAnotherTime"))

        }else{
          this.props.setTime(hour)

        }
    }

    componentWillReceiveProps(nextProps){
        if(this.props != nextProps) {
            this.setState({modalVisible: nextProps.visible})
            this.getTimeTable(nextProps.dresser,nextProps.date);
        }
    }

    render() {
        let _this = this;
        let hours = this.state.hours
        let hoursView = null
        let modalVisible = this.state.modalVisible

        if(hours.length>0){
          hoursView = hours.map((hour)=>{
              return(
                  <Button
                      key={hour}
                      buttonStyle={[styles.SelectOption]}
                      textStyle={[styles.SelectOption]}
                      onPress = {()=>{_this.onTimeSelect(hour+':00')}}
                      title={hour+':00'}/>
              )
          })
        }else{
          if(modalVisible === true){
            modalVisible = false;
          }

        }

        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {this.setState({modalVisible:false})}}
                    style={styles.SelectModals}>
                    <View>
                        <Button
                            key={'0'}
                            buttonStyle={[styles.SelectModalsClose]}
                            textStyle={[styles.SelectModalsCloseText]}
                            onPress = {()=>{_this.setModalVisible(false)}}
                            title={translate("close")}/>
                        <View>
                            <Text style={styles.SelectTitle}>{translate("selectTime")}</Text>
                        </View>
                        <View>
                            {hoursView}
                        </View>
                        <View>
                            <Button
                                key='234'
                                buttonStyle={styles.SelectButton}
                                textStyle={styles.SelectOptionText}
                                onPress = {()=>{this.changeDresser()}}
                                title={translate("changeStylist")}/>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}

class ServicesModal extends Component{

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: this.props.visible,
            services : []
        }
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
        this.props.onModalChangeVisible(visible);
    }

    onServiceSelect(id){
        this.props.addService(id)
    }

    componentWillReceiveProps(nextProps){
        if(this.props != nextProps) {
            this.setState({modalVisible: nextProps.visible,services:nextProps.services})
        }
    }

    render() {

        let _this = this;

        let services = this.state.services

        let ServiceView = null;
        if(services!==undefined){
            ServiceView = services.map((service)=>{
                /*
              return(
                  <TouchableOpacity
                      onPress={()=>{_this.onServiceSelect(service._id)}}
                      key={service.name}
                  >
                      <Text style={[styles.timeBox,{minWidth:300}]}>{service.name}</Text>
                  </TouchableOpacity>
              )
              */

                return(
                    <Button
                        key={service.name}
                        buttonStyle={styles.SelectOption}
                        textStyle={styles.SelectOptionText}
                        onPress = {()=>{_this.onServiceSelect(service._id)}}
                        title={service.name}/>
                )
          })
        }

        /*
        <TouchableOpacity
            onPress={()=>{_this.onServiceSelect(0)}}
            key={0}
        >
            <Text style={[styles.timeBox,{minWidth:300,color:'#8f1517'}]}>{'QUITAR SELECCIONADOS'}</Text>
        </TouchableOpacity>
        */
        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {this.setState({modalVisible:false})}}
                    style={styles.SelectModals}>
                    <View style={styles.SelectBox}>
                        <Button
                            key={'0'}
                            buttonStyle={styles.SelectModalsClose}
                            textStyle={styles.SelectModalsCloseText}
                            onPress = {()=>{_this.setModalVisible(false)}}
                            title={translate("close")}/>
                        <View>
                            <Button
                                key={0}
                                buttonStyle={styles.SelectModalsClose}
                                textStyle={styles.SelectModalsCloseText}
                                onPress = {()=>{_this.onServiceSelect(0)}}
                                title={translate("removeSelected")}/>
                            <Text style={styles.SelectTitle}>{translate("selectService")}</Text>
                        </View>
                        <ScrollView style={styles.SelectScroll}>
                            <View>
                                {ServiceView}
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        );
    }
}

class DressersModal extends Component{

    constructor(props) {
        super(props);
        this.state = {
            modalVisible: this.props.visible,
            dressers : []
        }
    }

    setModalVisible(visible) {
        this.setState({modalVisible: visible});
        this.props.onModalChangeVisible(visible);
    }

    onDresserSelect(id){
        this.props.addDresser(id)
    }

    componentWillReceiveProps(nextProps){
        if(this.props != nextProps) {
            this.setState({modalVisible: nextProps.visible,dressers:nextProps.dressers})
        }
    }

    render() {

        let _this = this;

        let dressers = this.state.dressers ? this.state.dressers : []

        let dressersView = dressers.map((dresser)=>{
            /*
            return(
                <TouchableOpacity
                    onPress={()=>{_this.onDresserSelect(dresser._id)}}
                    key={dresser._id}
                >
                    <Text style={[styles.timeBox,{minWidth:300}]}>{dresser.name}</Text>
                </TouchableOpacity>
            )
            */
            return(
                <Button
                    key={dresser._id}
                    buttonStyle={styles.SelectOption}
                    textStyle={styles.SelectOptionText}
                    onPress = {()=>{_this.onDresserSelect(dresser._id)}}
                    title={dresser.name}/>
            )
        })

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
                            onPress = {()=>{_this.setModalVisible(false)}}
                            title={translate("close")}/>
                        <View>
                            <Text style={styles.SelectTitle}>{translate("selectStylist")}</Text>
                        </View>
                        <ScrollView>
                            <View>
                                {dressersView}
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        );
    }
}

export default AppointmentsView;
