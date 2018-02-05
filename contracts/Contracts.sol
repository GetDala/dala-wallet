pragma solidity ^0.4.17;

contract ERC20 {
  function balanceOf(address who) public view returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
}

contract DalaWallet {
    address public owner;
    address public destination;
    address public token;
    uint256 public minBalance;

    event LogSweep(address indexed from, address indexed to, address indexed token, uint amount);
    
    modifier onlyOwner() {
        if (msg.sender != owner)
            revert(); 
        _;
    }

    function DalaWallet(address _destination, address _token, uint256 _minBalance) {
        destination = _destination;
        token = _token;
        minBalance = _minBalance;
        owner = msg.sender;
    }

    function sweep() onlyOwner returns (bool) {
        var erc20 = ERC20(token);
        var balance = erc20.balanceOf(this);
        if (balance < minBalance) 
            revert();
        var success = erc20.transfer(destination, balance);
        if (success) {
            LogSweep(msg.sender, destination, token, balance);
        }
        return success;
    }
}