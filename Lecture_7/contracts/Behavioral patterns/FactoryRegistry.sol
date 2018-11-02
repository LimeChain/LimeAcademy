pragma solidity ^0.4.23;


contract Car {

    string public brand;
    string public model;
    uint256 public year;
    address public owner;

    constructor(string _brand, string _model, uint256 _year, address _owner) public {
        brand = _brand;
        model = _model;
        year = _year;
        owner = _owner;
    }

}


contract CarShop {

    // user address => list of cars addresses
    mapping(address => address[]) public carsPerOwner;
    address[] cars;

    function createCar(brand, model, year) public payable {
        require(msg.value >= 1 ether);

        Car car = new Car(brand, model, year, msg.sender);
        cars.push(car);
        carsPerOwner[msg.sender].push(car);
    }

    function getCars() public view returns (address[]) {
        return cars;
    }

}