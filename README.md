# token-transfer

https://white-sand-01706a003.4.azurestaticapps.net


TODO:
* extract base BroadcastDB adapter from ObservableDB and remove @cmmn/cell from sw dependency list
* support all popular wallets, not only metamask (WallectConnect depends on ethers-5 and is huge)
* add link to uniswap to buy tokens
* add hystogram of fees for flexible choose fee
* calculate probability if transaction not to be mined for 5 minutes depending on feePerGas
* add send max value option
* add include fee in amount option
* add translation and language chooser

Features:

* network scan in service worker for gas price estimation and check replaced transactions in one place, not in every tab
* transfer-to-me link and QR
* tabs synchronization