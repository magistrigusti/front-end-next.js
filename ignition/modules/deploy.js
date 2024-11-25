const hre = require('hardhat');
const ethers = hre.ethers;
const fs = require('fs');
const path = require('path');

async function main() {
  if (network.name === 'hardhat') {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which" +
      "gets automatically created and destroyed every time. Use the Hardhat" +
      "option '--network localhost'"
    );
  }

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with", await deployer.getAddress());

  const DutchAuction = await ethers.getContractFactory("DutchAuction", deployer);
  const auction = await DutchAuction.deploy();
  await auction.deployed();
}