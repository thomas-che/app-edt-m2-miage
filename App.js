import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {Alert, StyleSheet, Text, View, TouchableOpacity, SafeAreaView} from 'react-native';
import axios from 'axios';
import { TailwindProvider } from "tailwindcss-react-native";
import EventCalendar from 'react-native-events-calendar';
import { Dimensions } from 'react-native';



let { width } = Dimensions.get('window')


export default function App() {
  const [items, setItems] = useState({})
  const [today, setToday] = useState(null)
  
  const url = "https://clients6.google.com/calendar/v3/calendars/en1louupjb9kis15cl37mlfc3o@group.calendar.google.com/events?calendarId=en1louupjb9kis15cl37mlfc3o%40group.calendar.google.com&singleEvents=true&timeZone=Europe%2FParis&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2022-09-20T00%3A00%3A00%2B02%3A00&timeMax=2022-10-15T00%3A00%3A00%2B02%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs"

  const getEventInit = () => {
    try {
      const res = axios.get(url);
      return new Promise((resolve, reject) => {
        resolve(res)
      })
    } catch (error) {
        return new Promise((resolve, reject) => {
          reject(error)
        })
    }
  }

  const extractInfo = (summary) => {
    var type = '';
    var groupe = '';
    var cours = '';
    var salle = '';
    var prof = '';

    type = summary.split(' ')[0]
    if(type == "TA") {
      groupe = summary.split(' ')[1]
      cours = "TA"
      return {type, groupe, cours, salle, prof}
    }
    const result = summary.substring(3).split(/[A-Z]{2}\.[A-Z]{2}/);
    groupe = result[0].split(' ')[0]
    if (groupe != 'SIR' && groupe != 'SIMSA' && groupe != 'ALT') {groupe = ''}
    if (groupe == '') {
      cours = result[0]
    } else {
      cours = result[0].split(groupe+' ')[1]
    }
    if(result[1] && 1 <= result[1].length) salle = result[1].substring(1)
    try{
      prof = summary.split(salle)[0].split(cours)[1]
    } catch (e) {
      console.log('Error : '+e)
    }

    return {type, groupe, cours, salle, prof}
  }

  const getEvent = () => {
    var date = new Date()
    setToday(date.toISOString().split('T')[0])

    getEventInit()
      .then((data) => {
        console.log(data.data.items);

        const newItems = [];
        Object.keys(data.data.items).forEach(i => {
          info = extractInfo(data.data.items[i].summary)
          console.log(info)
          newItem = {
            start: data.data.items[i].start.dateTime.substring(0, 10)+' '+data.data.items[i].start.dateTime.substring(11, 19),
            end: data.data.items[i].end.dateTime.substring(0, 10)+' '+data.data.items[i].end.dateTime.substring(11, 19),
            title: info.type + ' ' + info.cours,
            summary: info.salle + ' ' + info.prof,
            summaryOriginal: data.data.items[i].summary,
          }
          if(!newItem.summaryOriginal.includes("SIMSA")){
            newItems.push(newItem);
          }
        });
        setItems(newItems)
        console.log(newItems)
      })
      .catch( error => {
        console.log('ERROR : ', error);
      })
  }

  useEffect( () => {
    getEvent()
  }, [])


  return (
    <View style={{ flex: 1}}>
      < StatusBar
            animated={true}
            barStyle='dark-content'
            showHideTransition='fade'
            hidden={false} 
        />
      <View style={{ flex: 1, marginTop: 20 }}>
        <EventCalendar
          upperCaseHeader
          uppercase
          scrollToFirst={true}
          initDate={'2022-09-23'}
          events={items}
          width={width}
          format24h={true}
        />
      </View>
    </View>
  )  

}

