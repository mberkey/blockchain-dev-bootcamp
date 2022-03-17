import Web3 from 'web3';
import Token from '../abis/Token.json';
import Exchange from '../abis/Exchange.json';
import {web3Loaded
    ,web3AccountLoaded
    ,tokenLoaded
    ,exchangeLoaded
    } from "./actions";

//Handle blockchain interactions
//State changes 
export const loadWeb3 = async (dispatch) =>{
    if(typeof window.ethereum !=='undefined'){
        const web3 = new Web3(window.ethereum);
        dispatch(web3Loaded(web3))
        return web3;
    } else {
        window.alert('Please install MetaMask')
        window.location.assign('https://metamask.io')
    }
}

export const loadAccount = async (web3,dispatch) =>{

    const accounts = await web3.eth.getAccounts()
    const account = await accounts[0];
    if(typeof account !=='undefined'){
       dispatch(web3AccountLoaded(account))
        return account;
    } else {
        window.alert('Please login with MetaMask')
        return null
    }
}

export const loadToken = async(web3,networkId, dispatch)=>{
try{
    const tokenContractAddress = Token.networks[networkId].address;
    const token = new web3.eth.Contract(Token.abi,tokenContractAddress)

    if(typeof token !== 'undefined'){
        dispatch(tokenLoaded(token))
    }else{
        alert('Token not loaded!')
    }
    return token;
    }catch(err){
        console.log('Contract not deployed to the current network. Please select another network with Metamask.')
        console.log(err);
        return null
    }
}

export const loadExchange = async (web3,networkId, dispatch)=>{
    try{
        const exchangeContractAddress = Exchange.networks[networkId].address;
        const exchange = new web3.eth.Contract(Exchange.abi,exchangeContractAddress)
        if(typeof exchange !== 'undefined'){
            dispatch(exchangeLoaded(exchange))
        }else{
            alert('Exchange not loaded!')
        }
        
        return exchange;
        }catch(err){
            console.log('Contract not deployed to the current network. Please select another network with Metamask.')
            console.log(err);
            return null
        }
    }
    
