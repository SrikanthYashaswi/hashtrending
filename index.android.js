/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  ToastAndroid,
  View
} from 'react-native';
let store=[];
class DetailView extends Component{
  constructor(arg){
    super(arg);
    this.state={
      fetchSuccess:false,
      error:false,
    }
  }
  async componentWillMount(){
    this.getDetailedFeed();
  }
  async getDetailedFeed(){
    try{
      let {topic} = this.props;
      let params = {
        method:'GET',
        headers:{
          'Authorization':'bearer '+store['access_token'],
        }
      }
      let fnCall = await fetch(`https://api.twitter.com/1.1/search/tweets.json?q=${encodeURIComponent(topic)}`,params);
      let resp = await fnCall.json();
      store['data'][`${topic}`] = resp.statuses;
      this.setState({fetchSuccess:true});
    }
    catch(e){
      this.setState({error:true});
      ToastAndroid.show('ERROR',ToastAndroid.TOP);
    }
  }
  renderAnimation(){
    return(<ActivityIndicator size={70}   color={'indigo'} animating={true}/>);
  }
  renderData(){
    let {topic} = this.props;
    return (
      <View>
        <View style={styles.header}>
          <TouchableOpacity  onPress = {this.props.clear}>
            <Text style={styles.button}>back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{topic}</Text>
        </View>
        <ScrollView>{
          store['data'][`${topic}`].map( (item,key) =>{
            return <View  key={key} style={styles.spacing}><Text style= {styles.detailText}>{item.text}</Text></View>
          })
        }
        </ScrollView>
      </View>
    )
  }
  render(){
    let {topic} = this.props;
    let {fetchSuccess}= this.state;
    return (
      (typeof store['data'][topic] !== 'undefined') ? this.renderData(): this.renderAnimation()
    );
  }
}
export default class hashtrending extends Component {
  constructor(arg){
    super(arg);
    store['data']=[];
    this.state={
      access_token:null,
      success:false,
      trends:null,
      error:false,
      errorMessage:null,
      triggerTrendFunction:true,
      selectedTopic:null,
      cache:null,
    }
  }
  async componentWillMount(){
    try{
      let param = {
        method:'POST',
        headers:{
          'Authorization':'Basic bmFqVlloNWRpM2VVYVUxTXZndndsVDUzTzpUSXpCQkMySlBuZVJhZzN0eEVEU0hOV2JoZXZ0YUppeUVtRTZqb2dsQ0NmMFA2c0ZqRw==',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body:'grant_type=client_credentials',
      }
      let apiCall = await fetch('https://api.twitter.com/oauth2/token',param);
      let resp = await apiCall.json();
      store['access_token']=resp.access_token;
      this.setState({access_token:resp.access_token,success:true});
      ToastAndroid.show(`Getting data as fast as we can!`,ToastAndroid.TOP);
    }
    catch(e){
      this.setState({success:false,error:true,errorMessage:`Error fetching access_token ${e.message}`});
      ToastAndroid.show(`${e.message}`,ToastAndroid.TOP)
    }
  }
  async getTrends(){
    let {access_token,trends} = this.state;
    try{
      let param={
        method:'GET',
        headers:{
          'Authorization': `bearer ${access_token}`,
        }
      }
      let apiCall = await fetch('https://api.twitter.com/1.1/trends/place.json?id=2295424',param);
      let resp = await apiCall.json();
      this.setState({trends:resp[0].trends,triggerTrendFunction:false});
      ToastAndroid.show(`Latest Trends pulled!`,ToastAndroid.TOP)
    }
    catch(e){
      this.setState({error:true,errorMessage:`Error fetching trends ${e.message}`});
      ToastAndroid.show(`${e.message}`,ToastAndroid.TOP)
    }
  }
  renderFeeds(){
    let {triggerTrendFunction} = this.state;
    return(
      <View>
        <View style={styles.header}>
          <Text style={styles.title}>#Trending...</Text>
        </View>
      <ScrollView
      refreshControl= {
          <RefreshControl
              refreshing={triggerTrendFunction}
              onRefresh= {() =>{
                this.setState({triggerTrendFunction:true});
                this.getTrends();
              }}
              progressBackgroundColor='white'
              colors={['indigo','blue','green','blue']}
            />
        }
    >
    {
      this.state.trends.map( (item,k) =>
      {
        return <TouchableOpacity key={k} style={styles.wrapItem}><Text  style={styles.itemText}
          onPress={() => this.setState({selectedTopic:item.name})}
          >{item.name}</Text></TouchableOpacity>
      })
    }
    </ScrollView>

    </View>
  );
  }
  renderAnimation(){
    return(<ActivityIndicator size={70}   color={'indigo'} animating={true}/>);
  }
  renderDetailView(){
    let {selectedTopic} = this.state;
    return (
      <DetailView topic={selectedTopic} clear={() => this.setState({selectedTopic:null})}/>
    )
  }
  render() {
    let {error,success,triggerTrendFunction,trends,selectedTopic} = this.state;
    if(success && triggerTrendFunction){
      this.getTrends();
    }
    if(trends == null){
      return (
        <View style={styles.container}>{this.renderAnimation()}</View>
      )
    }
    return (
      <View style={styles.container}>
        {
          (selectedTopic == null )? this.renderFeeds() : this.renderDetailView()
        }
      </View>
    );
  }
}
const styles = StyleSheet.create({
  header:{
    backgroundColor:'#4485f3',
    flexDirection:'row',
    height:50,
  },
  title:{
    color:'white',
    padding:10,
    fontSize:22,
    textAlign:'center'
  },
  spacing:{
    padding:30,
  },
  button:{
    fontSize:16,
    padding:15 ,
    color:'white',
  },
  wrapItem:{
    padding:5,
    flex:1,
    borderBottomWidth:1,
    borderColor:'#e6e6e6',
    justifyContent:'center',
  },
  buttonText:{
    fontSize:20,
    color:'white',
    fontWeight:'bold',
  },
  detailText:{
    fontSize:22,
    color:'#4485f3',
    justifyContent:'center',
    fontFamily:'Cochin'
  },
  itemText:{
    fontSize:20,
    padding:12,
    justifyContent:'center',
    color:'#4485f3'
  },
  viewer:{
    flex:1,
  },
  container: {
    flex:1,
    justifyContent:'center',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('hashtrending', () => hashtrending);
