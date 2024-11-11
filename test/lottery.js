const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Lottery', () => {
    let lottery, jaesangmom, participant1, participant2;

    beforeEach(async () => {
        // Setup accounts
        [jaesangmom, participant1, participant2] = await ethers.getSigners();

        // Deploy Lottery contract
        const Lottery = await ethers.getContractFactory('Lottery');
        lottery = await Lottery.deploy();
        await lottery.deployed();
    });

    describe('Deployment', () => {
        it('Assigns the jaesangmom correctly', async () => {
            const result = await lottery.jaesangmom();
            expect(result).to.equal(jaesangmom.address);
        });
    });

    describe('Participation', () => {
        it('Allows users to participate in the lottery', async () => {
            await lottery.connect(participant1).participate({ value: ethers.utils.parseEther("1") });
            const players = await lottery.getPlayers();
            expect(players[0]).to.equal(participant1.address);
        });

        it('Requires a minimum amount of ether to participate', async () => {
            await expect(lottery.connect(participant1).participate({ value: ethers.utils.parseEther("1") }))
                .to.be.revertedWith("Minimum 0.01 ether required to join");
        });
    });

    describe('Pick Winner', () => {
        beforeEach(async () => {
            // Participants participate in the lottery
            await lottery.connect(participant1).participate({ value: ethers.utils.parseEther("1") });
            await lottery.connect(participant2).participate({ value: ethers.utils.parseEther("1") });
        });

        it('Only jaesangmom can pick a winner', async () => {
            await expect(lottery.connect(participant1).pickWinner()).to.be.revertedWith("Only jaesangmom can call this function");
        });

        it('Transfers contract balance to the winner and resets the players array', async () => {
            // Check initial balance
            const initialBalance = await ethers.provider.getBalance(participant1.address);

            // Pick a winner
            await lottery.connect(jaesangmom).pickWinner();

            // Check if participants array is reset
            const players = await lottery.getPlayers();
            expect(players.length).to.equal(0);

            // Verify the winner's balance has increased
            const finalBalance = await ethers.provider.getBalance(participant1.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });
    });
});
