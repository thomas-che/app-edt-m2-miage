import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {Alert, StyleSheet, Text, View, TouchableOpacity, SafeAreaView} from 'react-native';
import {Agenda, DateData, AgendaEntry, AgendaSchedule} from 'react-native-calendars';
import axios from 'axios';

import {LocaleConfig} from 'react-native-calendars';

LocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre'
  ],
  monthNamesShort: ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.'],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

export default function App() {
  const [items, setItems] = useState({})
  const [today, setToday] = useState(null)
  
  const url = "https://clients6.google.com/calendar/v3/calendars/en1louupjb9kis15cl37mlfc3o@group.calendar.google.com/events?calendarId=en1louupjb9kis15cl37mlfc3o%40group.calendar.google.com&singleEvents=true&timeZone=Europe%2FParis&maxAttendees=1&maxResults=250&sanitizeHtml=true&timeMin=2022-08-29T00%3A00%3A00%2B02%3A00&timeMax=2022-10-03T00%3A00%3A00%2B02%3A00&key=AIzaSyBNlYH01_9Hc5S1J9vuFmu2nUqBZJNAXxs"

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

  const getEvent = () => {
    var date = new Date()
    setToday(date.toISOString().split('T')[0])

    getEventInit()
      .then((data) => {
        console.log(data.data.items);

        const newItems: AgendaSchedule = {};
        Object.keys(data.data.items).forEach(i => {
          newItem = {
            created: data.data.items[i].created,
            creator: data.data.items[i].creator,
            end: data.data.items[i].end,
            etag: data.data.items[i].etag,
            eventType: data.data.items[i].eventType,
            htmlLink: data.data.items[i].htmlLink,
            iCalUID: data.data.items[i].iCalUID,
            id: data.data.items[i].id,
            kind: data.data.items[i].kind,
            organizer: data.data.items[i].organizer,
            sequence: data.data.items[i].sequence,
            start: data.data.items[i].start,
            status: data.data.items[i].status,
            summary: data.data.items[i].summary,
            updated: data.data.items[i].updated,
          }
          if(!newItem.summary.includes("SIMSA")){
            if(newItems[data.data.items[i].start.dateTime.substring(0, 10)] != null){
              tmpArray = [newItem].concat(newItems[data.data.items[i].start.dateTime.substring(0, 10)]);
              newItems[data.data.items[i].start.dateTime.substring(0, 10)] = tmpArray.sort(function(a,b){return new Date(a.start.dateTime) - new Date(b.start.dateTime);});
            }
            else {
              newItems[data.data.items[i].start.dateTime.substring(0, 10)] = [newItem]
            }
          }
        });
        setItems(newItems)
        console.log(newItems)
      })
      .catch( error => {
        console.log('ERROR');
      })
  }

  useEffect( () => {
    getEvent()
  }, [])

  const renderIem = (item) => {
    if(item.start) {
      var sty = styles.itemContainer
      var styText = null
      if(item.summary.includes('TA')){ 
        sty = styles.itemContainerTA 
        styText = styles.textTA
      }
      return (
        <View style={sty}>
          <Text style={styText}>{item.start.dateTime.substring(11, 16)} - {item.end.dateTime.substring(11, 16)}</Text>
          <Text style={styText}>{item.summary}</Text>
        </View>
      )
    }
    else{
      return <View />;
    }
  }



  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <Agenda
        items={items}
        selected={today}
        renderItem={renderIem}
        // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday
        firstDay={1}
        onRefresh={() => getEvent()}
      />
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  itemContainer: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  itemContainerTA: {
    backgroundColor: '#F0F0F0',
    flex: 1,
    borderRadius: 5,
    padding: 8,
    marginRight: 10,
    marginTop: 17
  },
  textTA: {
    color: '#989898',
    fontStyle: 'italic',
    fontSize: 11
  }
});
