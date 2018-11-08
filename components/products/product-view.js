import React, { Component } from 'react';
import { SideMenu, ButtonGroup } from 'react-native-elements'
import NavigationBar from 'react-native-navbar';
import Products from './Product'
const Menu = require('./../Menu');
import _arrayCopy from 'lodash._arraycopy';
import FitImage from 'react-native-fit-image';
import CustomBar from '../CustomBar'
import {DOMAIN} from './../../config'
import {translate, Translate} from 'react-native-translate';
import styles from "../includes/styles";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    WebView,
    BackAndroid,
    AsyncStorage, Alert
} from 'react-native';

var youtube = require('./../../img/YouTube_Play.png');

class ProductView extends Component {
    constructor (props) {
        super(props);

        this.state = {
            isOpen: false,
            cartLength:0,
        };
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    updateMenuState(isOpen) {
        this.setState({ isOpen, });
    }

    componentWillMount(){
        var {product}=this.props;
        var image = null;
        var thumbs=[];

        if(product.images.length>0){
            image = product.images[0].toString();
        }

        if(product.images.length>1){
            product.images.map((v,index)=>{
                if (index>0 && typeof v !== 'undefined'){
                    thumbs.push(v);
                }
            })
        }

        if (!image && product.videos.length>0){
            image=product.images[0].toString();

        }else if(image && product.videos.length>0){
            product.videos.map((w)=>{
                thumbs.push(w)
            });

        }else if(!image && product.videos.length>1){
            product.videos.map((x,index)=>{
                if(index>0){
                    thumbs.push(x);
                }
            })
        }

        this.setState({
            image:image,
            thumbs:thumbs
        })
    }

    setImage(src){
        var thumbs = this.state.thumbs.filter(e => e !== src)
        thumbs.push(this.state.image);
        this.setState({
            image:src,
            thumbs:thumbs
        })
    }



    goToCart(){
        this.props.navigator.push({ name: 'CheckOut',
            passProps: {
                data: this.props.data,
                token: this.props.token,
                profile: this.props.profile,
                platform:this.props.platform
            }
        })
    }

    async getProductCart(){
        var response = [];
        var cart = await AsyncStorage.getItem("cart");
        console.log("getProductCart getItem cart", cart);

        if(cart != "" && cart != undefined && cart != null){
            response = JSON.parse(cart);
        }

        this.setState({
            cartLength:response.length
        });

        return response;
    }

    async buyProduct(e,product){
        var newCart = [];
        var cart = await this.getProductCart();

        if(!cart._id){
            cart.map((prod)=>{
                if(prod._id && prod._id!=product._id){
                    newCart.push(prod);
                }
            })
        }

        if(product.stock>0){
            newCart.push(product);

        }else{
            Alert.alert(
                translate("Attention"),
                translate("noProductStock"));
        }

        AsyncStorage.setItem("cart",JSON.stringify(newCart));

        this.setState({
            cartLength:newCart.length
        });
    }

    async componentDidMount(){
        var navigator=this.props.navigator;
        await this.getProductCart();

        BackAndroid.addEventListener("hardwareBackPress", () => {
            if (navigator && navigator.getCurrentRoutes().length > 1) {
                navigator.pop()
                return true
            } else {
                return false
            }
        })
    }

    componentWillUnmount(){
        var navigator=this.props.navigator

        BackAndroid.removeEventListener('hardwareBackPress', () => {
            if (navigator && navigator.getCurrentRoutes().length > 1) {
                navigator.pop();
                return true;
            }
            return false;
        });
    }

    render(){
        const menu = <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator } {...this.props}/>;
        const {product} = this.props
        const {
            image,
            thumbs,
            cartLength
        } = this.state;

        var imageFrame = ()=>{
            console.log("product image",image);
            if(image && image!="" && image!=undefined){
                console.log("product image if",image);
                if(image.substring(0,4)==='http'){
                    return (
                        <FitImage
                            indicator
                            indicatorColor="white" // react native colors or color codes like #919191
                            indicatorSize="large" // (small | large) or integer
                            source = {{uri:image}}
                            resizeMode="cover"/>
                    )

                }else if(product.source){
                    console.log("product image source",product.source);
                    return (
                        <FitImage
                            indicator
                            indicatorColor="white"
                            indicatorSize="large"
                            source = {{uri:product.source}}
                            resizeMode="cover"/>
                    )

                }else{
                    return (
                        <WebView
                            style={{width:'100%', height:200, marginTop:80, marginBottom:80}}
                            source={{uri: 'https://www.youtube.com/embed/'+image+'?rel=0&autoplay=0&showinfo=0&controls=0'}}/>
                    )
                }
            }
        }

        console.log("productView thumbs", thumbs);
        var thumbsFrame = thumbs.map((v,i)=>{
            var src = v.substring(0,4)==='http' ? {uri:v} : youtube
            return(
                <TouchableOpacity onPress={()=>this.setImage(v)}>
                    <Image key={i} style={styles.avatar} source={src} />
                </TouchableOpacity>
            )
        })
        console.log("productView thumbsFrame", thumbsFrame);

        return (
            <SideMenu
                menu={menu}
                isOpen={this.state.isOpen}
                onChange={(isOpen) => this.updateMenuState(isOpen)}>

                <CustomBar
                    {...this.props}
                    title = {translate("productDetail")}
                    platform = {this.props.platform}
                    onHandleLeftPress = {this.toggle.bind(this)} />

                <View style={styles.window}>
                    <ScrollView>
                        <View
                            style={styles.box}>

                            {(cartLength > 0) &&
                            <Text
                                style={[styles.text,styles.textLight, styles.title, {textAlign:'center'}]}
                                onPress={()=>this.goToCart()}>
                                {translate("shopCart")} {cartLength}
                            </Text>
                            }

                            <Text style = {[styles.text, styles.textLight, {fontSize:20}]}>
                                {product.brand.name.toUpperCase()}
                            </Text>

                            <Text style = {[styles.text, styles.textLight, {fontSize:30}]}>
                                {product.name.toUpperCase()}
                            </Text>

                            <View style={{flexDirection:'row'}}>
                                <Text style = {[styles.text, styles.textLight]}>
                                    {product.price === 0 || "" ? "" : product.price.toFixed(2)+' €'}
                                </Text>

                                <TouchableOpacity
                                    onPress={()=>this.buyProduct(null,product)}>
                                    <Text style={[styles.text, styles.textLight, styles.icons]}>
                                        {translate("buyRigntNow")}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {imageFrame()}

                            <View style={styles.avatarContainer}>
                                {thumbsFrame}
                            </View>

                            <Text style = {[styles.text, styles.textLight, {fontSize:15}]}>
                                {translate("description")}:
                            </Text>

                            <Text  style = {[styles.text, styles.textLight]}>
                                {product.description}
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </SideMenu>
        )
    }
}

export default ProductView;
