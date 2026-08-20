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
    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded;
    address public immutable i_owner;
    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "sender is not owner!");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _; // function body
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        // require(msg.value.getConversionRate() >= MIN_USD, "Didn't send enough!");
        if (msg.value.getConversionRate(s_priceFeed) < MIN_USD)
            revert FundMe__NotSentEnough();
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        address[] memory m_funders = s_funders;
        for (uint256 index = 0; index < m_funders.length; index++) {
            address funder = m_funders[index];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        if (!callSuccess) revert FundMe__WithdrawFailed();
    }

    function getPrice(uint256 amount) public view returns (uint256) {
        return amount.getConversionRate(s_priceFeed);
    }
}
