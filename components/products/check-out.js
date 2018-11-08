import React, { Component } from 'react';
import { SideMenu, ButtonGroup, Button, FormLabel, FormInput, FormValidationMessage } from 'react-native-elements'
import NavigationBar from 'react-native-navbar';
import Products from './Product'
import _arrayCopy from 'lodash._arraycopy';
import {translate, Translate} from 'react-native-translate';
import {checkPaymentData} from './utils/checkPaymentData'
import styles from "../includes/styles";
import Moment from 'moment';
import CustomBar from '../CustomBar'
import {DOMAIN} from './../../config'
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    AsyncStorage,
    Alert,
    Linking,
    PixelRatio,
    WebView,
    Modal,
} from 'react-native';

const Menu = require('./../Menu');
const months=[
    '',
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
];

class CheckOut extends Component {
    constructor (props) {
        super(props);

        this.state = {
            'WebViewUrl':"",
            'WebViewHtml':"",
            'modalVisibleWebView':false,
            'process3dSecure':true,
            cartLength:0,
            cartPrice: 0,
            products:[],
            quantity:[],
        };
        this.checkOut = this.checkOut.bind(this)
    }

    onAllModalChangeVisible(value){
        this.setState({
            modalVisible:value,
            modalVisibleWebView: value,
        })
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    updateMenuState(isOpen){
        this.setState({ isOpen, });
    }

    onMenuItemSelected = (item) => {
        this.setState({
            isOpen: false,
            selectedItem: item,
        });
    }

    onMessageCheckOut(data) {
        var result = JSON.parse(data.nativeEvent.data);

        this.setState({
            //'WebViewUrl':"",
            'WebViewHtml':"",
            'modalVisibleWebView':false,
            'process3dSecure':false,
        }, () => {
            this.Process3dSecure(result);
        });
    }

    onMessageCheckOutPayment(data) {
        var result = JSON.parse(data.nativeEvent.data);

        this.setState({
            //'WebViewUrl':"",
            'WebViewHtml':"",
            'modalVisibleWebView':false,
            'process3dSecure':false,
        }, () => {
            this.CheckOutPaymentResponse(result);
        });
    }


    checkOutPayment(data){

        var termUrl = DOMAIN+'/api/payments/bank/process3dSecure';
            termUrl = 'http://dev.magnifique.me/api/payments/bank/process3dSecure';
        var body = {
            ...data,
            termUrl : termUrl,
        }

        var url = DOMAIN + '/api/payments/checkout/tpv';
            //url = 'http://dev.magnifique.me/api/payments/checkout/tpv';

        fetch(
            url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                },
                body: JSON.stringify(body)

            }).then(res => {
                console.log("checkOutPayment res",res);
                return res.json();

            }).then(results => {
                console.log("checkOutPayment results",results);
                if(!results.error){

                    this.setState({
                        //'WebViewUrl':url,
                        'WebViewHtml':results.html,
                        'modalVisibleWebView':true,
                        'order':results.order,
                    });

                }else{
                    Alert.alert(
                        translate("mSomethingHasHappened")
                    ) //,results.error

                }

            }).catch(function (e) {
                console.log(e);
            });

    }

    CheckOutPaymentResponse(data){

        var message = data.MESSAGE;
        var result = data.RESULT;
        var orderId = data.ORDER_ID;

        if(result === '00'){

            var body = {
                ...data,
                message: message,
                orderId : orderId,
                //orderId : this.state.order._id,
            }

            var url = DOMAIN + '/api/payments/checkout/tpv/response';
                //url = 'http://dev.magnifique.me/api/payments/checkout/tpv/response';

            fetch(
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
                    return res.json()
                })
                .then(results => {
                    if(!result.error){
                        Alert.alert(
                            translate("congratulations"),
                            translate("mHasSuccessfully")
                        );

                        this.props.navigator.push({
                            name: 'Shippings',
                            passProps: {
                                data: this.props.data,
                                token: this.props.token,
                                profile: this.props.profile,
                                platform:this.props.platform
                            }
                        })


                    }else{
                        Alert.alert(
                            translate("mSomethingHasHappened"),
                            result.message
                        )

                    }
                })
                .catch(function (e) {
                    console.log(e);
                });

        }else{
            Alert.alert(
                translate("mSomethingHasHappened"),
                message
            )
        }

    }



    checkOut(firstPayment){

        const {
            products,
            cartPrice
        } = this.state;


        var cartProducts = [];
        products.map((prod)=>{
            cartProducts.push({
                product: prod._id,
                price: parseInt(prod.price.toFixed(2).toString().replace('.','')),
                quantity: prod.quantity,
            });
        });

        var body={
            appointment : "5a607f82ff7dd5646dcff37a",
            orderType : "Sell_Product_MAQ",
            customer : this.props.data._id,
            firstPayment : firstPayment,
            product : cartProducts,
            amount : parseInt(cartPrice.toFixed(2).toString().replace('.','')),
        };

        this.checkOutPayment(body);
        return;

        var url = DOMAIN + '/api/payments/checkout';

        fetch(
            url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':
                    'Bearer '+this.props.token
                },
                body: JSON.stringify(body)

            }).then(res => {
                return res.json();

            }).then(results => {
                if(!firstPayment && results.respose.result=='101'){
                    this.checkOut(true)

                }else if(!firstPayment && results.message && !results.respose.url){
                    Alert.alert(
                        translate("congratulations"),
                        translate("mHasSuccessfully")
                    )
                    this.props.navigator.push({
                        name: 'Shippings',
                        passProps: {
                            data: this.props.data,
                            token: this.props.token,
                            profile: this.props.profile,
                            platform:this.props.platform
                        }
                    })

                }else if(firstPayment){

                    //OPEN URL
                    if(results.respose.url && results.respose.url!=''){

                        var url = results.respose.url;
                        var pareq = results.respose.pareq;
                        var orderid = results.respose.orderid;
                        var termUrl = DOMAIN+'/api/payments/bank/process3dSecure';
                            //termUrl = 'http://dev.magnifique.me/api/payments/bank/process3dSecure';

                        var html = '<form id="securePayment" action="'+url+'" method="post">'+
                                        '<input type="hidden" name="PAReq" value="'+pareq+'"/>'+
                                        '<input type="hidden" name="TermUrl" value="'+termUrl+'"/>'+
                                        '<input type="hidden" name="MD" value="'+orderid+'" />'+
                                        //'<button type="submit">send</button>'+
                                    '</form>'+
                                    '<script type="text/javascript">'+
                                        'document.getElementById("securePayment").submit();'+
                                        /*
                                        'if(window.postMessage.length !== 1) {'+
                                        'window.postMessage = function(msg) {'+
                                            'setTimeout(function () {'+
                                                //'console.log(\'window.postMessage not ready\');'+
                                                'window.postMessage(msg);'+
                                                '}, 500);'+
                                            '}'+
                                        '}'+
                                        'window.postMessage("Hello React  Sending data from WebView","*");'+
                                        */
                                    '</script>';
                        
                        console.log("checkOut html",html);

                        this.setState({
                            //'WebViewUrl':url,
                            'WebViewHtml':html,
                            'modalVisibleWebView':true,
                        });

                    }else{
                        Alert.alert(
                            translate("mSomethingHasHappened"),
                            results.error
                        )
                    }

                }else{
                    Alert.alert(
                        translate("mSomethingHasHappened"),
                        results.error
                    )
                }
            })
            .catch(function (e) {
                console.log(e);
            });
    }




    Process3dSecure(data){

        const {product} = this.state;
        let amount = parseInt(product.price.toFixed(2).toString().replace('.',''))

        var body={
            pares : data.PaRes,
            orderId: data.MD,
            amount: amount,
        };

        console.log("Process3dSecure body",body);
        var url = DOMAIN+'/api/payments/process3dSecure/';
            //url = 'http://dev.magnifique.me/api/payments/process3dSecure/';

        fetch(
            url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                },
                body: JSON.stringify(body)

            }).then(res => {
                return res.json()

            }).then(results => {
                if(results.respose.result && results.respose.threedsecure && !results.error) {

                    var data = {
                            status:results.respose.threedsecure.status,
                            eci:results.respose.threedsecure.eci,
                            xid:results.respose.threedsecure.xid,
                            cavv:results.respose.threedsecure.cavv,
                            orderId:results.respose.orderid,
                        }

                    this.checkOutProcess3dSecure(data);
                }

            }).catch(function (e) {
                console.log(e);
            });
    }


    checkOutProcess3dSecure(data){
        const {product} = this.state;
        let amount = parseInt(product.price.toFixed(2).toString().replace('.',''))

        var body={
            ...data,
            amount:amount,
        };

        console.log("checkOutProcess3dSecure body",body);
        var url = DOMAIN + '/api/payments/process3dSecure/checkout';
            //url = 'http://dev.magnifique.me/api/payments/process3dSecure/checkout';

        fetch(
            url, {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                },
                body: JSON.stringify(body)

            }).then(res => {
                return res.json()

            }).then(results => {

                if(!results.message){
                    Alert.alert(
                        translate("congratulations"),
                        translate("mHasSuccessfully")
                    )
                    /*
                    this.props.navigator.push({
                        name: 'Shippings',
                        passProps: {
                            data: this.props.data,
                            token: this.props.token,
                            profile: this.props.profile,
                            platform:this.props.platform
                        }
                    })
                    */
                }else{
                    Alert.alert(
                        translate("mSomethingHasHappened")
                    )//,results.error

                }

            }).catch(function (e) {
                console.log(e);
            });

    }

    async getProducts(){
        let products = await fetch(
            DOMAIN+'/api/products/', {
                method: 'get',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }
            });

        return await products.json();
    }

    async getProductCart(){
        var response = [];
        var cart = await AsyncStorage.getItem("cart");

        if(cart != "" || cart != undefined || cart != null){
            response = JSON.parse(cart);
        }

        this.setState({
            cartLength:response.length
        });

        console.log("checkout getProductCart", response);
        return response;
    }

    async addProductCart(product){
        var newCart = [];
        var {
            products,
        } = this.state;

        products.map((prod)=>{
            if(prod._id && prod._id!=product._id){
                newCart.push(prod);
            }
        })

        if(product.stock>0){
            newCart.push(product);

        }else{
            Alert.alert(
                translate("Attention"),
                translate("noProductStock"));
        }

        AsyncStorage.setItem("cart",JSON.stringify(newCart));

        this.setState({
            products: newCart,
        },
            async () => {
                await this.cartPrice();
            });

        return newCart;
    }

    async removeProductCart(product){
        var {
            products,
        } = this.state;

        var newCart = [];
        products.map((prod) => {
            if(prod._id != product._id){
                newCart.push(prod);
            }
        });

        await AsyncStorage.setItem("cart",JSON.stringify(newCart));
        console.log("checkout removeProductCart", newCart.length);

        this.setState({
            products: newCart,
        },
            async () => {
                await this.cartPrice();
            });

        return newCart;
    }

    async evalProductCart(product){
        var {
            products,
            allProducts
        } = this.state;

        var result = false;
        allProducts.map((prod) => {
            if(prod._id == product._id){
                result = true;
            }
        });

        return result;
    }

    async handleQuantityInput(number, product){
        var {
            quantity,
            products,
            allProducts,
        } = this.state;

        var stock = 0;
        allProducts.map((prod)=>{
            if(prod._id == product._id){
                stock = prod.stock;
            }
        })

        var prodQuantity = number.replace(/[^\/\d]/g,'');

        if(!await this.evalProductCart(product)){
            await this.removeProductCart(product);
            prodQuantity=0;
            Alert.alert(
                translate("cartItem"),
                translate("catItemNoStock")
            )

        }else if(prodQuantity>product.stock){
            prodQuantity=product.stock;
            Alert.alert(
                translate("cartItem"),
                translate("catItemNoExceeds")
            )

        }else if(prodQuantity<0){
            prodQuantity=0;
            Alert.alert(
                translate("cartItem"),
                translate("catItemNoEmpty")
            )
        }


        this.setState({
            quantity:{
                ...quantity,
                [product._id]: prodQuantity,
            },
        },

        async ()=>{
            product.quantity = prodQuantity;
            await this.addProductCart(product);
        })
    };

    async cartPrice(){
        var {
            products,
        } = this.state;

        var cartPrice = 0;
        products.map(async (prod)=>{
            if(!await this.evalProductCart(prod)){

            }else if(prod.quantity<=prod.stock){
                cartPrice = (cartPrice)+(prod.price*prod.quantity);

            }else{
                await this.removeProductCart(prod);

            }

            this.setState({
                cartPrice:cartPrice,
            })
        })


        return cartPrice;
    }

    async componentDidMount(){
        var allProducts = await this.getProducts();
        var products = await this.getProductCart();

        console.log("checkout allProducts",allProducts);
        console.log("checkout products",products);

        this.setState({
            product:null,
            products:products,
            cartLength:products.length,
            allProducts: allProducts
        },
            async () => {
                await this.cartPrice();
            });
    }

    componentWillMount(){
        if(checkPaymentData(this.props.data)!==true){
            this.props.navigator.push({ name: 'Logged',
                passProps: {
                    data: this.props.data,
                    token: this.props.token,
                    profile: this.props.profile,
                    platform:this.props.platform,
                    referer:'CheckOut'
                }
            })
        }
    }

    render(){

        var {
            product,
            products,
            quantity,
            cartPrice,
        } = this.state;

        const menu = <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator } {...this.props}/>;
        var name = product ? product.name : null;
        var price = product ? product.price.toFixed(2)+ ' €' : null;
        const user = this.props.data;

        var address = user && user.shippingAddress[0] ? user.shippingAddress[0].address : null;
        var state = user && user.shippingAddress[0] ? user.shippingAddress[0].state : null;
        var postalCode = user && user.shippingAddress[0] ? user.shippingAddress[0].postalCode : null;
        var city = user && user.shippingAddress[0] ? user.shippingAddress[0].city : null;

        var offset = Moment().utcOffset();
        var start=Moment.utc(Date.now()).add(7, 'days').utcOffset(offset).format("YYYY-MM-DD-HH:mm");
        var time =start.substring(8,10)+'-'+months[parseInt(start.substring(5,7))];

        var styleItemKey = [styles.text, styles.textLight, {flex:1}];
        var styleItemValue = [styles.text, styles.textLight, {flex:1, textAlign:'right'}];

        console.log("checkOut render product", products);
        products.sort(function(a,b){
            return a.name.toUpperCase() - b.name.toUpperCase();
        });
        console.log("checkOut render product sort", products);

        return (
            <SideMenu
                menu={menu}
                isOpen={this.state.isOpen}
                onChange={(isOpen) => this.updateMenuState(isOpen)}>

                <CustomBar
                    {...this.props}
                    title = {translate("mConfirmOrder")}
                    platform = {this.props.platform}
                    onHandleLeftPress = {this.toggle.bind(this)}/>

                <View style={styles.window}>
                    <ScrollView>
                        <View style={[styles.box]}>
                            <Text style={[styles.text,styles.icons]}>
                                {translate("summaryOrder")}
                            </Text>

                            <Text style={[styles.text, styles.textLight, styles.title]}>
                                {translate("selectQuantity")}
                            </Text>

                            {products.map((prod)=> {
                                var prodPrice = prod.price;
                                if(!prodPrice){
                                    prodPrice=0;
                                }

                                //var prodQuantity = quantity[prod._id];
                                var prodQuantity = 1;
                                if(prod.quantity){
                                    prodQuantity = prod.quantity;
                                }

                                var prodTotal = prodPrice*prodQuantity;

                                return(
                                        <View>
                                            <Text style={[styles.text,styles.icons]}>
                                                {prod.name.toUpperCase()}
                                            </Text>
                                            <View style={{flex:1, flexDirection:'row', justContent:'between'}}>
                                                <FormInput
                                                    inputStyle={[styles.messageInput,{alignSelf:'center',width:50, color:'white',fontSize:20}]}
                                                    placeholder={translate('quantity')}
                                                    placeholderTextColor={'#FFFFFF'}
                                                    textInputRef='number'
                                                    onChangeText={(text)=>this.handleQuantityInput(text, prod)}
                                                    value={prodQuantity.toString()}
                                                    keyboardType={'numeric'}/>
                                                <Text style={[styles.text,styles.textLight]}>
                                                    x
                                                </Text>
                                                <Text style={[styles.text,styles.textLight]}>
                                                    {prodPrice.toFixed(2)+ ' €'} = {prodTotal.toFixed(2)+ ' €'}
                                                </Text>

                                                {/*
                                                <Text style={[styles.text,styles.textLight]}>
                                                    {translate("oQuantity")}
                                                </Text>
                                                */}
                                            </View>
                                        </View>
                                )
                            })}


                            {/*
                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("expectedDateDelivery")}:
                                </Text>
                                <Text style={styleItemValue}>
                                    {time}
                                </Text>
                            </View>

                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("place")}:
                                </Text>
                                <Text style={styleItemValue}>
                                    {shopName}
                                </Text>
                            </View>
                            */}

                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("price")}:
                                </Text>
                                <Text style={[styles.text, styles.textLight, {flex:1, textAlign:'right', fontSize:18}]}>
                                    {cartPrice.toFixed(2)+ ' €'}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.box]}>
                            <Text style={[styles.text, styles.icons]}>
                                {translate("dataShipping")}
                            </Text>

                            <Text style={[styles.text, styles.textLight, {flex:1, textAlign:'center'}]}>
                                {translate("orderWithdrawal")}
                            </Text>

                            {/*
                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("name")}:
                                </Text>
                                <Text style={styleItemValue}>
                                    {user.name+' '+user.surname}
                                </Text>
                            </View>

                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("address")}:
                                </Text>
                                <Text style={styleItemValue}>
                                    {address}
                                </Text>
                            </View>

                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("city")}:
                                </Text>
                                <Text style={styleItemValue}>
                                    {city}
                                </Text>
                            </View>

                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("state")}:
                                </Text>
                                <Text style={styleItemValue}>
                                    {state}
                                </Text>
                            </View>

                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("postalCode")}:
                                </Text>
                                <Text style={styleItemValue}>
                                    {postalCode}
                                </Text>
                            </View>
                        */}
                        </View>


                        <View style={[styles.box]}>
                            <Text style={[styles.text,styles.icons]}>
                                {translate("dataPayment")}
                            </Text>

                            <View style={[styles.boxEdit, {padding:5, borderTopWidth:0,}]}>
                                <Text style={styleItemKey}>
                                    {translate("card")}:
                                </Text>
                                <Text style={styleItemValue}>
                                    {'**** **** **** '+user.cardLastNumbers}
                                </Text>
                            </View>
                        </View>
                    </ScrollView>

                    <Button
                        buttonStyle={styles.buttons}
                        textStyle={styles.buttonsText}
                        onPress={()=>this.checkOut(false)}
                        title={translate("paymentConfirm")+' - '+cartPrice.toFixed(2)+ ' €'}/>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={this.state.modalVisibleWebView}
                        onRequestClose={() => { this.setState({modalVisibleWebView:false}) }}
                        style={styles.SelectModals}>
                        <View>
                            <Button
                                key={'0'}
                                buttonStyle={styles.SelectModalsClose}
                                textStyle={styles.SelectModalsCloseText}
                                onPress = {()=>{ this.setState({modalVisibleWebView:false}) }}
                                title={translate("close")}/>

                            {this.state.WebViewUrl != "" &&
                            <View>
                                <Text style={styles.SelectTitle}>{this.state.WebViewUrl}</Text>
                            </View>
                            }

                            <View
                                style={{ height: 500, }}>
                                {this.state.WebViewHtml != "" &&
                                <WebView
                                    style={styles.WebViewStyle}
                                    automaticallyAdjustContentInsets={false}
                                    source={{html: this.state.WebViewHtml}}
                                    onMessage={data => this.onMessageCheckOutPayment(data)}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}/>
                                }

                                {this.state.WebViewUrl != "" &&
                                <WebView
                                    ref="checkoutWebView"
                                    style={styles.WebViewStyle}
                                    automaticallyAdjustContentInsets={false}
                                    source={{uri: this.state.WebViewUrl}}
                                    onMessage={this.onMessageCheckOut}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}/>
                                }

                            </View>
                        </View>
                    </Modal>

                </View>
            </SideMenu>
        )
    }
}

export default CheckOut;
