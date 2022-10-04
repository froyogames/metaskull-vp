# MetaSkull VIP Pass

MetaSkull VIP Pass is a collection of ERC1155 NFT that allows owners to participate in future project's pre-sale.

## Deployment Steps
1. Deploy Contract
2. Set token URI using
```java
setURI("Insert Token URI here")
```
3. To start public sale phase, set 
```java
setPublicSaleBool(true)
```

## Notes
1. To stop public sale phase, set
```java
setPublicSaleBool(false)
```
2. To pause or resume minting process
```java
pause()
unpause()
```
3. Max token supply was defaulted to 300, as per the variable
```java
uint256 public _maxSupply = 300;
```
4. Default mint price was set to 0.15ETH, as per the variable
```java
uint256 public _mintPrice  = 0.15 ether;
```
Owner can set mint price by setting the desired mint price(wei) using the function below
```java
setMintPrice(Input Mint Price Here)
```
5. The maximum number of tokens mintable by an address is defaulted to 1, as per variable 
```java
uint256 constant public _maxTokenPerOwner = 1;
```
6. Address that minted a token or owns a token are not eligible to mint