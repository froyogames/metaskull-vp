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

//Public Functions
describe("Public Functions", function(){
    it("Should return correct current supply", async function () {
    const {vipPass, owner, otherAccount} = await loadFixture(deployFixture);
    const amount = 3;
    await vipPass.ownerMint(otherAccount.address, amount);
    
    expect(await vipPass.getCurrentSupply()).to.be.equal(await vipPass.totalSupply(1));
    })

    it("Should burn correct supply", async function () {
        const {vipPass,owner, otherAccount} = await loadFixture(deployFixture);
        await vipPass.setMaxSupply(10);
        await vipPass.ownerMint(otherAccount.address, 10);
        await vipPass.connect(otherAccount).setApprovalForAll(vipPass.address, true);
        await vipPass.connect(otherAccount).burnToken(5);
    
        await expect(await vipPass.balanceOf(otherAccount.address,1)).to.be.equal(5);
        await expect(await vipPass.totalSupply(1)).to.be.equal(5);
    })

    it("Burn should fail,return correct supply, and address will not be included in vip list", async function() {
        const {vipPass,owner, otherAccount} = await loadFixture(deployFixture);
        await vipPass.setMaxSupply(10);
        await vipPass.ownerMint(otherAccount.address, 10);
        await vipPass.connect(otherAccount).setApprovalForAll(vipPass.address, true);

        await expect(vipPass.connect(otherAccount).burnToken(15)).to.be.revertedWith("ERC1155: burn amount exceeds totalSupply");
        await expect(await vipPass.totalSupply(1)).to.be.equal(10);
        await expect(await vipPass.getVIPList(otherAccount.address)).to.equal(false);
    })

    it("Should burn correctly,return correct supply, and address will be included in vip list", async function() {
        const {vipPass,owner, otherAccount} = await loadFixture(deployFixture);
        await vipPass.setMaxSupply(10);
        await vipPass.ownerMint(otherAccount.address, 10);
        await vipPass.connect(otherAccount).setApprovalForAll(vipPass.address, true);
        await vipPass.connect(otherAccount).burnToken(5);

        await expect(await vipPass.totalSupply(1)).to.be.equal(5);
        await expect(await vipPass.getVIPList(otherAccount.address)).to.equal(true);
    })

})