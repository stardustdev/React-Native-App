import {PixelRatio, StyleSheet} from "react-native";

const color={
    primary: '#221F1F',
    secondary: '#F4F4F4',
    accent: '#7BEBDA',
    disable: '#CCC',
}

const font={
    fontFamily:'HelveticaNeueLTStd-MdCn',
}

const styles = StyleSheet.create({

    colorPrimary:{
        color: color.primary,
        backgroundColor: color.primary,
    },
    colorSecondary:{
        color: color.secondary,
        backgroundColor: color.secondary,
    },
    colorAccent:{
        color: color.accent,
    },

    backgroundPrimary:{
        backgroundColor: color.primary,
    },

    backgroundSecondary:{
        backgroundColor: color.secondary,
    },

    window:{
        flex: 1,
        flexDirection:'column',
        justifyContent: 'space-between',
        backgroundColor:color.primary
    },

    container: {
        flex: 1,
        flexDirection:'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: color.secondary,
        overflow:'scroll'
    },

    topNav: {
        backgroundColor:color.primary,
    },

    box:{
        flex: 1,
        flexDirection:'column',
        margin:10,
        borderRadius:5,
        backgroundColor:color.primary,
    },

    boxLight:{
        backgroundColor:color.secondary,
    },

    boxEdit:{
        flex: 1,
        flexDirection:'row',
        alignItems:'center',
        padding:10,
        borderTopWidth:1,
        borderTopColor:color.disable,
    },

    boxEditSteps:{
        color:color.accent,
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop:20,
        marginBottom:20,
    },

    text:{
        padding:5,
        fontSize:15,
        color:color.primary,
        backgroundColor: 'transparent'
    },

    textLight:{
        color:color.secondary
    },

    title:{
        padding:20,
        fontSize:20,
    },

    icons: {
        color:color.accent,
    },

    buttons:{
        color:color.secondary,
        margin:10,
        marginTop:20,
        marginBottom:20,
        textAlign:'center',
        borderRadius:5,
        backgroundColor:color.accent,
    },

    buttonsDisable:{
        color:color.primary,
        backgroundColor:color.disable,
    },

    buttonsText:{
        color:color.primary,
        fontSize:18,
        textAlign:'left',
        fontFamily:font.fontFamily,
    },

    buttonsDisableText:{
        color:color.primary,
    },

    menuHeader:{
        flex:2,
        alignItems: 'center',
        justifyContent: 'center',
        width:'100%',
        minHeight:200,
        paddingTop: 20,
        paddingBottom: 20,
        backgroundColor: color.primary,
    },

    menuBody:{
        flex:4,
        width:'100%',
        backgroundColor: color.secondary,
    },

    menuText:{
        //fontFamily: font.fontFamily,
        fontWeight: '800',
        fontSize: 30
    },

    listItem:{
        color: color.primary,
        fontFamily: font.fontFamily,
        fontSize: 16,
    },



    footer:{
        flexDirection:'row',
        borderTopColor: '#ededed',
        borderTopWidth: 1,
        width:'100%',
    },

    //LOGIN
    salonContainer:{
        flexDirection:'row',
        marginLeft:'15%',
        marginRight:'15%',
        width:'70%',
        borderWidth:0.5,
        borderColor: color.primary,
        padding:10,
        backgroundColor: color.primary,
        marginBottom:20
    },
    chooseSalon:{
        fontFamily: font.fontFamily,
        textAlign: 'center',
        color: color.secondary,
        marginBottom:30,
        fontSize:15
    },
    lastTitle:{
        fontFamily: font.fontFamily,
        color: color.secondary,
        fontSize:18,
        paddingLeft:12,
        paddingTop:7,
    },
    salonTitle:{
        fontFamily: font.fontFamily,
        color: color.accent,
        fontSize:18
    },
    salonAddress:{
        fontFamily: font.fontFamily,
        color: color.secondary,
        fontSize:11
    },
    salonCity:{
        fontFamily: font.fontFamily,
        color: color.secondary,
        fontSize:14
    },
    messageContainer:{
        width:'80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    messageLight:{
        color:color.secondary,
    },
    messageInput:{
        width:'100%',
        //height:'auto',
        textAlign:'center',
        color:color.secondary,
        //fontFamily: font.fontFamily
        fontSize:12
    },
    messageInputLight:{
        fontSize:18,
        textAlign:'left',
        //color:color.primary,
        borderWidth:0,
        padding:0,
        margin:0,
    },
    video: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    underline:{
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
        textDecorationColor:color.secondary
    },

    //APPOINTMENT
    noShop:{
        fontFamily: font.fontFamily,
        backgroundColor: color.primary,
        fontSize: 15,
        color: '#00B1C6',
        width: '100%',
        padding: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#333A42',
    },
    image: {
        flex: 1,
        // remove width and height to override fixed static size
        width: null,
        height: null,
    },
    dateHeader:{
        color:color.secondary,
        fontFamily:font.fontFamily,
        textAlign:'right'
    },
    timeHeader:{
        color:color.secondary,
        fontFamily:font.fontFamily,
        textAlign:'left',
        minWidth:320
    },

    dateContain:{
        //flex:1,
        flexDirection:'row',
        justifyContent: 'center',
        backgroundColor:color.primary,
    },

    time:{
        color:color.secondary,
        fontSize:25,
        fontFamily:font.fontFamily,
        textAlign:'left',
    },

    date:{
        flex:1,
        flexDirection:'row',
        color:color.secondary,
        padding:10,
        fontSize:25,
        textAlign:'center',
        fontFamily:font.fontFamily,
    },

    name:{
        color:color.primary,
        fontSize:18,
        fontFamily:font.fontFamily,
    },

    center:{
        fontFamily:font.fontFamily,
        color:color.primary,
        paddingLeft:0,
        paddingBottom:10,
        fontSize:14
    },
    timetable:{
        fontFamily:font.fontFamily,
        color:color.primary,
        paddingLeft:10,
        paddingRight:10,
        paddingBottom:10,
        fontSize:12,
        alignSelf:'center'
    },
    avatarContainer: {
        flexWrap: 'wrap',
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatar: {
        margin:10,
        marginTop:0,
        borderRadius: 40,
        width: 80,
        height: 80
    },
    avatarMax: {
        borderRadius: 40,
        width: 100,
        height: 100,
    },
    avatarMin: {
        margin:5,
        borderRadius: 30,
        width: 60,
        height: 60,
    },

    timeBox:{
        alignSelf:'center',
        fontSize:20,
        padding:8,
        paddingLeft:20,
        paddingRight:20,
        fontFamily:font.fontFamily,
        backgroundColor:'#ddd',
        borderColor:'#aaa',
        borderWidth:0.5
    },

    ButtonGroup:{
        height: 90,
        marginTop:0,
        marginBottom:10,
        marginRight:0,
        marginLeft:0,
        padding:10,
        paddingTop:20,
        paddingBottom:20,
        backgroundColor: 'white',
        alignSelf: "center",
        justifyContent: "center",
        backgroundColor: '#1a1c21',
        //borderRadius: 10,
        borderWidth: 0,
        borderTopWidth:2,
        borderColor: '#555',//00B1C6
    },
    ButtonGroupItem:{
        paddingTop:10,
        paddingBottom:10,
        borderColor: '#555',
    },
    ButtonGroupItemText:{
        color: color.disable ,
        fontSize:25,
        textAlign:'center'
    },
    ButtonGroupItemSelectText:{
        color: '#FFFFFF' ,//00B1C6
        fontSize:25,
    },

    CalendarContain:{
        flexWrap: 'wrap',
        flexDirection:'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarDay:{
        width:'90%',
        margin:10,
        marginBottom:0,
        marginTop:0,
        textAlign:'center',
        //borderRadius: 10,
        //borderBottomColor:color.accent,
        //borderBottomWidth:2,
    },
    calendarDetail:{
        //width:'50%',
        padding:10,
        textAlign:'left',
        flexDirection:'column',
        borderLeftColor:color.primary,
        borderLeftWidth:2,
    },
    calendarHour:{
        //width:'40%',
        padding:10,
        fontSize:35,
        textAlign:'center',
        fontWeight: 'bold',
    },
    CalendarMessage:{
        padding:20,
        color: '#555555' ,
        fontSize:18,
        textAlign:'center',
        backgroundColor: '#EEE',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#DDD',
    },

    //CARD
    message:{
        fontFamily: font.fontFamily,
        color:color.secondary,
        textAlign:'center',
        fontSize:15,
    },
    modalImageContainer:{
        flex:1,
        alignSelf: 'stretch',
        backgroundColor:'rgba(0,0,0,0.8)'
    },

    modalImage:{
        flex:1
    },
/*
    StyleButton:{
        backgroundColor:color.primary,
        marginLeft:10,
        marginRight:10,
        marginTop:10,
        marginBottom:20,
        borderRadius:10
    },
    StyleButtonText:{
        color:'#FFF',
        fontFamily:font.fontFamily,
        fontSize:18
    },
    */
    SelectModals: {
        position: 'absolute',
        height:'100%',
        width:'100%',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    SelectBox: {
        flex:1,
        flexDirection:'column',
    },

    SelectScroll: {
        flex:1,
        flexDirection:'column',
    },
    SelectTitle:{
        color:'#FFF',
        backgroundColor:'#222',
        paddingBottom:20,
        paddingTop:20,
        marginLeft:20,
        marginRight:20,
        marginTop:0,
        marginBottom:0,
        borderBottomColor: '#FFFFFF',
        borderBottomWidth: 4 / PixelRatio.get(),
        fontFamily:font.fontFamily,
        fontSize:18,
        textAlign:'center'

    },
    SelectOption:{
        backgroundColor:'#555',
        marginLeft:20,
        marginRight:20,
        marginTop:0,
        marginBottom:0,
        borderBottomColor: '#777',
        borderBottomWidth: 2 / PixelRatio.get(),
    },
    SelectOptionText:{
        color:color.secondary,
        fontSize:15,
        fontFamily:font.fontFamily,
        textAlign:'left',
    },
    SelectButton:{
        backgroundColor:color.primary,
        marginLeft:20,
        marginRight:20,
        marginTop:10,
        marginBottom:0,
        borderRadius:10
    },
    SelectModalsClose:{
        paddingBottom:10,
        paddingTop:10,
        marginLeft:20,
        marginRight:20,
        backgroundColor:color.primary,
        borderBottomColor: color.primary,
        borderBottomWidth: 4 / PixelRatio.get(),
        textAlign:'right',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    SelectModalsCloseText:{
        color:color.accent,
        fontFamily:font.fontFamily,
        fontSize:15,
        textAlign:'right'
    },
    option:{
        padding:10,
        color: color.secondary,
        fontSize:18,
        textAlign:'right',
        backgroundColor: color.primary,
        borderRadius: 0,
        borderWidth: 0,
        //borderBottomWidth: 1,
        //borderColor: color.secondary,
    },

    //CHAT
    shop:{
        color:color.primary,
        fontSize:18,
        fontWeight:'bold',
    },
    center:{
        fontFamily:font.fontFamily,
        color:color.primary,
        paddingLeft:0,
        paddingBottom:10,
        fontSize:14
    },
    centerTitle:{
        fontFamily:font.fontFamily,
        color:color.primary,
        paddingLeft:0,
        paddingTop:10,
        fontSize:12,
    },
    centerText:{
        fontFamily:font.fontFamily,
        color:color.primary,
        paddingTop:5,
        fontSize:12,
        textAlign:'center'
    },
    messageContent:{
        width:'100%',
        height:50,
        padding:0,
        borderWidth: 0,
        borderTopWidth:1,
        borderColor: color.secondary,
        backgroundColor:color.primary,
        //backgroundColor:color.secondary,
    },
    setMessage:{
        flex: 1,
        padding:0,
        margin:0,
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        //backgroundColor:color.secondary,
    },

    messageSectionInput:{
        flex: 8,
        //backgroundColor:color.disable,
    },

    iconsContain:{
        flex: 4,
        textAlign:'center',
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        color:color.primary,
        fontSize:14,
        padding:0,
        //backgroundColor:'#FF0',
    },

    iconAppointment:{
        marginRight:10,
        fontSize:30,
        textAlign:'center',
    },

    iconItem:{
        marginLeft:10,
        fontSize:25,
        textAlign:'center',
    },


    iconItemDisable:{
        color:color.disable,
    },


    messageGeneral:{
        width: '80%',
        marginTop:5,
        marginBottom:5,
        marginLeft:10,
        marginRight:10,
        padding:5,
        textAlign:'left',
        color:color.primary,
        fontSize:20,
        borderRadius:5,
        borderBottomWidth: 2,
        borderColor: color.primary,
        backgroundColor:color.secondary,
    },

    messageMy:{
        textAlign:'right',
        backgroundColor:color.accent,
    },

    messageCustomer:{
        backgroundColor:color.secondary,
    },

    messageGeneralTitle:{
        fontWeight: 'bold',
        fontSize:20,
    },
    messageGeneralContent:{
        fontSize:18,
    },

    //POSTS
    containerPosts: {
        //flexDirection: 'row',
        flex: 1,
        padding:10,
        paddingTop:20,
    },
    postWrapper:{
        flex: 1,
    },
    postH2:{
        color: color.secondary,
        fontFamily: font.fontFamily,
        padding:5,
        paddingTop:0,
        fontSize:14,
    },
    postH1:{
        color: color.secondary,
        fontFamily: font.fontFamily,
        fontSize:15,
    },
    post: {
        //flex: 1,
        //flexDirection: 'row',
        paddingBottom: 20,
    },
    postImage:{
        //flex: 1,
        backgroundColor: color.accent,
    },
    postTexts:{
        //flex: 1,
        //paddingLeft:5,
    },
    postButton:{
        color:'white',
        padding:7,
        borderWidth:1,
        borderColor:'white',
        margin:5,
        width:43,
        fontFamily: 'HelveticaNeue-Thin',
        fontSize:18,
        textAlign:'center',
        marginBottom:10,
        position:'absolute',
        bottom:20,
        right:20,
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    loader:{
        textAlign:'center',
        fontSize:12,
        width:'100%',
        fontFamily: 'HelveticaNeue-Thin',
        color:'white',
        paddingTop:200
    },
    loaderContainer:{
        justifyContent:'center'
    },
    separator:{
        height: StyleSheet.hairlineWidth,
        backgroundColor: color.secondary,
    },
    sliderStyle:{
        paddingRight:15,
        paddingLeft:15,
        marginTop:5,
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center'
    },

    favorite:{
        padding:5,
        borderWidth:1,
        borderColor:'white',
        margin:5,
        width:43,
        marginBottom:10,
        position:'absolute',
        bottom:60,
        right:10,
        opacity:0.8
    },
    cart:{
        padding:5,
        borderWidth:1,
        borderColor:'white',
        margin:5,
        width:43,
        marginBottom:10,
        position:'absolute',
        bottom:10,
        right:10,
        opacity:0.8
    },
    fitImage:{
        width: '100%',
        height: 120,
        //borderRadius: 20,
    },

    WebViewStyle:{
        flex:1,
        //height:'100%',
        marginLeft:20,
        marginRight:20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor:color.primary,
    },
    slider:{
        backgroundColor: color.primary,
    },
    sliderTextCont:{
        padding:15,
        paddingTop:0,
        backgroundColor: color.primary,
        flexDirection:'row'
    },
    sliderLine:{
        color: color.secondary,
        fontSize:12,
        flex:1
    },
});

export default styles;
