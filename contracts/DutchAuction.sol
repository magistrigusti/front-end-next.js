// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract DutchAuction {
  uint private constant DURATION = 2 days;
  address payable public immutable seller;
  uint public immutable startingPrice;
  uint public immutable startAt;
  uint public immutable endsAt;
  uint public immutable discountRate;
  string public item;
  bool public stopped;

  constructor(
    uint _startingPrice, 
    uint _discountRate, 
    string memory _item
  ) {
    require(_startingPrice >= discountRate * DURATION, "price too low!");
    seller = payable(msg.sender);
    startingPrice = _startingPrice;
    discountRate = _discountRate;
    startAt = block.timestamp;
    endsAt = block.timestamp + DURATION;
    item = _item;
  }
}