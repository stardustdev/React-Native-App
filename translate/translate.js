
//import React from 'react';
import React, { NativeModules } from 'react-native';
import {setLocalization} from "react-native-translate";
import DeviceInfo from 'react-native-device-info';

//import es from './es.json';
//import en from './es.json';
//import pt from './es.json';

export default class TranslateFile {

    constructor(){
        this.lang="es";
        this.file=require('./es.json');
    }

    setLang(lang){
        console.log("TranslateFile lang",lang);
        //console.log("TranslateFile lang2",this.getLocale());
        console.log("TranslateFile lang3",lang);

        if(lang!=""){
            this.lang=lang;

        }else{/*
            const appName = DeviceInfo.getApplicationName();
            console.log("TranslateFile appName",appName);

            console.log("TranslateFile deviceLocale casi",this.lang);
            //console.log("TranslateFile DeviceInfo",DeviceInfo);
            console.log("TranslateFile getDeviceLocale",DeviceInfo.getDeviceLocale());
            const deviceLocale = DeviceInfo.getDeviceLocale();
            console.log("TranslateFile deviceLocale",deviceLocale);
            if(deviceLocale!==null){
                this.lang=deviceLocale.substr(0,2);

            }else{
                //this.lang=getDeviceLocale;
                console.log("TranslateFile deviceLocale null",deviceLocale);

            }
            console.log("TranslateFile deviceLocale substr",this.lang);*/
        }

        console.log("TranslateFile lang final",this.lang);
        var langFile =  this.getFile();
        setLocalization(langFile);
        return langFile;
    }

    getLocale(){
        if (React.Platform.OS === 'android') {
            return NativeModules.RNI18n.getCurrentLocale(locale => locale.replace(/_/, '-'))
        } else {
            return NativeModules.RNI18n.locale.replace(/_/, '-')
        }
    }

    getFile(){
        switch (this.lang) {

            case 'en':
                this.lang = 'en';
                this.file = require('./en.json');
                break;

            case 'es':
                this.lang = 'es';
                this.file = require('./es.json');
                break;

            case 'pt':
                this.lang = 'pt';
                this.file = require('./pt.json');
                break;

        }

        console.log("TranslateFile getFile",this.lang);
        setLocalization(this.file);
        return this.file;
    }
}