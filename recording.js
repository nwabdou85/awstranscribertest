import React, { useState, useEffect,  } from "react";
import { ScrollView, View, Dimensions, StyleSheet, Alert, Picker , ActivityIndicator, PermissionsAndroid, Platform } from "react-native";
import { Button, Text, Header, Icon, FormInput } from "react-native-elements";
import { setupURLPolyfill } from 'react-native-url-polyfill';

import 'react-native-get-random-values';
import LiveAudioStream from 'react-native-live-audio-stream';
import { Buffer } from 'buffer';
import { TranscribeStreamingClient, StartStreamTranscriptionCommand, Specialty, Type, StartMedicalStreamTranscriptionCommand } from "@aws-sdk/client-transcribe-streaming";

setupURLPolyfill();
/*
PRIMARYCARE | CARDIOLOGY | NEUROLOGY | ONCOLOGY | RADIOLOGY | UROLOGY
CONVERSATION | DICTATION
*/

let text="xxxxxxx";

const Recording = (props) => {

 let [seconds, setSeconds] = useState(20);
 let [canceled, setCanceled] = useState(false);
 let [rapport, handleRapport] = useState(text);
 let [secds, setSecds] = useState("00");
 let [minutes, setMinutes] = useState("00");
 let [hours, setHours] = useState("00");
 let [isStartRecording, handleStartRecording] = useState(false);
 let [isFinishRecording, handleFinishRecording] = useState(false);
 let [timmer, setTimmer] = useState(null);
 let [counter, setCounter] = useState(0);
 let [diff, setDiff] = useState(0);


 const client = new TranscribeStreamingClient({
    region:"eu-west-3",
    credentials:{secretAccessKey:"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", accessKeyId:"xxxxxxxxxxxxxxxxxxxxxxx"}
  })

 useEffect(() => {
   const options = {
    sampleRate: 32000,
    channels: 1,     
    bitsPerSample: 16,  
    audioSource: 6,     
    bufferSize: 4096   
  };

  requestMicrophone(options);

 },[])


const requestMicrophone = async (options) => {
    if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            {
              title: 'Permissions for record audio',
              message: 'Give permission to your device to record audio',
              buttonPositive: 'ok',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
             LiveAudioStream.init(options);
          } else {
          return;
          }
        } catch (err) {
        return;
      }
    }
  }








// handle saving generating text
const handleSave = (value) => {
 

 setCanceled(value);

if (!seconds) { return alert("vous devez entregister avant de sauvgarder,  svp")}
if (!rapport) { return alert("vous devez entregister avant de sauvgarder,  svp")}

let date =  new Date();
let TodayDate = `${date.getMonth() + 1}/${date.getFullYear()}`;

let rapportObj = {
	 seconds:seconds,
	 isCanceled:value,
	 rapport:rapport,
	 title:props.title,
	 patientId:props.Id,
   fileId:props.Id,
	 createdAt:new Date(),
	 OperatingRoom:props.bloc,
	 repportDate:TodayDate,
	 isPaid:false,
	 secondFees:20,
	 currency:"DZD",
	 Doctor:{
	 	Id:"userId",
	 }

 };


};


const handleStart = () => {
  handleStartRecording(true);
  Timmer();
// generate chunk
  LiveAudioStream.start();

 LiveAudioStream.on('data', data => {
  let chunk = Buffer.from(data, 'base64');
   console.log('chunk',chunk);
   sendChunk(chunk)
});

//send chunk
// receive response

}


