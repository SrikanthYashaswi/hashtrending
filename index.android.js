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
class DetailView extends Component{
  constructor(arg){
    super(arg);
  }
  render(){
    const {topic}= this.props;
    return(<View>
        <Text style={styles.button} >{topic}</Text>
      </View>
    )
  }
}
class FeedView extends Component{
  constructor(arg){
    super(arg);
    this.state={
      access_token:null,
      success:false,
      trends:null,
      error:false,
      errorMessage:null,
      triggerTrendFunction:true,
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
      this.setState({access_token:resp.access_token,success:true});
    }
    catch(e){
      this.setState({success:false,error:true,errorMessage:`Error fetching access_token ${e.message}`});
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
    }
    catch(e){
      this.setState({error:true,errorMessage:`Error fetching trends ${e.message}`});
    }
  }
  renderButton(){
    return (
      <TouchableOpacity
        onPress = {this.getTrends.bind(this)}
        style={styles.button}
        >
        <Text style={styles.buttonText}>
          #GetLatestTrends
        </Text>
      </TouchableOpacity>
    );
  }
  render() {
    let {error,success,triggerTrendFunction,access_token,trends} = this.state;
    if(success && triggerTrendFunction){
      this.getTrends();
    }
    return (
      <View style={styles.container}>
        {
          (trends !== null) ? <ScrollView
            refreshControl= {
                <RefreshControl
                    refreshing={triggerTrendFunction}
                    onRefresh= {() =>{
                      this.setState({triggerTrendFunction:true});
                      this.getTrends();
                    }}
                    progressBackgroundColor='#4485f3'
                  />
              }
          >
          {
            this.state.trends.map( (item,k) =>
            {
              return <TouchableOpacity key={k} style={styles.wrapItem}><Text  style={styles.itemText}
                  onPress={this.props.onSelectTopic.bind(this,item.name)}
                >{item.name}</Text></TouchableOpacity>
            })
          }
        </ScrollView> : <ActivityIndicator size={70}  color={'#4485f3'} animating={true}/>
      }
      </View>
    );
  }
}
export default class hashtrending extends Component {
  constructor(arg){
    super(arg);
    this.state={
      selectedTopic:null,
    }
  }
  updateSelectedOption(topic){
    this.setState({selectedTopic:topic});
  }
  render(){
    const {selectedTopic} = this.state;
    return (
              (selectedTopic==null)?<FeedView onSelectTopic={(topic) => this.setState({selectedTopic:topic}) } /> :
              <DetailView
                  topic={selectedTopic}
                />

          )
  }
}

const styles = StyleSheet.create({
  header:{

  },
  button:{
    backgroundColor:'#4485f3',
    padding:10,
    margin:10,
    borderRadius:5,
  },
  wrapItem:{
    padding:5,
    flex:1,
    justifyContent:'center',
  },
  buttonText:{
    fontSize:20,
    color:'white',
    fontWeight:'bold',
  },

  itemText:{
    fontSize:20,
    padding:19,
    justifyContent:'center',
    borderBottomWidth:1,
    borderColor:'whitesmoke',
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
