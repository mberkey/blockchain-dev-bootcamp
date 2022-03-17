import React, {Component} from 'react';
import './App.css';
import { connect }from 'react-redux'
import {loadAccount, loadWeb3, loadToken, loadExchange}from '../store/interactions';
import Navbar from "./Navbar"
import Content from './Content'
import { contractsLoadedSelector } from '../store/selectors/selectors';
class App extends Component{
  componentDidMount(){
      this.loadBlockChainData(this.props.dispatch)
  }
  
  
  async loadBlockChainData(dispatch){
    
    //Connect to browser Ethereum Client (MetaMask) 
    const web3 = await loadWeb3(dispatch);    
    const networkId = await web3.eth.net.getId(); //5777   
    await loadAccount(web3,dispatch);    
    const token = await loadToken(web3,networkId,dispatch);
    const exchange = await loadExchange(web3,networkId,dispatch);
    console.log(`Token:  ${token}`)
    console.log(`Exchange:  ${exchange}`)
    if(!token) {
      alert('Token smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
    if(!exchange) {
      alert('Exchange smart contract not detected on the current network. Please select another network with Metamask.')
      return
    }
  }

  render (){
    return(
            <div>
              <Navbar/>
              {this.props.contractsLoaded? <Content/>: <div className='content'></div>}
           </div>
    );
  }
}
//Map state to props
function mapStatetoProps(state){
  return{
    contractsLoaded: contractsLoadedSelector(state)
  
  }
}

//Connect app to redux
export default connect(mapStatetoProps)(App);
