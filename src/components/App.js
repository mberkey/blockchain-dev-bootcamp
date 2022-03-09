import React, {Component, useState} from 'react';
import './App.css';
import Web3 from 'web3';
import Token from '../abis/Token.json';
//Set up dataprovider architecture. 


class App extends Component{
  state = {
      ...this.loadBlockChainData()

  }
  
  async loadBlockChainData(){
    
    //Connect to browser Ethereum Client (MetaMask) 
    const web3 = new Web3(window.ethereum);
    const network = await web3.eth.net.getNetworkType();
    const networkId = await web3.eth.net.getId(); //5777
    const accounts = await web3.eth.getAccounts();
    const tokenAbi = Token.abi;

    //ex. MainNet, Kovan, Test. etc.
    const tokenNetworks = Token.networks;
    const tokenContractAddress = tokenNetworks[networkId].address;

    console.log("web3", web3);
    console.log("network", network);
    console.log("accounts", accounts);
    console.log('Network data', tokenNetworks);
    console.log('Token abi', tokenAbi);
    console.log('Token Contract Address', tokenContractAddress);
    //Get instance of token        
    //Get the JSON interface from the Token.json
    //Address is under the networks KV in Token.json
    const tokenContract = new web3.eth.Contract(tokenAbi, tokenContractAddress)
    console.log('Token Contract', tokenContract);

    const totalSupply = await tokenContract.methods.totalSupply().call();
    console.log(totalSupply);
    
  }

  render (){
    return(
            <div>
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
              <a className="navbar-brand" href="/#">Berkoin ($BKN) Exchange</a>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNavDropdown">
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <a className="nav-link" href="/#">Link 1</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/#">Link 2</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="/#">Link 3</a>
                  </li>
                </ul>
              </div>
            </nav>
            <div className="content">
              <div className="vertical-split">
                <div className="card bg-dark text-white">
                  <div className="card-header">
                    Card Title
                  </div>
                  <div className="card-body">
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="/#" className="card-link">Card link</a>
                  </div>
                </div>
                <div className="card bg-dark text-white">
                  <div className="card-header">
                    Card Title
                  </div>
                  <div className="card-body">
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="/#" className="card-link">Card link</a>
                  </div>
                </div>
              </div>
              <div className="vertical">
                <div className="card bg-dark text-white">
                  <div className="card-header">
                    Card Title
                  </div>
                  <div className="card-body">
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="/#" className="card-link">Card link</a>
                  </div>
                </div>
              </div>
              <div className="vertical-split">
                <div className="card bg-dark text-white">
                  <div className="card-header">
                    Card Title
                  </div>
                  <div className="card-body">
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="/#" className="card-link">Card link</a>
                  </div>
                </div>
                <div className="card bg-dark text-white">
                  <div className="card-header">
                    Card Title
                  </div>
                  <div className="card-body">
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="/#" className="card-link">Card link</a>
                  </div>
                </div>
              </div>
              <div className="vertical">
                <div className="card bg-dark text-white">
                  <div className="card-header">
                    Card Title
                  </div>
                  <div className="card-body">
                    <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                    <a href="/#" className="card-link">Card link</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
    );
  }
}
export default App;