const sendChunk = async(audioStream) => {
  const command = new StartMedicalStreamTranscriptionCommand({
    LanguageCode: "fr-FR",
    // The encoding used for the input audio. The only valid value is pcm.
    MediaEncoding: "pcm",
    // The sample rate of the input audio in Hertz. We suggest that you use 8000 Hz for low-quality audio and 16000 Hz for
    // high-quality audio. The sample rate must match the sample rate in the audio file.
    MediaSampleRateHertz: 44100,
    AudioStream: audioStream,
    Specialty: Specialty.CARDIOLOGY,
    Type: Type.CONVERSATION
  });
  
  //const response = await client.send(command);
  //console.log('response',response);

try {
  const data = await client.send(command);
  console.log('data',data)
  // process data.
} catch (error) {
  console.log('error',error)
  // error handling.
} finally {
  // finally.
}


 // This snippet should be put into an async function
  // for await (const event of response.TranscriptResultStream) {
  //   if (event.TranscriptEvent) {
  //     const message = event.TranscriptEvent;
  //     // Get multiple possible results
  //     const results = event.TranscriptEvent.Transcript.Results;
  //     // Print all the possible transcripts
  //     results.map((result) => {
  //       (result.Alternatives || []).map((alternative) => {
  //         const transcript = alternative.Items.map((item) => item.Content).join(" ");
  //         console.log("transcript",transcript);
  //       });
  //     });
  //   }
  // }

}




const handleFinish = () => {
  handleFinishRecording(true);
  clearInterval(timmer);
  LiveAudioStream.stop();
 // stop transcrip
 // retrive text and time
 // send it to mongo
 //destroy bucket
 // initiliase the state; 
}

const Timmer = () => {
  let first = new Date();
  clearInterval(timmer);
  if (!!isFinishRecording) {return "not need for timmer"}

  let timmer = setInterval(() => {
      thecounter(first);
    }, 1000);

  setTimmer(timmer);
}


const thecounter = (first) => {

//  LiveAudioStream.on('data', data => {
//   let chunk = Buffer.from(data, 'base64');
//    console.log('chunk1',chunk);
// });


  if (Number(counter) === 0) { 
    let diffs = Number(((new Date - first)/1000).toFixed()) - 1;
    setDiff(diffs);
    let passed = ((new Date - first)/1000).toFixed() - diff;
    setCounter(passed);
    secondsToHms(passed);
  }else{
    let passed = ((new Date - first)/1000).toFixed() - diff;
    setCounter(passed);
    secondsToHms(passed);
  };
 
}


const secondsToHms = (d) => {
    d = Number(d);
    let hours = Math.floor(d / 3600);
    let minutes = Math.floor(d % 3600 / 60);
    let secnds = Math.floor(d % 3600 % 60);

    setSecds(secnds)
    setMinutes(minutes)
    setHours(hours)

}


return (
      <View style={{}}>
        <Header
         backgroundColor="rgb(255, 64, 129)"
         centerComponent={{ text: 'Enregistrement', style: { color: '#fff', fontSize:30 } }} />
       <View style={{display:"flex", height:"80%", width:"100%" ,flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
        <Text style={{textAlign:"center", fontSize:40, fontWeight:"bold"}}> {hours}:{minutes}:{secds}</Text>
        <View
         style={{
            backgroundColor: "red",
            alignItems: "center",
            justifyContent: "center",
            width: (Dimensions.get("window").width)*(0.39),
            height: (Dimensions.get("window").width)*(0.39),
            borderRadius: 70,
            alignSelf: "center",
            margin: 20,
          }} >
           {!isStartRecording && 
           <Icon name="ios-mic" size={50} type='ionicon' onPress={()=> handleStart()} color='white' containerStyle={{backgroundColor:"transparent"}} />
           }
          {!!isStartRecording && 
           <Icon name="stop-circle-o" size={50} type='font-awesome' onPress={()=> handleFinish()} color='white' containerStyle={{backgroundColor:"transparent"}} />
           }

        </View>
        {!!isStartRecording && !!isFinishRecording &&
        <View style={{display:"flex", flexDirection:"row", justifyContent:"space-around", alignItems:"center", position:"absolute", bottom:0}}>
            <Icon name="check-circle" size={60} type='material-community-icon' onPress={() => handleSave(false)} color='green' containerStyle={{ backgroundColor:"transparent", margin:15}} />
            <Icon name="delete-forever" size={60} type='material-community-icon' onPress={() => handleSave(true)} color='grey' containerStyle={{backgroundColor:"transparent", margin:15}} />
        </View>
        }
       </View>
      </View>

	)
};




export default Recording; 



