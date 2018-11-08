import React, { Component } from 'react';
import { SideMenu } from 'react-native-elements'
import NavigationBar from 'react-native-navbar';
import {DOMAIN} from './../../config';
import FitImage from 'react-native-fit-image';
import styles from '../includes/styles';
import {translate, Translate} from 'react-native-translate';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';

var loadImages=false,
    images={},
    postIndex=0,
    posts=null;
const numberOfPosts=3;



class ViewPosts extends Component {
    constructor (props) {
        super(props);

        this.state = {
            posts:null,
            postImages:null,
            message:translate("loadPost"),
        };
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
            })

            .then((response) =>
            {
                return response.json();
            })
            .then((responseData) => {

                return responseData;
            })
            .then((data) => {
                posts=data;
                this.setState({
                    message:translate("loadImages")
                })
            })
            .catch((error) => {
                console.error(error);
            })
            .done();



    }

    goToPost(postId){
        this.props.navigator.push({
          name: 'Post',
            passProps: {
                data: this.props.data,
                postId: postId,
                token:this.props.token
            }
        })
    }

    render(){

        if (!posts) {
            return (
            <View style = {styles.loaderContainer}>
                <Text style={[styles.text, styles.textLight, {textAlign: 'center',}]}>{this.state.message}</Text>
            </View>
        )}

        var postRows = [];
        for (var i=0; i < numberOfPosts; i++) {
            const post = posts[i]._id;
            postRows.push(
                  <TouchableOpacity
                    onPress = {() => this.goToPost(post)}>

                    <View style = {styles.post}>
                        <FitImage
                          indicator
                          indicatorColor="white" // react native colors or color codes like #919191
                          indicatorSize="large" // (small | large) or integer
                          source = {{uri:'https://storage.googleapis.com/magnifique-dev/'+posts[i].pictures[0]}}
                          originalWidth={900}
                          originalHeight={400}
                          style = {styles.postImage} />

                        <Text  style = {[styles.text, styles.textLight, {textAlign: 'center',}]}>
                            {posts[i].title.toUpperCase()}
                        </Text>
                    </View>
                  </TouchableOpacity>
            );
        }


        return (
          <View>
            <Text  style = {[styles.text, styles.title, styles.textLight, {textAlign: 'center',}]}>
                {translate("lastPost")}
            </Text>

            <View style = {styles.containerPosts}>
                {postRows}
            </View>
          </View>
        )
    }
}

export default ViewPosts;
