const Token = artifacts.require('./Token')
import {EVM_REVERT, tokens}  from './helpers'

//Load tests
require('chai')
    .use(require('chai-as-promised'))
    .should()

//Pass name of Contract, then as call back and inject all our accounts
contract('Token', ([deployer, receiver, exchange])=>{
    let token
    const name = 'BerKoin'
    const symbol = 'BKN'
    const decimals = '18'
    const totalSupply = tokens(1000000).toString()

    //Fetch token from Blockchain, before tests
    beforeEach(async () => {
        token = await Token.new()
    })

    describe('deployment', () =>{
        //Any call to blockchain will be async. 
        it('tracks the name', async () =>{   

            //Read Token Name
            const result = await token.name()
            
            //Token name is... 'Name'
            result.should.equal(name)
        })

        it('tracks the symbol', async() =>{
            const result = await token.symbol();
            result.should.equal(symbol)
        })
        
        it('tracks the decimals', async() =>{
            const result = await token.decimals();
            result.toString().should.equal(decimals)
        })

        
        it('tracks the total supply', async() =>{
            const result = await token.totalSupply();
            result.toString().should.equal(totalSupply.toString())
        })

        it('applies total supply to deployer', async () =>{
            //accounts is our callback guy from the contract initialization
            const result = await token.balanceOf(deployer);
            result.toString().should.equal(totalSupply.toString())
        })
    })

    describe('delegated token transfer', () =>{
        
            let transferAmount
            let transferResult

        //Approve tokens
        beforeEach(async() =>{
            transferAmount = tokens(100)
            await token.approve(exchange, transferAmount, {from: deployer})
        })   

        describe('success', async () =>{
            //Fetch token from Blockchain, before tests
            beforeEach(async () => {                
                //Transfer
                transferResult = await token.transferFrom(deployer, receiver,transferAmount, {from:exchange})
            })

            //Before Transfer
            //balanceOf = await token.balanceOf(deployer)
            //console.log("deployer balance before transfer: %d", balanceOf.toString())

            //balanceOf = await token.balanceOf(receiver)
            //console.log("receiver balance before transfer: %d", balanceOf.toString())

            it('transfers token balances' , async() =>{
                let balanceOf

                //Transfer
                balanceOf = await token.balanceOf(deployer)
                balanceOf.toString().should.equal(tokens(999900).toString())
                console.log("deployer balance after transfer: %d", balanceOf.toString())

                balanceOf = await token.balanceOf(receiver)
                balanceOf.toString().should.equal(tokens(100).toString())
                console.log("receiver balance after transfer: %d", balanceOf.toString())
            })

            it('resets the allowance', async()=>{
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal('0')
            })


            //Test Event
            it('emits transfer event', async() =>{

                //The log is an [Object] = Array with an object. 
                //transferResult.logs[0] is the Object
                const log = transferResult.logs[0]
                log.event.should.equal('Transfer')
                
                //log.args is Transfer event Object inside the main Log Object.
                //#knowledge
                const event = log.args
                event.from.toString().should.equal(deployer,'from is correct')
                event.to.toString().should.equal(receiver,'to is correct')
                event.value.toString().should.equal(transferAmount.toString(), 'transfer amount is correct')
                
                //Would return whole transfer event result 
                //console.log(transferResult)

                //Would return transfer logs
                //console.log(transferResult.logs)
            })

        })

        describe('failure', async () =>{
            it('rejects insufficient balances', async() =>{
                let invalidAmount 
                invalidAmount = tokens(1000000000) //100 Million way more than token supply
                await token.transfer(receiver, invalidAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT)

                //Attempt transfer tokens, with none
                invalidAmount = tokens(10)
                await token.transfer(deployer, invalidAmount, {from: receiver}).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects invalid recipients', async() =>{
                await token.transfer(0x0, transferAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT)
            })
        })

    })

    describe('approving tokens', () => {
        let transferResult
        let transferAmount

        beforeEach(async ()=>{
            transferAmount = tokens(100)
            transferResult = await token.approve(exchange, transferAmount, {from: deployer})
        })

        describe('success', ()=>{
            it('allocates an allowance for delegated token spending on an exchange', async()=>{
                const allowance = await token.allowance(deployer, exchange)
                allowance.toString().should.equal(transferAmount.toString())
            })

            it('emits Approval event', () =>{
                const log = transferResult.logs[0]
                log.event.should.equal('Approval')
                const event = log.args
                event.owner.toString().should.equal(deployer, 'owner is correct')
                event.spender.should.equal(exchange, 'spender is correct')
                event.value.toString().should.equal(transferAmount.toString(), 'value is correct')


            })
        })


        describe('failure', ()=>{

            it('rejects insufficient amounts', async() =>{
                //Try to transfer way too many tokens
                const tooManyTokens = tokens(100000000)
                await token.transferFrom(deployer, receiver,tooManyTokens, {from: exchange}).should.be.rejectedWith(EVM_REVERT)
            })

            it('rejects invalid spenders',async () =>{
                await token.approve(0x0, transferAmount, {from: deployer}).should.be.rejectedWith(EVM_REVERT)

            })
        })
    })
})