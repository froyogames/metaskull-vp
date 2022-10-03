// import { expect } from "chai";
// import hre, { ethers } from "hardhat";
// import "@nomiclabs/hardhat-ethers";
// import "@nomicfoundation/hardhat-wafle";

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

//Deployment tests
describe("Deploy", function(){
  it("Should set the right owner", async function () {
    const {vipPass, owner} = await loadFixture(deployFixture);
    
    expect(await vipPass.owner()).to.equal(owner.address);
  });

  it("Name should be MetaSkull VIP Pass", async function () {
    const {vipPass, owner} = await loadFixture(deployFixture);
    const name = await vipPass.getName();
    expect(name).to.equal("MetaSkull VIP Pass");
    });
  
    it("Symbol should be MVP", async function() {
      const {vipPass} = await loadFixture(deployFixture);
      const symbol = await vipPass.getSymbol();
      expect(symbol).to.equal("MVP");
    });
    
    it("Should get the correct Max supply", async function() {
      const {vipPass} = await loadFixture(deployFixture);
      const maxSupply = await vipPass.getMaxSupply();
      expect(maxSupply).to.equal(300);
    });
  
})

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
    expect(await vipPass.ownerMint(otherAccount.address, amount)).to.be.reverted;
  })

  it("Owner should be able to mint at any phase when mint is resumed", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    const amount = 1;
    await vipPass.pause();
    await vipPass.unpause();
    await vipPass.ownerMint(otherAccount.address, amount);
    expect(await vipPass.balanceOf(otherAccount.address,1)).to.be.equal(amount);
  })

  it("Owner should be able to mint at any phase when mint is not paused", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    const amount = 1;
    await vipPass.ownerMint(otherAccount.address, amount);
    expect(await vipPass.balanceOf(otherAccount.address,1)).to.be.equal(amount);
  })

  it("Owner should not be able to mint when current supply > Max Supply", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    const amount = 3;
    await vipPass.setMaxSupply(2)

    expect(await vipPass.ownerMint(otherAccount.address, amount)).to.be.revertedWith("Mint Exceed Max Supply");
  })

  it("Should set correct URI", async function () {
    const {vipPass} = await loadFixture(deployFixture);
    const testURI = "TEST_URI";
    await vipPass.setURI(testURI);

    expect(await vipPass.getURI()).to.be.equal(testURI);
  })

  it("Owner should not be able to withdraw 0 ETH", async function () {
    const {vipPass} = await loadFixture(deployFixture);
    
    expect(await vipPass.withdraw()).to.be.revertedWith("Balance is 0");
  })

  it("Only Owner can withdraw", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    
    expect(await vipPass.connect(otherAccount).withdraw()).to.be.reverted;
  })

  it("Owner should be able to withdraw Funds", async function () {
    const {vipPass, owner, otherAccount} = await loadFixture(deployFixture);
    const amount = 1;
    await vipPass.setPublicSaleBool(true);
    await vipPass.addMinter(otherAccount.address);
    await vipPass.connect(otherAccount).mint(amount, {value: ethers.utils.parseUnits("0.15", "ether")})
    
    const ownerBalance = await owner.getBalance();
    const tnxHash = await vipPass.withdraw();
    const gasPrice = await ethers.provider.getGasPrice()
    const transactionFee = gasPrice.mul(tnxHash.gasUsed)
    await expect(ethers.BigNumber.from(await owner.getBalance())).to.be.within(ethers.BigNumber.from(ownerBalance).add(ethers.BigNumber.from("150000000000000000")).sub(ethers.BigNumber.from(transactionFee)), ethers.BigNumber.from(ownerBalance).add(ethers.BigNumber.from("150000000000000000")));
  })

  it("Should return correct mint price", async function () {
  const {vipPass, owner, otherAccount} = await loadFixture(deployFixture);
  await vipPass.setMintPrice(ethers.utils.parseUnits("0.1", "ether"));
  console.log(await vipPass.getMintPrice());
  console.log(ethers.utils.parseUnits("0.1", "ether"));
  await expect(await vipPass.getMintPrice()).to.be.equal(ethers.utils.parseUnits("0.1", "ether"));
})
})

describe("Public Sale Phase", function(){
  //public trying to mint
  it("Public Sale Bool should be true", async function () {
    const {vipPass} = await loadFixture(deployFixture);
    await vipPass.setPublicSaleBool(true);

    expect(await vipPass.getPublicSaleBool()).to.equal(true);
  })

  it("Should not be able to mint when public sale is not live", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    await vipPass.addMinter(otherAccount.address);

    expect(await vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Public Sale Is not live yet");
  })

  it("Should not be able to mint if address not in minter list", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    await vipPass.setPublicSaleBool(true);
 
    //await vipPass.connect(otherAccount).mint(1);
    // const tokenBalance = await vipPass.balanceOf(otherAccount.address,1);
    // console.log(tokenBalance);
    expect(await vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Address is not in Minter List");
    //await vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")});
  })

  it("Should not be able to mint if they already owned a token", async function () {
    const {vipPass, owner, otherAccount} = await loadFixture(deployFixture);
    await vipPass.setPublicSaleBool(true);
    await vipPass.addMinter(otherAccount.address);
    await vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")});

    expect(await vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Address already owned a token");
  })

  it("Should not be able to mint more than max supply", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    await vipPass.setPublicSaleBool(true);
    await vipPass.addMinter(otherAccount.address);

    expect(await vipPass.connect(otherAccount).mint(1, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Cannot mint 0 tokens");
  })

  it("Should not be able to mint 0 tokens", async function () {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    await vipPass.setPublicSaleBool(true);
    await vipPass.addMinter(otherAccount.address);

    expect(await vipPass.connect(otherAccount).mint(0, {value: ethers.utils.parseUnits("0.15", "ether")})).to.be.revertedWith("Cannot mint 0 tokens");
  })

  it("Should be able to mint", async function() {
    const {vipPass, otherAccount} = await loadFixture(deployFixture);
    const amount = 1;
    await vipPass.setPublicSaleBool(true);
    await vipPass.addMinter(otherAccount.address);
    await vipPass.connect(otherAccount).mint(amount, {value: ethers.utils.parseUnits("0.15", "ether")})
    expect(await vipPass.balanceOf(otherAccount.address,1)).to.be.equal(amount);
  })

})

//Public Functions
describe("Public Functions", function(){
  it("Should return correct current supply", async function () {
  const {vipPass, owner, otherAccount} = await loadFixture(deployFixture);
  const amount = 3;
  await vipPass.ownerMint(otherAccount.address, amount);

  expect(await vipPass.getCurrentSupply()).to.be.equal(await vipPass.totalSupply(1));
  })
})