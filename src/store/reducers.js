//Our Redux Store 
import {combineReducers} from 'redux';

function web3(state = {}, action){
    //Depending on action, change state accordingly.
    switch(action.type){
        case 'WEB3_LOADED':
            //When action comes in will update state with Web3 Connection
            return {...state, connection: action.connection}
        case 'WEB3_ACCOUNT_LOADED':
            return{...state, account:action.account}
        default:
            return state
    }
}

function token(state = {}, action){
    //Depending on action, change state accordingly.
    switch(action.type){
        case 'TOKEN_LOADED':
            //When action comes in will update state with Web3 Connection
            return {...state, contract: action.contract}
        default:
            return state
    }
}

function exchange(state = {}, action){
    //Depending on action, change state accordingly.
    switch(action.type){
        case 'EXCHANGE_LOADED':
            //When action comes in will update state with Web3 Connection
            return {...state, contract: action.contract}
        default:
            return state
    }
}


const rootReducer = combineReducers({
    web3
    ,token
    ,exchange
})
export default rootReducer