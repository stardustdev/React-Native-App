import React, { Component } from 'react';
import { Slider } from 'react-native-elements'
import {translate, Translate} from 'react-native-translate';
import styles from "../includes/styles";
import {
    StyleSheet,
    Text,
    View,
    Picker
} from 'react-native';


class Others extends Component {

    constructor(props){
        super(props)
        this.state={

        }
    }

    setStates(prop,value){
        const state = this.state
        const cb = this.props.onSliderChange;

        if(value!==state[prop])cb(prop,value)

        this.setState({[prop]:value})
    }

    render() {
        var sliderSkinType = this.props.sliderSkinType ? this.props.sliderSkinType : 1;
        var sliderNailType = this.state.sliderNailType ? this.state.sliderNailType : this.props.sliderNailType;
        var sliderNailPolish = this.props.sliderNailPolish ? this.props.sliderNailPolish : 1;
        var sliderBrowType = this.state.sliderBrowType ? this.state.sliderBrowType : this.props.sliderBrowType;
        var sliderLashType = this.state.sliderLashType ? this.state.sliderLashType : this.props.sliderLashType;

        return (
        <View>
            <View style={styles.box}>
                <Text style={[styles.text, styles.textLight, styles.title]}>
                    {translate("mySkin")}
                </Text>

                <Text style={[styles.text, styles.textLight]}>
                    {translate("type")}
                </Text>

                <View style={styles.sliderStyle}>
                    <Slider
                        value={sliderSkinType}
                        minimumValue = {1}
                        maximumValue = {3}
                        step = {1}
                        thumbTintColor = '#00B1C6'
                        minimumTrackTintColor = '#bbb'
                        maximumTrackTintColor = '#bbb'
                        thumbStyle = {{top:20,opacity:1}}
                        trackStyle = {{top:0,opacity:1}}
                        onValueChange={(sliderSkinType) => this.setStates('sliderSkinType',sliderSkinType)}
                        style = {styles.slider}/>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{flex:1,textAlign:'left',color:'#aaa',fontSize:11}}>{translate("grease")}</Text>
                        <Text style={{flex:1,textAlign:'center',color:'#aaa',fontSize:11}}>{translate("dry")}</Text>
                        <Text style={{flex:1,textAlign:'right',color:'#aaa',fontSize:11}}>{translate("mixed")}</Text>
                    </View>
                </View>
            </View>


            <View style={styles.box}>
                <Text style={[styles.text, styles.textLight, styles.title]}>
                    {translate("myNail")}
                </Text>

                <Text style={[styles.text, styles.textLight]}>
                    {translate("type")}
                </Text>

                <View style={styles.sliderStyle}>
                    <Picker
                        style={{color:'#00B1C6'}}
                        selectedValue={sliderNailType}
                        onValueChange={(sliderNailType) => this.setStates('sliderNailType',sliderNailType)}>
                        <Picker.Item label={translate("natural")} value={'Naturales'} />
                        <Picker.Item label={translate("false")} value={'Postizas'} />
                        <Picker.Item label={translate("weak")} value={'Debil'} />
                        <Picker.Item label={translate("strong")} value={'Fuerte'} />
                    </Picker>
                </View>

                <Text style={[styles.text, styles.textLight]}>
                    {translate("enamel")}
                </Text>
                <View style={styles.sliderStyle}>
                    <Slider
                        value={sliderNailPolish}
                        minimumValue = {1}
                        maximumValue = {2}
                        step = {1}
                        thumbTintColor = '#00B1C6'
                        minimumTrackTintColor = '#24292E'
                        maximumTrackTintColor = '#24292E'
                        thumbStyle = {{top:20,opacity:1}}
                        trackStyle = {{top:0,opacity:1}}
                        onValueChange={(sliderNailPolish) => this.setStates('sliderNailPolish',sliderNailPolish)} />
                        <View style={{flexDirection:'row'}}>
                            <Text style={{flex:1,textAlign:'left',color:'#aaa',fontSize:11}}>{translate("normal")}</Text>
                            <Text style={{flex:1,textAlign:'right',color:'#aaa',fontSize:11}}>{translate("SemiPermanent")}</Text>
                        </View>
                </View>
            </View>



            <View style={styles.box}>
                <Text style={[styles.text, styles.textLight, styles.title]}>
                    {translate("myEyerbrows")}
                </Text>

                <Text style={[styles.text, styles.textLight]}>
                    {translate("type")}
                </Text>

                <View style={styles.sliderStyle}>
                    <Picker
                        style={{color:'#00B1C6'}}
                        selectedValue={sliderBrowType}
                        onValueChange={(sliderBrowType) => this.setStates('sliderBrowType',sliderBrowType)}>
                        <Picker.Item label={translate("populated")} value={'Pobladas'} />
                        <Picker.Item label={translate("depopulated")} value={'Despobladas'} />
                        <Picker.Item label={translate("clear")} value={'Claras'} />
                        <Picker.Item label={translate("dark")} value={'Oscuras'} />
                        <Picker.Item label={translate("natural")} value={'Naturales'} />
                        <Picker.Item label={translate("tattooed")} value={'Tatuadas'} />
                        <Picker.Item label={translate("microblading")} value={'Microbladding'} />
                        <Picker.Item label={translate("micropigmentation")} value={'Micropigmentacion'} />
                        <Picker.Item label={translate("dye")} value={'Tinte'} />
                    </Picker>
                </View>
            </View>

            <View style={styles.box}>
                <Text style={[styles.text, styles.textLight, styles.title]}>
                    {translate("myEyelashes")}
                </Text>

                <Text style={[styles.text, styles.textLight]}>
                    {translate("type")}
                </Text>

                <View style={styles.sliderStyle}>
                    <Picker
                        style={{color:'#00B1C6'}}
                        selectedValue={sliderLashType}
                        onValueChange={(sliderLashType) => this.setStates('sliderLashType',sliderLashType)}>
                    <Picker.Item label={translate("populated")} value={'Pobladas'} />
                        <Picker.Item label={translate("short")} value={'Cortas'} />
                        <Picker.Item label={translate("long")} value={'Largas'} />
                        <Picker.Item label={translate("curly")} value={'Rizadas'} />
                        <Picker.Item label={translate("straight")} value={'Rectas'} />
                        <Picker.Item label={translate("fine")} value={'Finas'} />
                        <Picker.Item label={translate("thick")} value={'Gruesas'} />
                    </Picker>
                </View>
            </View>
        </View>

        );
    }
}

export default Others;