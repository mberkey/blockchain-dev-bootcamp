import Web3 from 'web3'
import {ether, ETHER_ADDRESS, EVM_REVERT, tokens}  from './helpers'
const Token = artifacts.require("./Token")
const Exchange = artifacts.require("./Exchange")


//Load tests
require('chai')
    .use(require('chai-as-promised'))
    .should()

//Pass name of Contract, then as call back and inject all our accounts
//First account in this array is deployer 
//Second on the ganache blockchain (the array --v) is fee account
contract('Exchange', ([deployer, feeAccount, userGuy, otherUserGuy])=>{
    let exchange
    let token
    const feePercent = 10 //10% we hungry 

    //Fetch token from Blockchain, before tests
    beforeEach(async () => {
        
        //Deploy token
        token = await Token.new()

        //Send userGuy tokens for use
        token.transfer(userGuy, tokens(100))

        //Pass the fee account to Exchange
        exchange = await Exchange.new(feeAccount, feePercent)

    })

    //Track fee account
    describe('deployment', () =>{
        it('tracks the fee account'), async ()=>{
            const feeResult = await exchange.feeAccount()
            feeResult.should.equal(feeAccount)
        }

        it('tracks the fee percent', async () =>{
            const feeResult = await exchange.feePercent()
            feeResult.toString().should.equal(feePercent.toString())
        })
    })

    describe('fallback', () =>{
        it('reverts when Ether is sent', async () =>{
            //1 is in WEI :)
            await exchange.sendTransaction({value: 1, from: userGuy}).should.be.rejectedWith(EVM_REVERT)
        })
    })

    //Test Depositing Ether
    describe('depositing Ether', ()=>{
        let depositResult
        let depositAmount

        beforeEach(async () =>{
            depositAmount = ether(1)
            depositResult = await exchange.depositEther({from:userGuy,value:depositAmount})
        })

        it('tracks the Ether deposit', async()=>{
            const balance = await exchange.tokens(ETHER_ADDRESS, userGuy)
            balance.toString().should.equal(depositAmount.toString())
        })       
            
        it('emits a Deposit event', async ()=>{
            const log = depositResult.logs[0]
            log.event.should.equal('Deposit')
            const event = log.args
            event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
            event.user.toString().should.equal(userGuy, 'owner is correct')
            event.amount.toString().should.equal(depositAmount.toString(), 'deposit amount is correct')
            event.balance.toString().should.equal(depositAmount.toString(), 'balance is correct')
        });        
 
    })

    //Test Withdrawing Ether
    describe('withdraw Ether', ()=>{
        let withdrawResult
        let amount //we deposit and withdraw in this test
        //Before tests
        beforeEach(async () =>{
            amount = ether(1)
            //Need to deposit ether first
            await exchange.depositEther({from:userGuy,value:amount })
        })

        describe('success', ()=>{
            beforeEach(async() =>{
                //withdraw ether
                withdrawResult = await exchange.withdrawEther(amount ,{from:userGuy})                
            })            

            it('withdraws Ether funds', async()=>{
                const balance = await exchange.tokens(ETHER_ADDRESS,userGuy)
                balance.toString().should.equal('0')
            })

            it('emits a Withdraw event', async ()=>{
                const log = withdrawResult.logs[0]
                log.event.should.equal('Withdraw')
                const event = log.args
                event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
                event.user.should.equal(userGuy, 'owner is correct')
                event.amount.toString().should.equal(amount.toString(), 'withdraw amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')
            })        
        })
        
        describe('failure',() =>{
            amount = ether(100) //withdraw more than balance total
            it('rejects withdraws for insufficient balances', async()=>{
                await exchange.withdrawEther(amount, {from:userGuy}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })


    describe('withdrawing tokens', ()=>{
        let withdrawResult
        let amountResult
        let tokenAmount
        describe('success', ()=>{
            beforeEach(async()=>{
                tokenAmount = tokens(10)
                //deposit tokens to use here
                await token.approve(exchange.address, tokenAmount, { from: userGuy })
                await exchange.depositToken(token.address, tokenAmount, { from: userGuy })
                
                // Withdraw tokens
                withdrawResult = await exchange.withdrawToken(token.address, tokenAmount, { from: userGuy })      
            })

            it('withdraws token funds',async ()=>{
                const balance = await exchange.tokens(token.address,userGuy)
                balance.toString().should.equal('0')
            })


            it('emits a Withdraw event', async ()=>{
                const log = withdrawResult.logs[0]
                log.event.should.equal('Withdraw')
                const event = log.args
                event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
                event.user.should.equal(userGuy, 'user is correct')
                event.amount.toString().should.equal(tokenAmount.toString(), 'withdraw amount is correct')
                event.balance.toString().should.equal('0', 'balance is correct')
            })
    
        })
            describe('failure', ()=>{
            
                it('rejects Ether withdraws',async()=>{
                    await exchange.withdrawToken(ETHER_ADDRESS, tokenAmount, {from:userGuy}).should.be.rejectedWith(EVM_REVERT)
                })

                it('fails for insufficient balances', async()=>{
                    await exchange.withdrawToken(token.address, tokenAmount,{from:userGuy}).should.be.rejectedWith(EVM_REVERT)
                })
        })
       
    })
    
    describe('checking balances', ()=>{
        beforeEach(async () => {
            await exchange.depositEther({ from:userGuy, value: ether(1) })
        })
       
        it('returns user balance', async () => {
            const result = await exchange.balanceOf(ETHER_ADDRESS, userGuy)
            result.toString().should.equal(ether(1).toString())
        })
    })

    describe('making orders', ()=>{
        let orderResult
        let tokenAmount
        let etherAmount
        beforeEach(async()=>{
              tokenAmount = tokens(1)
              etherAmount = ether(1)
              orderResult = await exchange.makeOrder(token.address,tokenAmount,ETHER_ADDRESS,etherAmount,{from:userGuy})
        })

            it('tracks the newly created order', async ()=>{
                const orderCount = await exchange.orderCount()
                orderCount.toString().should.equal('1')
                const order = await exchange.orders('1')
                order.id.toString().should.equal('1','id is correct')
                order.user.should.equal(userGuy,'user is correct')
                order.tokenGet.should.equal(token.address,'tokenGet is correct')
                order.amountGet.toString().should.equal(tokenAmount.toString(),'amountGet is correct')
                order.tokenGive.should.equal(ETHER_ADDRESS,'tokenGive is correct')
                order.amountGive.toString().should.equal(etherAmount.toString(),'amountGive is correct')
                order.timestamp.toString().length.should.be.at.least(1,'timestamp is present')
            })

        it('emits an "Order" event', ()=>{
            const log = orderResult.logs[0]
            log.event.should.equal('Order')
            const event = log.args
            event.id.toString().should.equal('1', 'id is correct')
            event.user.should.equal(userGuy, 'user is correct')
            event.tokenGet.should.equal(token.address, 'tokenGet is correct')
            event.amountGet.toString().should.equal(tokenAmount.toString(), 'amountGet is correct')
            event.tokenGive.should.equal(ETHER_ADDRESS,'tokenGive is correct')
            event.amountGive.toString().should.equal(etherAmount.toString(),'amountGive is correct')
            event.timestamp.toString().length.should.be.at.least(1, 'timestamp is correct')
        })

       
    
    })

    describe('order actions',()=>{
        let etherAmount
        let tokenAmount
        let largeTokenAmount
        beforeEach(async()=>{
            etherAmount = ether(1)
            tokenAmount = tokens(1)
            largeTokenAmount = tokens(100)
            //userGuy deposits  Ether
            await exchange.depositEther({from:userGuy, value:etherAmount})
            //Give a test balances to the other user.
            await token.transfer(otherUserGuy,largeTokenAmount,{from:deployer});
            
            //other user deposits tokens only
            await token.approve(exchange.address, tokens(2),{from:otherUserGuy})
            await exchange.depositToken(token.address,tokens(2),{from:otherUserGuy})

            //userGuy makes order to buy tokens using Ether
            await exchange.makeOrder(token.address,tokenAmount,ETHER_ADDRESS, etherAmount,{from:userGuy})
        })

        describe('filling orders',()=>{
            let orderResult
            let etherAmount
            let tokenAmount
            describe('success',()=>{
                beforeEach(async()=>{
                    etherAmount = ether(1)
                    tokenAmount = tokens(1)
                    orderResult = await exchange.fillOrder('1',{from:otherUserGuy})
                })

                it('executes trade & charges fee', async()=>{
                    let balance
                    balance = await exchange.balanceOf(token.address, userGuy)
                    balance.toString().should.equal(tokenAmount.toString(),'UserGuy Received tokens')
                    balance = await exchange.balanceOf(ETHER_ADDRESS,otherUserGuy)
                    balance.toString().should.equal(etherAmount.toString(),'other user received Ether')
                    balance = await exchange.balanceOf(ETHER_ADDRESS,userGuy)
                    balance.toString().should.equal('0', 'Other user Ether deducted')
                    balance = await exchange.balanceOf(token.address,otherUserGuy)
                    balance.toString().should.equal(tokens(0.9).toString(),'Fee applied to person other user')
                    const feeAccount = await exchange.feeAccount()
                    balance = await exchange.balanceOf(token.address, feeAccount)
                    balance.toString().should.equal(tokens(0.1).toString(),'feeAccount received Fee')
                })

                it('updates filled orders', async ()=>{
                    const orderFilled = await exchange.orderFilled(1)
                    orderFilled.should.equal(true)
                })

                it('Emits a "Trade" event',()=>{
                    const log = orderResult.logs[0]
                    log.event.should.equal('Trade')
                    const event = log.args
                    event.id.toString().should.equal('1', 'id is correct')
                    event.user.should.equal(userGuy, 'user is correct')
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct')
                    event.amountGet.toString().should.equal(tokenAmount.toString(), 'amountGet is correct')
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    event.amountGive.toString().should.equal(etherAmount.toString(), 'amountGive is correct')
                    event.userFill.should.equal(otherUserGuy, 'userFill is correct')
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
                })
                
                describe('failure',()=>{
                    
                    it('rejects invalid order ids', async()=>{
                        const invalidOrderId=99999
                        await exchange.fillOrder(invalidOrderId,{from:otherUserGuy}).should.be.rejectedWith(EVM_REVERT)
                    })
                    
                    it('rejects already filled orders', async()=>{
                        //Fill the order
                        await exchange.fillOrder('1',{from:otherUserGuy}).should.be.fulfilled
                        //try to fufill this order # again
                        await exchange.fillOrder('1',{from:otherUserGuy}).should.be.rejectedWith(EVM_REVERT)
                    })

                    it('rejects cancelled orders', async()=>{
                        //cancel the order
                        await exchange.cancelOrder('1',{from:otherUserGuy}).should.be.fulfilled
                        //try to fill another order
                        await exchange.fillOrder('1',{from:otherUserGuy}).should.be.rejectedWith(EVM_REVERT)
                    })
                })
            })
        })

        describe('cancelling orders',() =>{
            let orderResult
            describe('success', ()=>{    
                beforeEach(async()=>{
                    orderResult = await exchange.cancelOrder('1',{from:userGuy})
                })
        
                it('updates cancelled orders',async ()=>{
                    const orderCancelled = await exchange.orderCancelled(1)
                    orderCancelled.should.equal(true)
                })

                it('Emits a "Cancel" event',async ()=>{
                    const log = orderResult.logs[0]
                    log.event.should.equal('Cancel')
                    const event = log.args
                    event.id.toString().should.equal('1', 'id is correct')
                    event.user.should.equal(userGuy, 'user is correct')
                    event.tokenGet.should.equal(token.address, 'tokenGet is correct')
                    event.amountGet.toString().should.equal(tokenAmount.toString(), 'amountGet is correct')
                    event.tokenGive.should.equal(ETHER_ADDRESS, 'tokenGive is correct')
                    event.amountGive.toString().should.equal(etherAmount.toString(), 'amountGive is correct')
                    event.timestamp.toString().length.should.be.at.least(1, 'timestamp is present')
                 })

            })

            describe('failure', ()=>{
                it('rejects invalid order id',async()=>{
                    const invalidOrderID = 9999
                    await exchange.cancelOrder(invalidOrderID,{from:userGuy}).should.be.rejectedWith(EVM_REVERT)
                })

                it('rejects unauthorized cancellations', async()=>{
                    await exchange.cancelOrder('1',{from: otherUserGuy}).should.be.rejectedWith(EVM_REVERT)
                })
            })
        })
    })
    
    //Test Deposit tokens
    describe('depositing tokens', () =>{
        let depositResult
        let depositAmount
        beforeEach(async () =>{
            depositAmount = tokens(10)
            await token.approve(exchange.address, depositAmount, {from: userGuy})
            depositResult = await exchange.depositToken(token.address, depositAmount.toString(), {from: userGuy})
        })

        describe('success',() =>{
            it('tracks the token deposit', async () =>{
               
                //Check token balance
                let balance

                balance = await token.balanceOf(exchange.address)
                balance.toString().should.equal(depositAmount.toString())
                balance = await exchange.tokens(token.address, userGuy)
                balance.toString().should.equal(depositAmount.toString())
            })
        })

   
            
        it('emits a Deposit event', async ()=>{
               const log = depositResult.logs[0]
                log.event.should.equal('Deposit')
                const event = log.args
                event.token.should.equal(token.address, 'token address is correct')
                event.user.toString().should.equal(userGuy, 'owner is correct')
                event.amount.toString().should.equal(depositAmount.toString(), 'deposit amount is correct')
                event.balance.toString().should.equal(depositAmount.toString(), 'balance is correct')

        });        
     
        describe('failure',() =>{

            it('rejects Ether Deposits', async ()=>{
                await exchange.depositToken(ETHER_ADDRESS, depositAmount, {from: userGuy})
            })

            it('fails when no tokens are approved', async() =>{
                //Dont approve tokens before deposit
                await exchange.depositToken(token.address,depositAmount,{from:userGuy}).should.be.rejectedWith(EVM_REVERT)
            })
        })
    })
})