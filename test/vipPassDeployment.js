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