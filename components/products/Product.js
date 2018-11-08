import React, { Component } from 'react';
import FitImage from 'react-native-fit-image';
import { Icon } from 'react-native-elements'
import styles from '../includes/styles';
import {translate, Translate} from 'react-native-translate';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    Button,
    TouchableOpacity
} from 'react-native';

var postNumber;

class Products extends Component {
    constructor(props){
        super(props);

        postNumber= this.props.products ? this.props.post : -1;//We set -1 because it's an index, later we add +1 for the loop

    }
    onPressProduct(product){
        this.props.navigator.push({ name: 'Product',
            passProps: {
                product: product,
                navigator:this.props.navigator,
                data:this.props.data,
                profile:this.props.profile,
                platform:this.props.platform,
                token:this.props.token
            }
        })
    }

    render(){
        var products = this.props.products;
        var type = this.props.type;

        if (!products){//&&type==='recommended'
            return (
                <View style = {styles.loaderContainer}>
                    <Text style={styles.loader}>{this.props.message}</Text>
                </View>
            )
        }

        var postRows = [];

        for (var i=0; i < products.length && i < this.props.numberOfproducts; i++) {

            if(!products[i]){
                return null;
            }

            let product = products[i];
            //if(type=='recommended' && this.props.favorites.indexOf(product.id)>0){continue};

            var source = require('./../../img/linkBroken.jpg');
            console.log('PRODUCTS image',product.images);
            if(typeof product.images !== 'undefined' && product.images.length>0){
                if(product.images[0]){
                    source = {uri:product.images[0]};
                }
            }

            //setImage to Product
            product.source = source;

            var price = +' €';
            if(product.price){
                price = product.price.toFixed(2)+' €';
            }

            postRows.push(
                <View
                    key = {product._id}
                    style = {[styles.box]}>

                    <TouchableOpacity
                        onPress={()=>this.onPressProduct(product)}>

                        <View style = {styles.postTexts}>
                            <Text  style = {[styles.text, styles.textLight, {fontSize:20}]}>
                                {product.name.toUpperCase()}
                            </Text>

                            <Text  style = {[styles.text, styles.textLight]}>
                                {price}
                            </Text>
                        </View>

                        <FitImage
                            indicator
                            indicatorColor="white" // react native colors or color codes like #919191
                            indicatorSize="large" // (small | large) or integer
                            //originalWidth={400}
                            //originalHeight={200}
                            style={styles.fitImage}
                            source = {source}/>

                        {type === 'favorites' &&
                        <Icon
                            name='heart-broken'
                            type="material-community"
                            color='#8f1517'
                            containerStyle={styles.favorite}
                            size={30}
                            onPress={(e) => this.props.saveFavorites(e,product._id,'remove')}/>
                        }

                        {type === 'recommended' &&
                        <Icon
                            name='favorite'
                            color='#8f1517'
                            containerStyle={styles.favorite}
                            size={30}
                            onPress={(e) => this.props.saveFavorites(e,product._id,'add')}/>
                        }

                        {type === 'products' &&
                        <Icon
                            name='favorite'
                            color='#8f1517'
                            containerStyle={styles.favorite}
                            size={30}
                            onPress={(e) => this.props.saveFavorites(e,product._id,'add')}/>
                        }

                        <Icon
                            name='shopping-cart'
                            color='#30bb74'
                            size={30}
                            containerStyle={styles.cart}
                            onPress={(e)=>this.props.buyProduct(e,product)}/>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View>
                {postRows}
            </View>
        )
    }
}

export default Products;