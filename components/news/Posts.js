import React, { Component } from 'react';
import FitImage from 'react-native-fit-image';
import {translate, Translate} from 'react-native-translate';
import styles from "../includes/styles";
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

class Posts extends Component {
    constructor(props){
        super(props);

        postNumber= this.props.posts ? this.props.post : -1;//We set -1 because it's an index, later we add +1 for the loop

    }

    goToPost(postId){
        this.props.navigator.push({
            name: 'Post',
            passProps: {
                data: this.props.data,
                postId: postId,
                token:this.props.token,
            }
        })
    }

    render(){
        const posts = this.props.posts;

        if (!posts) {
            return (
            <View style = {styles.loaderContainer}>
                <Text style={styles.loader}>{this.props.message}</Text>
            </View>
        )}

        var postRows = [];
        for (var i=0; i < this.props.numberOfPosts; i++) {
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

                            <Text style = {[styles.text, styles.textLight, {textAlign: 'center',}]}>
                                {posts[i].title.toUpperCase()}
                            </Text>

                            <Text style = {[styles.text, styles.textLight]}>
                                {posts[i].excerpt.substring(3,100)}
                            </Text>

                            {/*

                            <View style = {styles.postTexts}>
                                <Text  style = {styles.postH1}>{this.props.posts[i].title.toUpperCase()}</Text>
                                <Text  style = {styles.postH2}>{this.props.posts[i].excerpt.substring(3,100)}...</Text>
                            </View>

                            <Text
                                style = {styles.postButton}
                                onPress = {() => this.goToPost(post)}>
                                {translate("continue")}
                            </Text>
                            */}
                        </View>
                    </TouchableOpacity>
            );
        }

        return (
                <View style = {styles.containerPosts}>
                    {postRows}
                </View>
            )
    }
}

export default Posts;
