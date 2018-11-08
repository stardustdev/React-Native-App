import React, { Component } from 'react';
import { SideMenu, ButtonGroup } from 'react-native-elements'
import NavigationBar from 'react-native-navbar';
import Product from './Product'
import _arrayCopy from 'lodash._arraycopy';
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
    AsyncStorage, Alert
} from 'react-native';
const Menu = require('./../Menu');

class ProductsView extends Component {
    constructor (props) {
        super(props);

        this.state = {
            products:[],
            postImages:null,
            message:translate("loadProducts"),
            selectedIndex: 2,
            numberOfproducts:10,
            allProducts:[],
            recommended:[],
            cartLength:0,
        };
    }

    updateIndex (selectedIndex) {
        const {customer,allProducts,recommended} = this.state;
        var filteredProducts=[];

        console.log("products selectedIndex",selectedIndex);
        console.log("products selectedIndex allProducts",allProducts.length);
        if(selectedIndex==0 && allProducts.length>0 && customer && recommended.length>0){
            filteredProducts = allProducts.filter((v)=>{
                var response=false;
                    recommended.map((w)=>{
                    if(v._id===w._id){
                        response=true;
                        customer.favouritesProducts.map((f)=>{
                            if(w._id===f){
                                response=false;
                            }
                        })
                    }
                })
                return response;
            });

            console.log("products selectedIndex filteredProducts",filteredProducts.length);
            this.setState({
                    products:filteredProducts,
                    numberOfproducts:filteredProducts.length,
                    selectedIndex:selectedIndex,}
                ,() => { console.log('change', this.state); });
        }

        if(selectedIndex==1 && allProducts.length>0 && customer){
            filteredProducts = allProducts.filter((v)=>{
                var response=false;
                customer.favouritesProducts.map((w)=>{
                    if(v._id===w){
                        response=true;
                    }
                })
                return response;
            })

            this.setState({
                    products:filteredProducts,
                    numberOfproducts:filteredProducts.length,
                    selectedIndex:selectedIndex,},
                () => {  });
        }

        if(selectedIndex==2 && allProducts.length>0 && customer){
            filteredProducts = allProducts.filter((v)=>{
                var response=true;
                customer.favouritesProducts.map((w)=>{
                    if(v._id===w || v.public===false || v.stock<=0){
                        response=false;
                    }
                })
                return response;
            });

            this.setState({
                    products:filteredProducts,
                    numberOfproducts:10,
                    selectedIndex:selectedIndex,},
                () => { });
        }
        //this.setState({selectedIndex});
        console.log("products selectedIndex filteredProducts",filteredProducts.length);
        console.log("products selectedIndex filteredProducts",filteredProducts);
    }

