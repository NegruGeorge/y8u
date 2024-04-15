const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");


async function increaseTime(months) {
    
    const seconds = months * 30 * 24 * 60 * 60 + 10;
    
    // Increase the time in the Hardhat Network
    await network.provider.send("evm_increaseTime", [seconds]);
    
    // Mine a new block to apply the time change
    await network.provider.send("evm_mine");
  }

describe("Y8uDistributorTesting Tests Liquidity", function () {
    let distributor, token;
    let owner, addr1, addr2;


    beforeEach(async () => {
        [owner, addr1, addr2,addr3,addr4,addr5, addrOverAllocated] = await ethers.getSigners();

        const Y8uDistributorTesting = await ethers.getContractFactory("Y8uDistributorTesting");
        distributor = await Y8uDistributorTesting.deploy();
        // Access the Y8uERC20 token instance from the Y8uDistributorTesting contract
        const tokenAddress = await distributor.y8u();
        token = await ethers.getContractAt("Y8uERC20", tokenAddress);

        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000"));
        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("TGE not started");

        await distributor.setTgeTimestamp();
    });

    it("Should fail claiming with other address than the owner", async function (){
        try{
            await distributor.connect(addr1).claimLiquidityExchangesMM()
        }catch(err){
            expect(err.message).to.contain("VM Exception while processing")
        }
    })

    it("Should allow first valid claims", async function () {
        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");

        const balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000"));
    });

    it("Should allow first valid claim until 3rd month", async function () {
        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");

        let balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000"));

        await increaseTime(1);

        await distributor.claimLiquidityExchangesMM()
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333"));

        await increaseTime(1);
        await distributor.claimLiquidityExchangesMM()
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(2));

        await increaseTime(1);
        await distributor.claimLiquidityExchangesMM()

        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(3));


        await increaseTime(1);
        await distributor.claimLiquidityExchangesMM()
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(4));

        await increaseTime(1);
        await distributor.claimLiquidityExchangesMM()
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(5));

        // ...

        await increaseTime(24);
        await distributor.claimLiquidityExchangesMM()
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("50000000"));
    });


    it("Should allow first valid claim in 3rd month", async function () {
        await increaseTime(3);
        await distributor.claimLiquidityExchangesMM();

        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(3));
    });

    it("Should allow first valid claim in 4rd month", async function () {
        await increaseTime(4);
        await distributor.claimLiquidityExchangesMM();

        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(4));
    });



    it("Should allow first valid claim in final month", async function () {
        await increaseTime(24);
        await distributor.claimLiquidityExchangesMM();

        const balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(await distributor.LIQUIDITY_EXCHANGES_MM());

        expect(balance).to.equal(ethers.parseEther("50000000"));
    });

    it("Should allow first valid claim in final month", async function () {
        await increaseTime(25);
        await distributor.claimLiquidityExchangesMM();

        const balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(await distributor.LIQUIDITY_EXCHANGES_MM());

        expect(balance).to.equal(ethers.parseEther("50000000"));
    });

    it("Should allow first valid claim in final month", async function () {
        await increaseTime(26);
        await distributor.claimLiquidityExchangesMM();

        const balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("50000000"));

        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");
    });

    it("Should allow first valid claim in final month", async function () {
        await increaseTime(50);
        await distributor.claimLiquidityExchangesMM();

        const balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("50000000"));

        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");
    });


    it("Should claim in 11th and 16th month ", async function () {
        await increaseTime(10);
        await distributor.claimLiquidityExchangesMM();
        let balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(10));
        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(5);

        await distributor.claimLiquidityExchangesMM();
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(15));

        await increaseTime(30);
        await distributor.claimLiquidityExchangesMM();
        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("50000000"));
    });

    it("Should claim every month to test if user gets it right ", async function () {

        await increaseTime(1);

        await distributor.claimLiquidityExchangesMM();
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333"));

        await increaseTime(1);
        await distributor.claimLiquidityExchangesMM();
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(2));

        await increaseTime(1);
        await distributor.claimLiquidityExchangesMM();
        balance = await distributor.totalClaimedLiquidityExchangesMM();

        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(3));
        
        await increaseTime(1);

        await distributor.claimLiquidityExchangesMM();
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(4));

        await increaseTime(3);
        await distributor.claimLiquidityExchangesMM();
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(7));
        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(3);
        await distributor.claimLiquidityExchangesMM();
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("15000000") + ethers.parseEther("1458333")* BigInt(10));
        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");
        
        
        await increaseTime(100)
        await distributor.claimLiquidityExchangesMM();
        balance = await distributor.totalClaimedLiquidityExchangesMM();
        expect(balance).to.equal(ethers.parseEther("50000000"));
        await expect(distributor.claimLiquidityExchangesMM()).to.be.revertedWith("claimable amount is 0");

    });

});
