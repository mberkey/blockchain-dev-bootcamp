
//const { ether, ETHER_ADDRESS ,tokens, wait} = require("../test/helpers")

const ETHER_ADDRESS = '0x0000000000000000000000000000000000000000' // Ether token deposit address
const ether = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}
const tokens = (n) => ether(n)

const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}


const Token = artifacts.require('Token')
const Exchange = artifacts.require('Exchange')

module.exports = async function (callback){

    try {
        console.log('Seed Exchange Running')
        
        //Get accounts from blockchain
        const accounts = await web3.eth.getAccounts()

        //Get deployed token
        const token = await Token.deployed()
        console.log('Token fetched', token.address)

        //Get deployed exchange
        const exchange = await Exchange.deployed()
        console.log('Exchange fetched', exchange.address)

        //Give tokens to 2nd account
        const sender = accounts[0]
        const receiver = accounts[1]
        let amount = web3.utils.toWei('100000','ether') // 10,000 tokens

        await token.transfer(receiver,amount,{from:sender})
        console.log(`Transfered ${amount} tokens from ${sender} to ${receiver}`)
        
        //Set up exchange users
        const userGuy = accounts[0]
        const otherUserGuy = accounts[1]

        //userGuy Deposits Ether 
        amount = 1
        await exchange.depositEther({from:userGuy,value:ether(amount)})
        console.log(`Deposited ${amount} Ether from ${userGuy}`)

        //otherUserGuy Deposits tokens        
        amount = 10000

        
        await token.approve(exchange.address,tokens(amount),{from:otherUserGuy})
        console.log(`Aprroved ${amount} Ether from ${userGuy}`)


        await exchange.depositToken(token.address,tokens(amount),{from:otherUserGuy})
        console.log(`Deposited ${amount} tokens from ${otherUserGuy}`)

        //Seed Cancelled order
        
        //userGuy makes order to get tokens
        let orderResult
        let orderID

        orderResult = await exchange.makeOrder(token.address, tokens(100), ETHER_ADDRESS,ether(0.1),{from:userGuy})
        console.log(`Make order from ${userGuy}`)

        //userGuy cancels order 
        orderID = orderResult.logs[0].args.orderID
        await exchange.cancelOrder(orderID, {from:userGuy})
        console.log(`Cancelled order from ${userGuy}`)

        //Seed Filled orders
        
        //userGuy Makes order
        orderResult = await exchange.makeOrder(token.address, tokens(100),ETHER_ADDRESS, ether(0.1), {from:userGuy})
        console.log(`Filled order from ${userGuy}`)

        //otherUserGuy fills order
        orderID = orderResult.logs[0].args.orderID
        await exchange.fillOrder(orderID,{from:otherUserGuy})
        console.log(`Filled order from ${userGuy}`)

        //wait a second for timestamp
        await wait(1)

        //userGuy makes another order
        result = await exchange.makeOrder(token.address, tokens(10),ETHER_ADDRESS, ether(0.1),{from:userGuy})
        console.log(`Make order from ${userGuy}`)

        //otherUserGuy fills this order 
        orderID = orderResult.logs[0].args.id
        await exchange.fillOrder(orderID,{from:otherUserGuy})
        console.log(`Filled order from ${userGuy}`)

        //wait again
        await wait(1)
        
        //userGuy makes final order
        orderResult = await exchange.makeOrder(token.address, tokens(200),ETHER_ADDRESS, ether(0.15),{from:userGuy})
        console.log(`Make order from ${userGuy}`)

        orderID = orderResult.logs[0].args.id
        await exchange.fillOrder(orderID,{from:otherUserGuy})
        console.log(`Filled order from ${userGuy}`)

        //wait again
        await wait(1)

        //Seed Open Orders
        //userGuy Makes 10 orders
        for(let i=1;i<=10;i++){
            orderResult = await exchange.makeOrder(token.address, tokens(10*i), ETHER_ADDRESS,ether(0.01), {from:userGuy})
            console.log(`Make order number ${i} from ${userGuy}`)
            //wait
            await wait(1)
        }

        
        //otherUserGuy Makes 10 orders
        for(let i=1;i<=10;i++){
            orderResult = await exchange.makeOrder(token.address, tokens(10*i), ETHER_ADDRESS,ether(0.01), {from:otherUserGuy})
            console.log(`Make order number ${i} from ${otherUserGuy}`)

            //wait
            await wait(1)
        }

    } catch(error){
        console.log(error)
    }
    callback()
}