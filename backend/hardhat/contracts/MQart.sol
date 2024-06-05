// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721, ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/*****************************
    CUSTOM ERRORS
******************************/

error MQart__InvalidInputAmount();
error MQart__InvalidTokenContract();
error MQart__NeedTokenApproval();
error MQart__TokenTransferFailed();
error MQart__OrderIdOutOfRange(uint256 orderId);
error MQart__OrderAmountTooLow(uint256 requiredAmount, uint256 providedAmount);
error MQart__InvalidOrderNature(bool expectedNature, bool providedNature);
error MQart__WithdrawFailed();
error MQart__BalanceCheckFailed();

/// @title MQart Smart Contract
/// @dev This contract manages NFT orders with deposits in native currency or ERC20 tokens.
/// @custom:security-contact mujahidshaik2002@gmail.com
contract MQart is ERC721Enumerable, Ownable, ReentrancyGuard {
    /// @notice Address of the ERC20 token contract used for token deposits
    address public s_tMasqTokenAddress =
        0xd98c3EBd6B7f9b7cDa2449eCac00d1E5F47a8193;

    /// @notice Counter for the order IDs
    uint256 public s_orderId;

    /// @notice Mapping from order ID to the amount required for the order
    mapping(uint256 => uint256) public s_orderAmount;

    /// @notice Mapping from order ID to the nature of the order (true for native, false for token)
    mapping(uint256 => bool) public s_orderNature;

    event OrderIdCreated(
        uint256 indexed orderId,
        uint256 indexed orderAmount,
        bool indexed orderNature
    );

    /// @dev Initializes the contract with the token name "MQartToken" and symbol "MQT". Sets the deployer as the owner.
    constructor() ERC721("MQartToken", "MQT") Ownable(msg.sender) {}

    /*****************************
        STATE UPDATE FUNCTIONS
    ******************************/

    /// @notice Creates a new order with the specified amount and nature.
    /// @param orderAmount The amount required for the order.
    /// @param orderNature The nature of the order (true for native, false for token).
    function createOrderId(uint256 orderAmount, bool orderNature)
        public
        onlyOwner
    {
        uint256 orderId = s_orderId;
        s_orderAmount[orderId] = orderAmount;
        s_orderNature[orderId] = orderNature;
        s_orderId += 1;

        emit OrderIdCreated(orderId, orderAmount, orderNature);
    }

    /// @notice Allows a user to deposit native cryptocurrency to fulfill an order.
    /// @param orderId The ID of the order being fulfilled.
    /// @dev Requirements:
    /// - The deposit amount must be greater than zero.
    /// - The order ID must be within the valid range.
    /// - The deposit amount must meet or exceed the order amount.
    /// - The order nature must be true (native).
    function depositNative(uint256 orderId) public payable nonReentrant {
        if (msg.value <= 0) revert MQart__InvalidInputAmount();
        if (orderId >= s_orderId) revert MQart__OrderIdOutOfRange(orderId);
        if (s_orderAmount[orderId] > msg.value)
            revert MQart__OrderAmountTooLow(s_orderAmount[orderId], msg.value);
        if (!s_orderNature[orderId])
            revert MQart__InvalidOrderNature(true, s_orderNature[orderId]);

        _safeMint(msg.sender, orderId);
    }

    /// @notice Allows a user to deposit ERC20 tokens to fulfill an order.
    /// @param orderId The ID of the order being fulfilled.
    /// @param amount The amount of tokens to deposit.
    /// @dev Requirements:
    /// - The deposit amount must be greater than zero.
    /// - The order ID must be within the valid range.
    /// - The deposit amount must meet or exceed the order amount.
    /// - The order nature must be false (token).
    function depositToken(uint256 orderId, uint256 amount) public nonReentrant {
        if (amount <= 0) revert MQart__InvalidInputAmount();
        if (orderId >= s_orderId) revert MQart__OrderIdOutOfRange(orderId);
        if (s_orderAmount[orderId] > amount)
            revert MQart__OrderAmountTooLow(s_orderAmount[orderId], amount);
        if (s_orderNature[orderId])
            revert MQart__InvalidOrderNature(false, s_orderNature[orderId]);

        // Transfer tokens from sender to this contract
        (bool checkTransfer, ) = s_tMasqTokenAddress.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                amount
            )
        );
        if (!checkTransfer) revert MQart__TokenTransferFailed();

        _safeMint(msg.sender, orderId);
    }

    /// @notice Allows the owner to withdraw all native cryptocurrency from the contract.
    function withdraw() public onlyOwner {
        (bool checkWithdraw, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!checkWithdraw) revert MQart__WithdrawFailed();
    }

    /// @notice Allows the owner to withdraw all ERC20 tokens from the contract.
    function withdrawTokens() public onlyOwner {
        (bool checkBalance, bytes memory balanceInBytes) = s_tMasqTokenAddress
            .staticcall(
                abi.encodeWithSignature("balanceOf(address)", address(this))
            );
        if (!checkBalance) revert MQart__BalanceCheckFailed();

        uint256 amount = abi.decode(balanceInBytes, (uint256));

        (bool checkWithdraw, ) = s_tMasqTokenAddress.call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                msg.sender,
                amount
            )
        );
        if (!checkWithdraw) revert MQart__TokenTransferFailed();
    }

    /// @notice Allows the owner to update the address of the ERC20 token contract.
    /// @param newMasqAddress The new address of the ERC20 token contract.
    function updateMasqTokenAddress(address newMasqAddress) public onlyOwner {
        s_tMasqTokenAddress = newMasqAddress;
    }

    /// @notice Returns the order IDs owned by a specified user.
    /// @param userAddress The address of the user.
    /// @return userOrderIds An array of order IDs owned by the specified user.
    function getUserOrderIds(address userAddress)
        public
        view
        returns (uint256[] memory)
    {
        uint256 userBalance = balanceOf(userAddress);
        uint256[] memory userOrderIds = new uint256[](userBalance);
        for (uint256 i = 0; i < userBalance; ++i) {
            userOrderIds[i] = tokenOfOwnerByIndex(userAddress, i);
        }

        return userOrderIds;
    }
}
