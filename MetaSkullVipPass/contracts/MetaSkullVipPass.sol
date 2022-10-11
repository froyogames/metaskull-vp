// SPDX-License-Identifier: MIT

/************************************************************************************************************************************************************************

 __       __  ________ ________ ______    ______   __    __  __    __  __        __              __     __  ______  _______         _______    ______    ______   ______  
/  \     /  |/        /        /      \  /      \ /  |  /  |/  |  /  |/  |      /  |            /  |   /  |/      |/       \       /       \  /      \  /      \ /      \ 
$$  \   /$$ |$$$$$$$$/$$$$$$$$/$$$$$$  |/$$$$$$  |$$ | /$$/ $$ |  $$ |$$ |      $$ |            $$ |   $$ |$$$$$$/ $$$$$$$  |      $$$$$$$  |/$$$$$$  |/$$$$$$  /$$$$$$  |
$$$  \ /$$$ |$$ |__      $$ | $$ |__$$ |$$ \__$$/ $$ |/$$/  $$ |  $$ |$$ |      $$ |            $$ |   $$ |  $$ |  $$ |__$$ |      $$ |__$$ |$$ |__$$ |$$ \__$$/$$ \__$$/ 
$$$$  /$$$$ |$$    |     $$ | $$    $$ |$$      \ $$  $$<   $$ |  $$ |$$ |      $$ |            $$  \ /$$/   $$ |  $$    $$/       $$    $$/ $$    $$ |$$      \$$      \ 
$$ $$ $$/$$ |$$$$$/      $$ | $$$$$$$$ | $$$$$$  |$$$$$  \  $$ |  $$ |$$ |      $$ |             $$  /$$/    $$ |  $$$$$$$/        $$$$$$$/  $$$$$$$$ | $$$$$$  |$$$$$$  |
$$ |$$$/ $$ |$$ |_____   $$ | $$ |  $$ |/  \__$$ |$$ |$$  \ $$ \__$$ |$$ |_____ $$ |_____         $$ $$/    _$$ |_ $$ |            $$ |      $$ |  $$ |/  \__$$ /  \__$$ |
$$ | $/  $$ |$$       |  $$ | $$ |  $$ |$$    $$/ $$ | $$  |$$    $$/ $$       |$$       |         $$$/    / $$   |$$ |            $$ |      $$ |  $$ |$$    $$/$$    $$/ 
$$/      $$/ $$$$$$$$/   $$/  $$/   $$/  $$$$$$/  $$/   $$/  $$$$$$/  $$$$$$$$/ $$$$$$$$/           $/     $$$$$$/ $$/             $$/       $$/   $$/  $$$$$$/  $$$$$$/  
*************************************************************************************************************************************************************************/
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

contract MetaSkullVipPass is ERC1155, Ownable, Pausable, ERC1155Supply, ERC1155Burnable {
    uint256 public _currentSupply = 0;
    uint256 public _maxSupply = 300;
    uint256 public _mintPrice  = 0.15 ether;
    uint256 constant public _maxTokenPerOwner = 1;
    string private _baseUri;
    string public _name;
    string public _symbol;
    bool public _publicSaleIsOpen = false;
    mapping(address => bool) public vip;
    mapping(address => bool) public minted;

    event SetPublicSaleBool(bool _publicSale);
    event Withdraw(uint256 _balance);
    event SetMintPrice(uint256 _mintPrice);

    constructor() ERC1155("") {
        _name = "MetaSkull VIP Pass";
        _symbol = "MVP";
    }

    //Owner Functions//
    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }

    function getURI() external view virtual onlyOwner returns(string memory) {
        return uri(1);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function setPublicSaleBool(bool publicSale) external onlyOwner {
        _publicSaleIsOpen = publicSale;
        emit SetPublicSaleBool(publicSale);
    }

    function getPublicSaleBool() external view virtual onlyOwner returns (bool) {
    return _publicSaleIsOpen;
    }

    function ownerMint(address to, uint256 amount) external onlyOwner{
        if(_currentSupply + amount > _maxSupply) revert ("Mint Exceed Max Supply");
        if(amount <= 0) revert ("Cannot mint 0 tokens");
        _mint(to, 1, amount, "");
        _currentSupply += amount;
    }

    function withdraw() external onlyOwner{
        uint256 balance = address(this).balance;
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
        emit Withdraw(balance);
    }

    function setMaxSupply(uint256 maxSupply) external onlyOwner{
        _maxSupply = maxSupply;
    }

    //Input units is in wei
    //Example of setting mint price to 0.1ETH: setMintPrice(100000000000000000)
    function setMintPrice(uint256 mintPrice) external onlyOwner{
        _mintPrice = mintPrice;
        emit SetMintPrice(_mintPrice);
    }

    //Minter Functions//
    //tokenID should be always be 1 since there are only 1 type of VIP Pass
    function mint(uint256 amount) external payable {
        if(!_publicSaleIsOpen) revert ("Public Sale Is not live yet");
        if(_currentSupply + amount > _maxSupply) revert ("Mint Exceed Max Supply");
        if(minted[msg.sender] == true) revert ("Address already minted 1 token");
        if(this.balanceOf(msg.sender, 1) >= _maxTokenPerOwner) revert ("Address already owned a token");
        if(amount <= 0) revert ("Cannot mint 0 tokens");
        if(amount > _maxTokenPerOwner){
            string memory _exceedMaxMint = string(abi.encodePacked("Maximum ", Strings.toString(_maxTokenPerOwner), " mint per wallet"));
            revert(_exceedMaxMint);
        }
        if(msg.value != amount*_mintPrice) revert ("Payment amount not correct");

        //Change second parameter(tokenID) to 1 because only 1 type of VIP Pass exist
        _mint(msg.sender, 1, amount, "");
        minted[msg.sender] = true;
        _currentSupply += amount;
    }

    //Public Functions//
    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        whenNotPaused
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function getMaxSupply() external view virtual returns (uint256) {
        return _maxSupply;
    }

    function getName() external view virtual returns (string memory) {
        return _name;
    }

    function getSymbol() external view virtual returns (string memory) {
        return _symbol;
    }

    function getMintPrice() external view virtual returns (uint256) {
        return _mintPrice;
    }

    function burnToken(uint256 amount) external returns (bool) {
    if(!isApprovedForAll(msg.sender, address(this)))
        setApprovalForAll(address(this), true);

    if(amount <= 0) revert("Cannot burn 0 tokens");

    super.burn(msg.sender, 1, amount);
    vip[msg.sender] = true;
    _currentSupply -= amount;
    return vip[msg.sender];
    }

    function burnToken(address who, uint256 amount) external returns (bool) {
    if(this.balanceOf(who, 1) == 0) revert ("You dont own any VIP Pass!");
    if(!isApprovedForAll(who, msg.sender)) revert("You need to approve collection first!");

    if(amount <= 0) revert("Cannot burn 0 tokens");

    super.burn(who, 1, amount);
    vip[who] = true;
    _currentSupply -= amount;
    return vip[who];
    }

    function getVIPList(address who) external view virtual returns (bool) {
        return vip[who];
    }

    function getMintedList(address who) external view virtual returns (bool) {
        return minted[who];
    }

}