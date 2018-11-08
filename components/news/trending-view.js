import React, { Component } from 'react';
import { SideMenu } from 'react-native-elements'
import NavigationBar from 'react-native-navbar';
import Posts from './Posts'
const Menu = require('./../Menu');
import CustomBar from '../CustomBar'
import {DOMAIN} from './../../config';
import {translate, Translate} from 'react-native-translate';
import styles from "../includes/styles";
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';

var loadImages=false, images={},postIndex=0,posts=null;
const numberOfPosts=5;

class TrendingView extends Component {
    constructor (props) {
        super(props);

        this.state = {
            posts:null,
            postImages:null,
            message:translate("loadPost")
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

    componentDidMount(){
        fetch(
            DOMAIN+'/api/posts/', {
                method: 'get',
                dataType: 'json',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }

            }).then((response) =>{
                return response.json();

            }).then((responseData) => {
                return responseData;

            }).then((data) => {console.log(data)
                posts=data;
                this.setState({message:translate("loadImages")})

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    render(){
        const menu = <Menu onItemSelected={this.onMenuItemSelected} navigator={this.props.navigator } {...this.props}/>

        return (
        <SideMenu
            menu={menu}
            isOpen={this.state.isOpen}
            onChange={(isOpen) => this.updateMenuState(isOpen)}>

            <CustomBar
                {...this.props}
                title = {translate("mTrendingStyles")}
                platform = {this.props.platform}
                onHandleLeftPress = {this.toggle.bind(this)}/>

            <View style={styles.window}>
                <ScrollView>
                    <Posts
                        message = {this.state.message}
                        posts = {posts}
                        images = {images}
                        numberOfPosts = {numberOfPosts}
                        navigator={this.props.navigator }
                        token={this.props.token}
                        data={this.props.data}/>
                </ScrollView>
            </View>
        </SideMenu>

        )
    }
}

export default TrendingView;
