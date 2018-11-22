pragma solidity ^0.4.24;

contract LimeFactoryString {

    string slogan;
    string otherSlogan;

    event FreshLime(string name);

    struct Lime {
        string name;
        uint8 carbohydrates;
        uint8 fat;
        uint8 protein;
    }

    Lime[] public limes;

    constructor(string _slogan, string _otherSlogan) public {
        slogan = _slogan;
        otherSlogan = _otherSlogan;
    }

    function createLime(string _name, uint8 _carbohydrates, uint8 _fat, uint8 _protein) internal {
        limes.push(Lime(_name, _carbohydrates, _fat, _protein));
        emit FreshLime(_name);
    }
}