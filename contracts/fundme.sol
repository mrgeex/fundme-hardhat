// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import {PriceConvertor} from "./priceConvertor.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error NotSentEnough();
error NotOwner();
error WithdrawFailed();

contract FundMe {
    using PriceConvertor for uint256;

    uint constant MIN_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public immutable i_owner;
    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        // require(msg.value.getConversionRate() >= MIN_USD, "Didn't send enough!");
        if (msg.value.getConversionRate(priceFeed) < MIN_USD)
            revert NotSentEnough();
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 index = 0; index < funders.length; index++) {
            address funder = funders[index];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);

        // 3 different ways to send eth from a contract: transfer/send/call
        // transfer -> automatically reverts (2300 gas)
        // payable(msg.sender).transfer(address(this).balance);

        // send -> returns boolean, no revert (2300 gas)
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed!");

        // call -> returns boolean, no revert (2300 gas)
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        // require(callSuccess, "call failed!");
        if (!callSuccess) revert WithdrawFailed();
    }

    function getPrice(uint256 amount) public view returns (uint256) {
        return amount.getConversionRate(priceFeed);
    }

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "sender is not owner!");
        if (msg.sender != i_owner) revert NotOwner();
        _; // function body
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}
