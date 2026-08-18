// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface AggregatorV3Interface {
    event AnswerUpdated(
        int256 indexed current,
        uint256 indexed roundId,
        uint256 updatedAt
    );

    event NewRound(
        uint256 indexed roundId,
        address indexed startedBy,
        uint256 startedAt
    );

    event OwnershipTransferRequested(
        address indexed from,
        address indexed to
    );

    event OwnershipTransferred(
        address indexed from,
        address indexed to
    );

    function owner() external view returns (address);

    function transferOwnership(address to) external;

    function acceptOwnership() external;

    function accessController() external view returns (address);

    function setController(address newAccessController) external;

    function aggregator() external view returns (address);

    function proposedAggregator() external view returns (address);

    function phaseAggregators(uint16 phase) external view returns (address);

    function phaseId() external view returns (uint16);

    function proposeAggregator(address newAggregator) external;

    function confirmAggregator(address newAggregator) external;

    function decimals() external view returns (uint8);

    function description() external view returns (string memory);

    function version() external view returns (uint256);

    function latestAnswer() external view returns (int256);

    function latestTimestamp() external view returns (uint256);

    function latestRound() external view returns (uint256);

    function getAnswer(uint256 roundId) external view returns (int256);

    function getTimestamp(uint256 roundId) external view returns (uint256);

    function getRoundData(uint80 roundId)
        external
        view
        returns (
            uint80 returnedRoundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function proposedGetRoundData(uint80 roundId)
        external
        view
        returns (
            uint80 returnedRoundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    function proposedLatestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}
