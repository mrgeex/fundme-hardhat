// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.7;

import {PriceConvertor} from "./priceConvertor.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

error FundMe__NotSentEnough();
error FundMe__NotOwner();
error FundMe__WithdrawFailed();

/**
 * @title A crowd funding contract
 * @author Mr. Geex
 * @notice Just another sample crowd funding contract
 * @dev Price feeds are used as our library
 */
contract FundMe {
    using PriceConvertor for uint256;

    uint constant MIN_USD = 50 * 1e18;
    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;
    address public immutable i_owner;
    AggregatorV3Interface public priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "sender is not owner!");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _; // function body
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        // require(msg.value.getConversionRate() >= MIN_USD, "Didn't send enough!");
        if (msg.value.getConversionRate(priceFeed) < MIN_USD)
            revert FundMe__NotSentEnough();
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 index = 0; index < funders.length; index++) {
            address funder = funders[index];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!callSuccess) revert FundMe__WithdrawFailed();
    }

    function getPrice(uint256 amount) public view returns (uint256) {
        return amount.getConversionRate(priceFeed);
    }
}
