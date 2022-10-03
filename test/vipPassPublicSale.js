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

describe("Public Sale Phase", function(){
    //public trying to mint
    it("Public Sale Bool should be true", async function () {
      const {vipPass} = await loadFixture(deployFixture);
      await vipPass.setPublicSaleBool(true);
  
      expect(await vipPass.getPublicSaleBool()).to.equal(true);
    })
  
    it("Should not be able to mint when public sale is not live", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
  
      await expect(vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Public Sale Is not live yet");
    })

    it("Should not be able to mint if they already owned a token", async function () {
      const {vipPass, owner, otherAccount} = await loadFixture(deployFixture);
      await vipPass.setPublicSaleBool(true);
      await vipPass.ownerMint(otherAccount.address, 1);
  
      await expect(vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Address already owned a token");
    })

    it("Should not be able to mint if they already minted a token", async function () {
      const {vipPass, owner, otherAccount} = await loadFixture(deployFixture);
      await vipPass.setPublicSaleBool(true);
      await vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")});
      await vipPass.connect(otherAccount).burnToken(1);
  
      await expect(vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Address already minted 1 token");
    })
  
    it("Should not be able to mint more than max supply", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      await vipPass.setPublicSaleBool(true);
      await vipPass.setMaxSupply(1);
      vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")});
      
      await expect(vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Mint Exceed Max Supply");
    })
  
    it("Should not be able to mint 0 tokens", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      await vipPass.setPublicSaleBool(true);
  
      await expect(vipPass.connect(otherAccount).mint(0, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Cannot mint 0 tokens");
    })
  
    it("Should be able to mint", async function() {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      const amount = 1;
      await vipPass.setPublicSaleBool(true);
      await vipPass.connect(otherAccount).mint(amount, {value: ethers.utils.parseUnits("0.15", "ether")})
      await expect(await vipPass.balanceOf(otherAccount.address,1)).to.be.equal(amount);
    })

    it("Should not cost more than mint price + gas fee", async function () {
      const {vipPass, otherAccount} = await loadFixture(deployFixture);
      await vipPass.setPublicSaleBool(true);
      const ethBalance =await otherAccount.getBalance();
      const tnx = await vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")});
      const receipt = await tnx.wait();  
      const transactionFee = ethers.BigNumber.from(receipt.cumulativeGasUsed).mul(ethers.BigNumber.from(receipt.effectiveGasPrice));

      expect(ethers.BigNumber.from(await otherAccount.getBalance())).to.be.equal(ethers.BigNumber.from(ethBalance).sub(ethers.BigNumber.from("150000000000000000")).sub(transactionFee));
    })
  
})