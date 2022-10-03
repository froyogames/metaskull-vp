const { expect } = require("chai");
const {hre, ethers} = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");

async function deployFixture(){
    const Contract = await ethers.getContractFactory("vipPass");
    const contract = await Contract.deploy();
    const vipPass = await contract.deployed();
  
    const [owner, otherAccount] = await ethers.getSigners();
  
    return {vipPass, owner, otherAccount};
};

//Only Owner Functions
describe("Only Owner Functions", function () {
    it("Only owner can set public sale phase", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
  
     await expect(vipPass.connect(otherAccount).setPublicSaleBool(true)).to.be.revertedWith("Ownable: caller is not the owner");
    })
  
    it("Owner should be able to mint at any phase when mint is not paused", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      const amount = 1;
      await vipPass.ownerMint(otherAccount.address, amount);
      expect(await vipPass.balanceOf(otherAccount.address,1)).to.be.equal(amount);
    })
  
    it("Owner should not be able to mint at any phase when mint is paused", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      const amount = 1;
      await vipPass.pause();

      await expect(vipPass.ownerMint(otherAccount.address, amount)).to.be.reverted;
    })
  
    it("Owner should be able to mint at any phase when mint is resumed", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      const amount = 1;
      await vipPass.pause();
      await vipPass.unpause();
      await vipPass.ownerMint(otherAccount.address, amount);

      await expect(await vipPass.balanceOf(otherAccount.address,1)).to.be.equal(amount);
    })
  
    it("Owner should be able to mint at any phase when mint is not paused", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      const amount = 1;
      await vipPass.ownerMint(otherAccount.address, amount);
      await expect(await vipPass.balanceOf(otherAccount.address,1)).to.be.equal(amount);
    })
  
    it("Owner should not be able to mint when current supply > Max Supply", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      const amount = 3;
      await vipPass.setMaxSupply(2)
  
      await expect(vipPass.ownerMint(otherAccount.address, amount)).to.be.revertedWith("Mint Exceed Max Supply");
    })
  
    it("Should set correct URI", async function () {
      const {vipPass} = await loadFixture(deployFixture);
      const testURI = "TEST_URI";
      await vipPass.setURI(testURI);
  
      await expect(await vipPass.getURI()).to.be.equal(testURI);
    })
  
    it("Owner should not be able to withdraw 0 ETH", async function () {
      const {vipPass} = await loadFixture(deployFixture);
      
      await expect(vipPass.withdraw()).to.be.revertedWith("Balance is 0");
    })
  
    it("Only Owner can withdraw", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      
      await expect(vipPass.connect(otherAccount).withdraw()).to.be.reverted;
    })
  
    it("Owner should be able to withdraw Funds", async function () {
      const {vipPass, owner, otherAccount} = await loadFixture(deployFixture);
      const amount = 1;
      await vipPass.setPublicSaleBool(true);
      await vipPass.connect(otherAccount).mint(amount, {value: ethers.utils.parseUnits("0.15", "ether")})
      
      const ownerBalance = await owner.getBalance();
      const tnx = await vipPass.withdraw();
      const receipt = await tnx.wait();
      const gasPrice = await ethers.provider.getGasPrice()
      const transactionFee = ethers.BigNumber.from(receipt.cumulativeGasUsed).mul(ethers.BigNumber.from(receipt.effectiveGasPrice));

      await expect(ethers.BigNumber.from(await owner.getBalance())).to.be.equal(ethers.BigNumber.from(ownerBalance).add(ethers.BigNumber.from("150000000000000000")).sub(transactionFee));
    })
  
    it("Should return correct mint price", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    await vipPass.setMintPrice(ethers.utils.parseUnits("0.1", "ether"));

    await expect(await vipPass.getMintPrice()).to.be.equal(ethers.utils.parseUnits("0.1", "ether"));
     })

     it("Should burn correct supply", async function () {
     const {vipPass,owner, otherAccount} = await loadFixture(deployFixture);
     await vipPass.setMaxSupply(10);
     await vipPass.ownerMint(otherAccount.address, 10);
     await vipPass.connect(otherAccount).setApprovalForAll(vipPass.address, true);
     //console.log(await vipPass.isApprovedForAll(otherAccount.address, vipPass.address))
     await vipPass.connect(otherAccount).burnToken(5);
    //  console.log(await vipPass.totalSupply(1));
    //  console.log(await vipPass.getCurrentSupply());
     await expect(await vipPass.totalSupply(1)).to.be.equal(5);
    })
    
  })