    toggle() {
        console.log('toggle')
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    updateMenuState(isOpen) {
        this.setState({ isOpen, });
    }

    async saveFavorites(e,id,action){
        var _this=this;

        const {customer} = this.state;
        const favouriteProducts = customer.favouritesProducts || [];

        var favorites = _arrayCopy(favouriteProducts);

        if(action==='add'){
            favorites.push(id);
        }else{
            var index = favorites.indexOf(id);
            favorites.splice(index,1);
        }


        var body={
            favouritesProducts:favorites,
            phoneNumber:customer.phoneNumber,
            sex:customer.sex,
        };

        var url = DOMAIN+'/api/customers/'+customer._id;
        fetch(
            url, {
                method: 'put',
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }
            }).then(res => res.json())

            .then(async (responseData) => {
                await this.getCustomer();

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    async getCustomer(){
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
                this.setState({
                        customer:data.customer,},
                    this.updateIndex(this.state.selectedIndex))

            }).catch((error) => {
                console.error(error);

            }).done();

        return;
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
        console.log("buyProduct getProductCart cart", cart);
        console.log("buyProduct product", product);

        if(!cart._id){
            cart.map((prod)=>{
                if(prod._id && prod._id!=product._id){
                    newCart.push(prod);
                }
            })
        }

        if(product.stock>0){
            product.quantity = 1;
            newCart.push(product);

        }else{
            Alert.alert(
                translate("Attention"),
                translate("noProductStock"));
        }

        console.log("buyProduct", newCart);
        AsyncStorage.setItem("cart",JSON.stringify(newCart));

        this.setState({
            cartLength:newCart.length
        });
    }

    async getProducts(){
        fetch(
            DOMAIN+'/api/products/', {
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
                let products = data.filter((product)=>{
                    return product.public!==false && product.stock>0;
                })

                console.log("products getProducts",_arrayCopy(data).length);
                this.setState({
                        message:translate("loadImages"),
                        allProducts:_arrayCopy(data)},
                    () => {
                        console.log('change getProducts', this.state);
                        this.updateIndex(this.state.selectedIndex)
                    })

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    async getRecommended(){
        fetch(
            DOMAIN+'/api/recommended/customer/'+this.props.data._id, {
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

                var selectIndex = this.state.selectedIndex;
                if(data.length>0){
                    selectIndex = 0;
                }

                this.setState({
                        recommended:data,
                        selectedIndex: selectIndex,},
                    this.updateIndex(this.state.selectedIndex))

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    async componentDidMount(){
        await this.getCustomer();
        await this.getProducts();
        await this.getRecommended();
        await this.getProductCart();
    }

    render(){

        const menu = <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator } {...this.props}/>;
        const buttons = [translate("recommended"), translate("favorites"), translate("All")];
        var {
            selectedIndex,
            products,
            customer,
            numberOfproducts,
            recommended,
            cartLength
        } = this.state;

        console.log("products selectedIndex products",products.length);
        console.log("products selectedIndex products",products);

        var favorites=[];
        if (customer){
            favorites = customer.favouritesProducts ? customer.favouritesProducts : []
        }

        let tab = null;

        switch (this.state.selectedIndex){
            case 0:
                tab =
                    <Product
                        message = {this.state.message}
                        products = {products}
                        numberOfproducts = {numberOfproducts}
                        recommended = {recommended}
                        favorites={favorites}
                        customer={this.props.data.id}
                        saveFavorites={this.saveFavorites.bind(this)}
                        type = {'recommended'}
                        navigator={this.props.navigator } {...this.props}
                        buyProduct={this.buyProduct.bind(this)}
                        token={this.props.token}
                        platform={this.props.platform}
                        profile={this.props.profile}/>
                break;

            case 1:
                tab =
                    <Product
                        message = {this.state.message}
                        products = {products}
                        numberOfproducts = {numberOfproducts}
                        recommended = {recommended}
                        favorites={favorites}
                        customer={this.props.data.id}
                        saveFavorites={this.saveFavorites.bind(this)}
                        type = {'favorites'}
                        navigator={this.props.navigator } {...this.props}
                        buyProduct={this.buyProduct.bind(this)}
                        token={this.props.token}
                        platform={this.props.platform}
                        profile={this.props.profile}/>
                break;

            case 2:
                tab =
                    <Product
                        message = {this.state.message}
                        products = {products}
                        numberOfproducts = {numberOfproducts}
                        recommended = {recommended}
                        favorites={favorites}
                        customer={this.props.data.id}
                        saveFavorites={this.saveFavorites.bind(this)}
                        type = {'products'}
                        navigator={this.props.navigator } {...this.props}
                        buyProduct={this.buyProduct.bind(this)}
                        token={this.props.token}
                        platform={this.props.platform}
                        profile={this.props.profile}/>
                break;

        }




        return (
            <SideMenu
                menu={menu}
                isOpen={this.state.isOpen}
                onChange={(isOpen) => this.updateMenuState(isOpen)}>

                <CustomBar
                    {...this.props}
                    title = {translate("mProducts")}
                    platform = {this.props.platform}
                    onHandleLeftPress = {this.toggle.bind(this)} />

                <View style={styles.window}>
                    <ScrollView
                        onScroll={(e) => {
                            let paddingToBottom = 400;
                            paddingToBottom += e.nativeEvent.layoutMeasurement.height;
                            if(e.nativeEvent.contentOffset.y >= e.nativeEvent.contentSize.height - paddingToBottom) {
                              console.log("products numberOfproducts",numberOfproducts);
                              this.setState({numberOfproducts:numberOfproducts+10},()=>{
                                  console.log("products numberOfproducts new",this.state.numberOfproducts);

                              })
                        }}}>
                        <View>

                            <ButtonGroup
                                onPress={this.updateIndex.bind(this)}
                                selectedIndex={selectedIndex}
                                buttons={buttons}
                                containerStyle={[styles.buttons, {borderWidth:0}]}
                                selectedTextStyle={[styles.buttonsText, {textAlign:'center', fontWeight: 'bold',}]}
                                selectedBackgroundColor={'#fff'}
                                textStyle={[styles.buttonsText, {textAlign:'center'}]}/>


                            {(cartLength > 0) &&
                            <Text
                                style={[styles.text, styles.textLight, styles.title, {textAlign:'center'}]}
                                onPress={()=>this.goToCart()}>
                                {translate("shopCart")} {cartLength}
                            </Text>
                            }

                            {tab}
                        </View>
                    </ScrollView>
                </View>
            </SideMenu>
        )
    }
}

export default ProductsView;
