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
contract('Exchange', ([deployer, feeAccount, userGuy])=>{
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
        });  
        
        describe('failure',() =>{
            amount = amount * 100 //withdraw more than balance total
            it('rejects withdraws for insufficient balances', async()=>{
                await exchange.withdrawEther(amount, {from:userGuy}).should.be.rejectedWith(EVM_REVERT)
            })
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
                amountResult = await token.approve(exchange.address, tokenAmount, {from:userGuy})

            })

            it('withdraws token funds',async ()=>{
                const balance = await exchange.tokens(token.address,userGuy)
                balance.toString().should.equal('0')
            })
        })

        it('emits a Withdraw event', async ()=>{
            const log = withdrawResult.logs[0]
            log.event.should.equal('Withdraw')
            const event = log.args
            event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
            event.user.should.equal(userGuy, 'user is correct')
            event.amount.toString().should.equal(amount.toString(), 'withdraw amount is correct')
            event.balance.toString().should.equal('0', 'balance is correct')
        })

        describe('failure', ()=>{
            
            it('rejects Ether withdraws',async()=>{
                await exchange.withdrawTokens(ETHER_ADDRESS, tokenAmount, {from:userGuy}).should.be.rejectedWith(EVM_REVERT)
            })

            it('fails for insufficient balances', async()=>{
                await exchange.withdrawToken(token.address, tokenAmount,{from:userGuy}).should.be.rejectedWith(EVM_REVERT)
            })
        })

        describe('checking balances', async ()=>{
            const result = await exchange.balanceOf(ETHER_ADDRESS, userGuy)
            result.toString().should.equal(ether(1).toString())
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