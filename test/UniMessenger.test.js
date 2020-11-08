const UnMsgToken = artifacts.require('UnMsgToken');
const MsgXToken = artifacts.require('MsgXToken');
const UniMessenger = artifacts.require('UniMessenger');

require('chai')
    .use(require('chai-as-promised'))
    .should()

function c(amount) {
    return web3.utils.toWei(amount, 'ether');
}

contract('MessageFarm', ([owner,investor]) => {
    let msgxToken, unmsgToken, messageFarm;

    before(async () => {
        msgxToken = await MsgXToken.new();
        unmsgToken = await UnMsgToken.new();
        messageFarm = await UniMessenger.new(msgxToken.address, unmsgToken.address);
        await msgxToken.transfer(messageFarm.address, c('10000'));
        await unmsgToken.transfer(investor, c('1.4'), { from: owner });
    })

    describe('UnMsg deployment', async () => {
        it('UnMsg name is right', async () => {
            const name = await unmsgToken.name();
            assert.equal(name, 'UniMessenger')
        })
    })

    describe('MsgX deployment', async () => {
        it('MsgX name is right', async () => {
            const name = await msgxToken.name();
            assert.equal(name, 'Messagex')
        })
    })

    describe('MessageFarm deployment', async () => {
        it('MessageFarm name is right', async () => {
            const name = await messageFarm.name();
            assert.equal(name, 'UniMessenger V1')
        })

        it('MessageFarm hodls tokens', async () => {
            const balance = await msgxToken.balanceOf(messageFarm.address);
            assert.equal(balance.toString(), c('10000'))
        })
    })

    describe('Message UniMessengerV1', async() => {
        it('rewards investors with MsgX', async () => {
            let result

            result = await unmsgToken.balanceOf(investor)
            assert.equal(result.toString(), c('1.4'), 'Got UnMsg')

            await unmsgToken.approve(messageFarm.address, c('1.4'), { from:investor })
            await messageFarm.stake(c('1.4'), { from: investor })

            await unmsgToken.approve(messageFarm.address, c('1.4'), { from:owner })
            await messageFarm.stake(c('1.4'), { from: owner })

            await messageFarm.issue()

            result = await unmsgToken.balanceOf(messageFarm.address)
            assert.equal(result.toString(), c('2.8'), 'Farm has UnMsg')

            await messageFarm.sendMessage(owner, 'hi', { from:investor })
            await messageFarm.sendMessage(investor, 'hoi')
            await messageFarm.sendMessage(investor, 'nice')


            result = await messageFarm.getMessages(investor)
            assert.equal(result.toString(), 'hoi,nice', 'hi from owner')

            result = await messageFarm.getAuthors(investor)
            assert.equal(result.toString(), '0x5310aAc3D54D3295A0b5fA22eED9517462b17e62,0x5310aAc3D54D3295A0b5fA22eED9517462b17e62')

            result = await messageFarm.getMessages(owner)
            assert.equal(result.toString(), 'hi', 'hi from investor')

            result = await messageFarm.getAuthors(owner)
            assert.equal(result.toString(), '0xB44c3E9435C80A86C852d228fb858B3Be0e0464F')

            result = await messageFarm.getMessage(investor, 0, { from:investor })
            assert.equal(result.toString(), 'hoi', 'read message')

            await messageFarm.unstake({ from:investor });
            await messageFarm.unstake({ from:owner });

            result = await unmsgToken.balanceOf(investor);
            assert.equal(result.toString(), c('1.4'), 'Investor has 1.4 unmsg')

            result = await unmsgToken.balanceOf(messageFarm.address);
            assert.equal(result.toString(), c('0'), 'No tokens farmed')

        })
    })
})