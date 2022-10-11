# MetaSkull

MetaSkull is a collection of 1000 NFTs on the Ethereum Blockchain

## Deployment Steps
1. Deploy MetaSkullVipPass smart contract first
2. Deploy this smart contract
3. Set MetaSkullVipPass contract address using
```java
setVipPassAddress(Insert MetaSkullVipPass address here)
```
4. Set token URI using
```java
setBaseTokenURI("Insert Token URI here")
```
5. To start whitelist sale phase, set 
```java
setWhitelistSaleBool(true)
```

6. To start public sale phase, set 
```java
setPublicSaleBool(true)
```
***PLEASE END WHITELIST MINT PHASE BEFORE STARTING PUBLIC PHASE***

## Notes
1. To stop whitelist sale phase, set
```java
setWhitelistSaleBool(false)
```
2. To stop public sale phase, set
```java
setPublicSaleBool(false)
```
3. Max token supply was defaulted to 1001, as per the variable
```java
uint256 public _maxSupply = 1001
```
4. Set max token supply using
```java
setMaxSupply(Insert Max Supply)
```
5. Max whitelist supply was defaulted to 300, as per the variable
```java
uint256 public _whitelistSupply = 300
```
Set whitelist supply using
```java
setWhitelistSupply(Insert Whitelist Supply)
```
6. Max batch supply was defaulted to 1001, as per the variable
```java
uint256 public _batchMaxSupply = 1001;
```
If not using this feature, just set batch supply to be equal to _maxSupply, Set batch supply supply using
```java
setBatchMaxSupply(Insert batch Supply)
```
i. Batch Supply allows public sale to be executed by batch, for example, owner can set the first public sale batch to consists of 500 mint, then the second batch to be 500 mint, totaling 1000 collections. 

ii. Owner can decide when the batch sale will happen, to start the batch sale, just set the desired batch supply and start public mint phase.

7. Default whitelist and public mint price was set to 100ETH, as per the variable
```java
uint256 public _publicMintPrice = 100 ether
uint256 public _whitelistMintPrice = 100 ether
```
8. Owner can set whitelist and public mint price by setting the desired mint price(wei) using the function below
```java
setWhitelistMintPrice(Input Mint Price Here)
setPublicMintPrice(Input Mint Price Here)
```
9. The maximum number of tokens mintable by an address for whitelist and public phase is defaulted to 1, as per variable 
```java
uint256 public _maxWhitelistMint = 1
uint256 public _maxPublicMint = 1
```