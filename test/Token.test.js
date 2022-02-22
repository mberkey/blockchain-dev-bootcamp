const Token = artifacts.require('./Token');

require('chai')
    .use(require('chai-as-promised'))
    .should()

//Pass name of Contract, then as call back and inject all our accounts
contract('Token', (accounts)=>{
    let token
    const name = 'BerKoin'
    const symbol = 'BKN'
    const decimals = '18'
    const totalSupply = '100000000000000000000000'

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
            result.toString().should.equal(totalSupply)
        })

    })
})