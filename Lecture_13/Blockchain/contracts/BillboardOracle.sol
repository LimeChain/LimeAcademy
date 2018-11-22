pragma solidity ^0.4.24;

contract BillboardOracle {

    uint256 public ethPriceInUSD;
	uint256 public lastEthPriceInUSD;

    event RateChanged(uint256 _oldPrice, uint256 _newPrice);

    constructor(uint256 _ethPriceInUSD) {
        ethPriceInUSD = _ethPriceInUSD;
    }

    function setPrice(uint256 _newEthPrice) public  {
        require(_newEthPrice > 0, "Invalid ethPriceInUSD value");

        lastEthPriceInUSD = ethPriceInUSD;
        ethPriceInUSD = _newEthPrice;

        emit RateChanged(lastEthPriceInUSD, _newEthPrice);
    }

}

