// SPDX-License-Identifier: MIT

/*****************************************************************************************
 __       __  ________ ________ ______    ______   __    __  __    __  __        __       
/  \     /  |/        /        /      \  /      \ /  |  /  |/  |  /  |/  |      /  |       
$$  \   /$$ |$$$$$$$$/$$$$$$$$/$$$$$$  |/$$$$$$  |$$ | /$$/ $$ |  $$ |$$ |      $$ |       
$$$  \ /$$$ |$$ |__      $$ | $$ |__$$ |$$ \__$$/ $$ |/$$/  $$ |  $$ |$$ |      $$ |       
$$$$  /$$$$ |$$    |     $$ | $$    $$ |$$      \ $$  $$<   $$ |  $$ |$$ |      $$ |       
$$ $$ $$/$$ |$$$$$/      $$ | $$$$$$$$ | $$$$$$  |$$$$$  \  $$ |  $$ |$$ |      $$ |        
$$ |$$$/ $$ |$$ |_____   $$ | $$ |  $$ |/  \__$$ |$$ |$$  \ $$ \__$$ |$$ |_____ $$ |_____  
$$ | $/  $$ |$$       |  $$ | $$ |  $$ |$$    $$/ $$ | $$  |$$    $$/ $$       |$$       | 
$$/      $$/ $$$$$$$$/   $$/  $$/   $$/  $$$$$$/  $$/   $$/  $$$$$$/  $$$$$$$$/ $$$$$$$$/  
******************************************************************************************/

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

interface vipPass {
    function burnToken(address who, uint256 amount) external returns (bool);
    function getVIPList(address who) external returns (bool);
}

