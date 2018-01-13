# treasury ui

A simple web app to work with a deployed Treasury smart contract on the
Ethereum network.

The app is constructed with CSS and Javascript to facilitate "skinning" the
interface and internationalising it.

## Requirements

A connection to Ethereum network must be listening on localhost port 8545. This
could be *testrpc* or *geth* or whatever.

Since using the UI may result in spending real money, the UI does not unlock
accounts. The user must unlock the account(s) separately.

## Usage

Simply run the executable from the command line or make a desktop shortcut

## Dev Setup

* Download SDK version of NW.js from [NW.js](https://nwjs.io)
* Extract the tarball and put the directory with the nw executable in your PATH
* cd to the treasury/ui directory
* Download and save the raw web3.min.js file from the dist subdirectory under
  [ethereum/web3.js](https://github.com/ethereum/web3.js)
* Run: `$ nw .`

## Reuse

* contains reused/adapted code from [w3schools.com](https://www.w3schools.com/howto/howto_js_tabs.asp)
* distro contains a copy of web3.min.js from [ethereum/web3.js](https://github.com/ethereum/web3.js/)

> This file is part of web3.js.
>
> web3.js is free software: you can redistribute it and/or modify
> it under the terms of the GNU Lesser General Public License as published by
> the Free Software Foundation, either version 3 of the License, or
> (at your option) any later version.
> 
> web3.js is distributed in the hope that it will be useful,
> but WITHOUT ANY WARRANTY; without even the implied warranty of
> MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
> GNU Lesser General Public License for more details.
>
> You should have received a copy of the GNU Lesser General Public License
> along with web3.js. If not, see <http://www.gnu.org/licenses/>.

