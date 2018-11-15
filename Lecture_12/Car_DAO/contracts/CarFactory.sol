pragma solidity ^0.4.24;

import "./Car.sol";
import "./CarShop.sol";
import "./../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract CarFactory is Ownable {
    
    address[] public cars;
    
    address public votingContract;
    address public carShopContract;
    
    modifier onlyCarShop() {
        require(msg.sender == carShopContract, "Message sender is different than carShop");
        _;
    }

    modifier onlyVotingContract() {
        require(msg.sender == votingContract, "Message sender is different than votingContract");
        _;
    }

    constructor() public {
        for(uint i = 0; i < 5; i++){
            cars.push(new Car(20, address(this), "Accord", "2.7"));
        }
    }


    function produceNewCarBasedOnSoldOne(Car car) public onlyCarShop {
        address createdCar = createNewCar(
            car.price(), 
            car.model(), 
            car.engine()
        );

        CarShop(carShopContract).withdrawCarPrice(car.price());
        CarShop(carShopContract).addNewCar(createdCar);
    }

    function startNewCarManufactory(uint price, bytes32 model, bytes32 engine) public onlyOwner {
        address createdCar = createNewCar(price, model, engine);

        CarShop(carShopContract).addNewCar(createdCar);
    }

    function createNewCar(uint price, bytes32 model, bytes32 engine) internal returns(address) {
        Car newCar = new Car(
            price, 
            address(this), 
            model,
            engine
        );

        cars.push(newCar);

        return newCar;
    }

    function setCarShop(address _carShopContract) public onlyOwner {
        require(_carShopContract != address(0x0));
        carShopContract = _carShopContract;
    }

    function setVoting(address _votingContract) public onlyOwner {
        require(_votingContract != address(0x0));
        votingContract = _votingContract;
    }

    function withdraw() public {
        owner.transfer(address(this).balance);
    }
}