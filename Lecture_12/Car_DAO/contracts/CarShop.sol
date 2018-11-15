pragma solidity ^0.4.24;

import "./Car.sol";
import "./CarFactory.sol";
import "./Voting.sol";
import "./../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract CarShop {
    using SafeMath for uint;

    address public factoryContract;
    Voting public votingContract;

    mapping(address => address) public carsForPurchase;
    
    modifier onlyFactoryContract(){
        require(msg.sender == factoryContract);
        _;
    }
    
    modifier onlyInStock(address carAddress) {
        require(carsForPurchase[carAddress] != address(0), "Car is not in stock");
        _;
    }

    constructor(address _factoryContract, address _votinContract) public{
        factoryContract = _factoryContract;
        votingContract = _votingContract;
    }
    
    function addNewCar(address newCar) public onlyFactoryContract {
        carsForPurchase[newCar] = newCar;
    }
    
    function buyCar(address wantedCar) public payable onlyInStock(wantedCar) {
        Car carForSell = Car(wantedCar);
        require(msg.value >= carForSell.price(), "Not enough money for buying this car");
        
        carForSell.changeOwnership(msg.sender);
        votingContract.addVoter.value(carForSell.price().div(10))(msg.sender);

        carsForPurchase[wantedCar] = address(0x0);
        CarFactory(factoryContract).produceNewCarBasedOnSoldOne(carForSell);
    }
    
    function withdrawCarPrice(uint carPrice) public onlyFactoryContract {
        factoryContract.transfer(carPrice.mul(9).div(10));
    }
}