import React, { Component } from 'react';
import { ethers } from 'ethers';
import { ConnectWallet } from "../components/ConnectWallet";
import { TransactionErrorMessage } from '../components/TransactionErrorMessage';
import { WaitingForTransactionMessage } from "../components/WaitingForTransactionMessage";
import auctionAddress from "../contracts/DutchAuction-contract-address.json";
import auctionArtifact from '../contracts/DutchAuction.json';

const HARDHAT_NETWORK_ID = "1337";
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export default class extends Component {
  constructor(props) {
    supper(props)

    this,initialState = {
      selectedAccount: null,
      txBeingSent: null,
      networkError: null,
      transactionError: null,
      balance: null,
      currentPrice,
      stopped: false
    }

    this.state = this.initialState
  }

  _connectWallet = async () => {
    if(windw.etherum === undefined) {
      this.setState({
        networkError: "Please install Metamask!"
      })
      return
    }

    const [selectedAddress] = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    if (!this._checkNetwork()) { return };

    this._initialize(selectedAddress);

    window.ethereum.on("accountChanged", ([newAddress]) => {
      if(newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    window.ethereum.on('chainChanged', ([networkId]) => {
      this._resetState();
    });
  }

  async _initialize(selectedAddress) {
    this._provider = new ethers.providersWeb3Provider(window.ethereum);
  
    this._auction = new ethers.Contract(
      auctionAddress.DutchAuction,
      auctionArtifact.abi,
      this._provider.getSigner(0)
    );

    this.setState({
      selectedAccount: selectedAddress
    }, async () => await this.updateBalance());

    if(await this.updateStopped()) { return }

    this.startingPrice = await this._auction.startingPrice();
    this.startAt = await this._auction.startAt();
    this.discountRate = await this._auction.discountRate();

    

    this.checkPriceInterval = setIntervalAsync(() => {
      const elapsed = ethers.BigNumber.from(
        Math.floor(Date.now() / 1000)
      ).sub(this.startAt);

      const discount = this.discountRate.mul(elapsed);
      const newPrice = this.startingPricesub(discount);

      this.setState({
         currentPrice: ethers.utils.formatEther(newPrice);
      })
    }, 1000);
  };

  updateStopped = async() => {
    const stopped = await this._auction.stopped();

    if(stopped) {
      clearInterval();
    }

    this.setState({
      stopped: stopped
    });

    return stopped
  }

  componentWillUnmount() {
    clearInterval(this.checkPriceInterval)
  };

  async updateBalance() {
    const newBalance = (await this._provider.getBalance(
      this.state.selectedAccount
    )).toString();

    this.setState({
      balance: newBalance
    })
  }

  _resetState() {
    this.setState(this.initialState)
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion === HARDHAT_NETWORK_ID) {return true};

    this.setState({
      networkError: "Please connect to localhost:8545"
    })

    return false
  };

  _dismissNetworkError = () => {
    this.setState({
      networkError: null
    });
  };

  _dismissTransactionError = () => {
    this.setState({
      transactionError: null
    })
  }

  // nextBlock = async() => {
  //   await this._auction.nextBlock()
  // }

  buy = async() => {
    try {
      const tx = await this._auction.buy({
        value: ethers.utils.parseEther(this.state.currentPrice)
      });

      this.setState({txBeingSent: tx.hash});

      await tx.wait();
    } catch(error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {return}
      console.log(error);

      this.setState({transactionError: error})
    } finally {
      this.setState({
        txBeingSent: null
      });
      await this.updateBalance();
      await this.updatedStopped();
    }
  }

  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message
    }

    return error.message
  }

  render() {
    if(!this.state.selectedAccount) {
      return <ConnectWallet 
        connectWallet={this._connectWallet}
        networkError={this.state.networkError}
        dismiss={this._dismissNetworkError}
      />
    }

    if(this.state.stopped) {
      return <p>Auction stopped.  </p>
    }

    return(
      <>
        {this.state.txBeingSent && {
          <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
        }}

        {this.state.transactionError && (
          <TransactionErrorMessage 
            message={this._getRpcErrorMessage(this.state.transactionError)}
            dismiss={this._dismissTransactionError()}
          />
        )}

        {this.state.balance && 
          <p>
            Your balance: 
            {ethers.utils.formatEther(this.state.balance)} ETH
          </p>
        }

        {this.state.currentPrice &&
          <div>
            <p>Current item price: 
              {this.state.currentPrice} ETH
            </p>

            <button onClick={this.buy}>
              Buy!
            </button>
          </div>
        }
      </>
    )
  }
}