contract MetaSkull is IERC721A, Ownable, ERC721A{

    string public _name;
    string public _symbol;
    string public _baseTokenUri;
    uint256 public _maxSupply = 1001;
    uint256 public _initialSupply = 0;
    uint256 public _batchMaxSupply = 1001;
    uint256 public _whitelistSupply = 300;
    uint256 public _maxWhitelistMint = 1;
    uint256 public _maxPublicMint = 1;
    //Need to set to 100 eth before during deployment
    //After deployment, need to set to correct mint price
    uint256 public _publicMintPrice = 100 ether;
    uint256 public _whitelistMintPrice = 100 ether;
    bool public _publicSaleIsOpen = false;
    bool public _whitelistSaleIsOpen = false;
    //need to change to correct vipPass address after deploy
    address public _vipPassAddress = 0x0000000000000000000000000000000000000000;
    mapping(address => bool) public _passOwner;
    mapping(address => uint256) public totalPublicMint;
    mapping(address => uint256) public totalWhitelistMint;

    //Events
    event SetPublicSaleBool(bool _publicSale);
    event SetWhitelistSaleBool(bool _whitelistSale);
    event Withdraw(uint256 _balance);
    event SetPublicMintPrice(uint256 _mintPrice);
    event SetWhitelistMintPrice(uint256 _mintPrice);

    constructor() ERC721A("MetaSkull", "MS") {
        _name = "MetaSkull";
        _symbol = "MS";
    }

    modifier callerIsUser() {
        require(tx.origin == msg.sender, "Cannot be called by a contract");
        _;
    }

    //Owner Functions
    function withdraw() external onlyOwner{
        uint256 balance = address(this).balance;
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
        emit Withdraw(balance);
    }

    function setBaseTokenURI(string memory baseURI_) external onlyOwner {
        _baseTokenUri = baseURI_;
    }

    //Must set whitelist sale to be false before starting public sale
    function setPublicSaleBool(bool publicSale) external onlyOwner {
        if(publicSale)
            _whitelistSaleIsOpen = false;
        _initialSupply = totalSupply();
        _publicSaleIsOpen = publicSale;
        emit SetPublicSaleBool(publicSale);
    }

    //Must set public sale to be false before starting whitelist sale
    function setWhitelistSaleBool(bool whitelistSale) external onlyOwner {
        if(whitelistSale)
            _publicSaleIsOpen = false;
        _whitelistSaleIsOpen = whitelistSale;
        emit SetWhitelistSaleBool(whitelistSale);
    }

    function setBatchMaxSupply(uint256 batchMaxSupply) external onlyOwner {
        if(batchMaxSupply > _maxSupply) revert("Batch supply exceed collection supply!");
        _batchMaxSupply = batchMaxSupply;
    }

    function ownerMint(address who, uint256 amount) external onlyOwner {
        uint256 totalSupply = totalSupply();
        if(totalSupply == _maxSupply) revert ("Collection minted out!");
        if(totalSupply + amount > _maxSupply) revert ("Mint Exceed Max Supply!");
        if(amount <= 0) revert ("Cannot mint 0 tokens!");

        safeMint(who, amount);
    }

    function setWhitelistSupply(uint256 whitelistSupply) external onlyOwner{
        _whitelistSupply = whitelistSupply;
    }

    function setMaxSupply(uint256 maxSupply) external onlyOwner {
        require(totalSupply() < maxSupply, "Max Supply must be larger than total supply");
        _maxSupply = maxSupply;
    }

    //Input unit is in wei
    //Example of setting mint price to 0.1ETH: setMintPrice(100000000000000000)
    function setPublicMintPrice(uint256 mintPrice) external onlyOwner{
        _publicMintPrice = mintPrice;
        emit SetPublicMintPrice(_publicMintPrice);
    }
    
    //Input unit is in wei
    //Example of setting mint price to 0.1ETH: setMintPrice(100000000000000000)
    function setWhitelistMintPrice(uint256 mintPrice) external onlyOwner{
        _whitelistMintPrice = mintPrice;
        emit SetWhitelistMintPrice(_whitelistMintPrice);
    }

    function setMaxWhitelistMint(uint256 maxWhitelistMint) external onlyOwner{
        _maxWhitelistMint = maxWhitelistMint;
    }

    function setMaxPublicMint(uint256 maxPublicMint) external onlyOwner{
        _maxPublicMint = maxPublicMint;
    }

    function setVipPassAddress(address vipPassAddress) external onlyOwner{
        _vipPassAddress = vipPassAddress;
    }

    //Minter Functions
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721A, IERC721A)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    //Public Sale Phase
    function mint(uint256 amount) external payable callerIsUser{
        uint256 totalSupply = totalSupply();
        if(!_publicSaleIsOpen) revert ("Public Sale Is not live!");
        if(totalSupply == _maxSupply) revert ("Collection minted out!");
        if(totalSupply + amount > _maxSupply) revert ("Mint Exceed Max Supply!");
        if(totalPublicMint[msg.sender] >= _maxPublicMint) revert ("Already minted maximum amount!");//Set limit to total supply
        if(totalSupply >= (_initialSupply + _batchMaxSupply)) revert ("Minted out for current batch!"); //Feature only available for public sale
        if((totalSupply + amount) > (_initialSupply + _batchMaxSupply)) revert ("Cannot mint more than current batch supply!");
        if(amount <= 0) revert ("Cannot mint 0 tokens!");
        if(msg.value != amount*_publicMintPrice) revert ("Payment amount not correct!");

        totalPublicMint[msg.sender] += amount;
        safeMint(msg.sender, amount);
    }

    //Whitelist Sale Phase
    function whitelistMint(uint256 amount) external payable callerIsUser {
        uint256 totalSupply = totalSupply();
        if(!_whitelistSaleIsOpen) revert ("Whitelist sale is not live!");
        if(totalSupply == _whitelistSupply) revert ("Whitelist allocated collection minted out!");
        if(totalSupply + amount > _whitelistSupply) revert ("Mint Exceed Allocated Whitelist Supply!");
        if(totalWhitelistMint[msg.sender] >= _maxWhitelistMint) revert ("Cannot mint beyond whitelist max mint!");//supposed to be 1 only
        if(amount <= 0) revert ("Cannot mint 0 tokens!");
        if(msg.value != amount*_whitelistMintPrice) revert ("Payment amount not correct!");
        if(amount > _maxWhitelistMint){
            string memory _exceedMaxMint = string(abi.encodePacked("Maximum ", Strings.toString(_maxWhitelistMint), " mint per wallet"));
            revert(_exceedMaxMint);
        }
        _passOwner[msg.sender] = vipPass(_vipPassAddress).getVIPList(msg.sender);
        if(!_passOwner[msg.sender])
            vipPass(_vipPassAddress).burnToken(msg.sender, amount);
        totalWhitelistMint[msg.sender] += amount;
        safeMint(msg.sender, amount);
    }
    
    //Public Functions
    //Returns the tokenID owned by the given address
    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory ownedTokenIds = new uint256[](ownerTokenCount);
        uint256 currentTokenId = 0;
        uint256 ownedTokenIndex = 0;

        while (ownedTokenIndex < ownerTokenCount && currentTokenId <= _maxSupply) {
        address currentTokenOwner = ownerOf(currentTokenId);

        if (currentTokenOwner == _owner) {
            ownedTokenIds[ownedTokenIndex] = currentTokenId+1;

            ownedTokenIndex++;
        }

        currentTokenId++;
        }

        return ownedTokenIds;
    }

    function tokenURI(uint256 tokenId) public view override(ERC721A, IERC721A) returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        uint256 trueId = tokenId + 1;

        return bytes(_baseTokenUri).length > 0 ? string(abi.encodePacked(_baseTokenUri, Strings.toString(trueId))) : "";
    }

    function getCurrentSupply() external view returns (uint256) {
        return totalSupply();
    }

    function getName() external view returns (string memory) {
        return _name;
    }

    function getSymbol() external view returns (string memory) {
        return _symbol;
    }

    function getMaxSupply() external view returns (uint256) {
        return _maxSupply;
    }

    function getPublicMintPrice() external view returns (uint256) {
        return _publicMintPrice;
    }

    function getWhitelistMintPrice() external view returns (uint256) {
        return _whitelistMintPrice;
    }

    function getBatchMaxSupply() external view returns (uint256) {
        return _batchMaxSupply;
    }

    function getWhitelistSaleBool() external view returns (bool) {
        return _whitelistSaleIsOpen;
    }

    function getPublicSaleBool() external view returns (bool) {
        return _publicSaleIsOpen;
    }

    //Private Funtions
    function safeMint(address to, uint256 tokenId) private {
        _safeMint(to, tokenId);
    }
    
}
