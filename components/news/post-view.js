import React, { Component } from 'react';
import { SideMenu, Icon, Button} from 'react-native-elements'
import NavigationBar from 'react-native-navbar';
import Posts from './Posts'
import {DOMAIN} from './../../config';
import FitImage from 'react-native-fit-image';
import {translate, Translate} from 'react-native-translate';
import styles from "../includes/styles";
import CustomBar from '../CustomBar'
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    Modal,
    WebView, PixelRatio
} from 'react-native';

const Menu = require('./../Menu');
const htmlStyle = '' +
    '<style>' +
    'p{font-size: 16px; color: #FFF;}' +
    'img{width:100% !important; height: auto}</style>'


class PostView extends Component {
    constructor (props) {
        super(props);

        this.state = {
            posts:null,
            star:5,
            starTotal:5,
            starVote:1,
            activity:[],
            starCustomer:false,
            modalStar:false,
            starView:<View style = {styles.postStar}>
                        <Text style={styles.postH2}>{translate("assessment")}</Text>
                      </View>,
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

    onMenuItemSelected = (item) => {
        this.setState({
            isOpen: false,
            selectedItem: item,
        });
    }

    onModalChangeVisible(value){
        this.setState({
            modalVisible:value,
            servicesModalVisible: false,
            dressersModalVisible: false,
        })
    }

    setStar(star){
        //console.log('SelectStar',star);
        var activity = this.state.post.post_activity

        if(!this.state.starCustomer){
          activity.push({
                          customer:this.props.data._id,
                          action:'Rate',
                          rate:star,
                        })
        }

        const body ={
          vote:star,
          total:this.state.starTotal,
          vote:this.state.starVote,
          user:this.props.data._id,
          post_activity:activity
        }

        fetch(
            DOMAIN+'/api/posts/'+this.props.postId, {
                method: 'put',
                body: JSON.stringify(body),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization':'Bearer '+this.props.token
                }
            }).then((response) =>{
                return response.json();

            }).then((responseData) => {
                return responseData;

            }).then((data) => {
              this.setState({ post:data.post },() => { this.countStar(); });

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    countStar(){
        var modalStar = false;
        var starCustomer = this.state.starCustomer
        var vote = 0
        var total = 0
        var activity = this.state.activity
        //var data = {total: 20, vote:6}

        if("post_activity" in this.state.post){
          activity = this.state.post.post_activity;
        }

        activity.map((detail) => {
          if(detail.action=="Rate"){
            vote = vote+1
            total = total-(-detail.rate);

            if(detail.customer==this.props.data._id){
              starCustomer=true;
            }
          }

        });

        if(!starCustomer){
          modalStar=true
        }

        this.setState({
          activity:activity,
          starTotal:total,
          starVote:vote,
          starCustomer:starCustomer,
          modalStar:modalStar,
        },() => {
            this.viewStar();
        });
    }


    viewStar(){
      var starCount = this.state.starTotal/this.state.starVote;
      var starIcon=[];

      for(var i = 1; i<6; i++){
        const star = i
        var color = "#f50"
        if(i>starCount){
          color = "#CCC"
        }

        starIcon.push(<Icon
                    name='star'
                    type='font-awesome'
                    color={color}
                    onPress={() => this.setStar(star)} />);
      }

      var starView=
          <View style = {{padding: 20,   flex: 1, flexDirection: 'row', justContent: 'flex-end'}}>
                {starIcon}
                <Text style={[styles.text, styles.textLight]}>{this.state.starVote}</Text>
          </View>;

      this.setState({
        star:starCount,
        starView:starView
      })
    }


    render(){

        const {post} = this.state;
        const menu = <Menu
            onItemSelected={this.onMenuItemSelected}
            navigator={this.props.navigator } {...this.props}/>;

        const leftButtonConfig = {
            title: translate("behin"),
            handler: () => this.props.navigator.pop(),
        };

        if (!post) {
            return (
                <View style = {styles.loaderContainer}>
                    <Text style={styles.loader}>{translate("loadingContent")}</Text>
                </View>
            )}

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
                    <Text
                        style={[styles.text, styles.textLight, {textAlign:'left'}]}
                        onPress = {() => this.props.navigator.pop()}>
                        {translate("toReturn")}:
                    </Text>

                    {/*
                    <NavigationBar
                        title={<Text style ={[styles.text,styles.textLight, styles.backgroundPrimary]}>
                            {translate("trendingStyles")}</Text>}
                        style ={{backgroundColor:'transparent'}}
                        leftButton={leftButtonConfig} />
                    */}

                    <ScrollView>

                        <View style = {[styles.box]}>
                            <FitImage
                                indicator
                                indicatorColor="white" // react native colors or color codes like #919191
                                indicatorSize="large" // (small | large) or integer
                                source = {{uri:'https://storage.googleapis.com/magnifique-dev/'+post.pictures[0]}}
                                originalWidth={900}
                                originalHeight={400}
                                style = {styles.postImage}/>

                            {this.state.starView}

                            <Text  style = {[styles.text, styles.textLight, styles.title]}>
                                {post.title.toUpperCase()}
                            </Text>

                            {/*
                            <Text  style = {[styles.text, styles.textLight]}>
                                {post.content}
                            </Text>
                            */}

                            <WebView
                                source={{
                                    html:htmlStyle+post.content,
                                    baseUrl: 'someUrl'
                                }}
                                style={[
                                    styles.text,
                                    styles.textLight,
                                    styles.WebViewStyle,
                                    {
                                        height:2000,
                                        width:'100%',
                                        marginRight:0,
                                        marginLeft:0,
                                    }]}/>
                        </View>

                        <ModalStar
                            modalStar={this.state.modalStar}
                            starView={this.state.starView}
                            setStar={(star)=>this.setStar(star)}
                            onModalChangeVisible = {(visible)=>this.onModalChangeVisible(visible)}/>
                    </ScrollView>
                </View>
            </SideMenu>

        )
    }

    componentDidMount(){
        fetch(
            DOMAIN+'/api/posts/'+this.props.postId, {
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

            }).then((data) => {
                this.setState({post:data.post},() => {  this.countStar(); })

            }).catch((error) => {
                console.error(error);

            }).done();
    }

    componentWillUpdate(){

    }
}

class ModalStar extends Component{
    constructor(props) {
        super(props);
        this.state = {
            modalStar: this.props.modalStar,
            starView: <View style = {{padding: 20,   flex: 1, flexDirection: 'row', justContent: 'center'}}>
                            <Text style={[styles.text, styles.textLight, styles.icons]}>translate("assessment")</Text>
                      </View>,
        }
    }

    setStar(star){
        this.props.setStar(star)
    }

    setModalVisible(visible) {
        this.setState({modalStar: visible});
    }

    componentWillReceiveProps(nextProps){
        if(this.props != nextProps) {
            this.setState({
                modalStar: nextProps.modalStar,
                starView : nextProps.starView
            })
        }
    }

    render() {

        return (
            <View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={this.state.modalStar}
                    onRequestClose={() => {this.setState({modalStar:false})}}>
                    <View>
                        <ScrollView style={{marginTop: 22}}>
                            <View style={[styles.SelectModalsClose,{padding: 20,   flex: 1, flexDirection: 'column',  alignItems: 'center'}]}>
                                <Text style={[styles.text, styles.textLight]}>{translate("ratePost")}</Text>
                                {this.state.starView}
                            </View>
                            <View style={[styles.SelectModalsClose,{ flex: 1, flexDirection: 'column'}]}>
                                <Button
                                    key={'0'}
                                    buttonStyle={styles.SelectModalsClose}
                                    textStyle={styles.SelectModalsCloseText}
                                    onPress = {()=>{this.setModalVisible(false)}}
                                    title={translate("close")}/>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        );
    }
}

export default PostView;
