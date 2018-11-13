pragma solidity ^0.4.24;

import "./KYC/KYC.sol";
import "./../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./../../node_modules/openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./Whitelisted/Whitelisted.sol";

import "./../../node_modules/openzeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "./../../node_modules/openzeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol";

contract CappedRefundableWhitelistedKYCCrowdsale is CappedCrowdsale, RefundableCrowdsale, Whitelisted, KYC {
    using SafeMath for uint256;

    uint256 public constant CROWDSALE_DURATION = 7 weeks;

    uint256 public preSalesEndDate;

    uint256 public totalMintedBountyTokens;
    uint256 public constant MAX_BOUNTYTOKENS_AMOUNT = 100000 * (10**18); // 100 000 tokens


    uint256 public constant MIN_CONTRIBUTION_AMOUNT = 50 finney; // 0.05 ETH

     
    // 0.01 eth = 1 token
    uint256 public constant REGULAR_RATE = 100;
    uint256 public constant DEFAULT_PRESALES_DURATION = 3 weeks;
    /*
        The public sales periods ends:
            PUBLIC_SALES_1_PERIOD_END = 1 weeks / Public sales 1 period starts from private sales period and expires one week after the private sales end
            PUBLIC_SALES_2_PERIOD_END = 2 weeks / Public sales 2 period starts from public sales 1 period and expires on the 2-nd week after the private sales end
            PUBLIC_SALES_3_PERIOD_END = 3 weeks / Public sales 3 period starts from public sales 2 period and expires on the 3-th week after the private sales end
    */
    uint256 public constant PUBLIC_SALES_1_PERIOD_END = 1 weeks;
    uint256 public constant PUBLIC_SALES_2_PERIOD_END = 2 weeks;

    uint256 public constant PUBLIC_SALES_1_RATE = 115; // 15% bonus
    uint256 public constant PUBLIC_SALES_2_RATE = 110; // 10% bonus

    uint256 public constant PUBLIC_SALES_SPECIAL_USERS_RATE = 120; // 20% bonus

    event LogBountyTokenDonation(address beneficiary, uint256 amount);

    constructor(uint _cap, uint _goal, uint _startDate, uint _endDate, uint _rate, address _wallet, address _token) public
    CappedCrowdsale(_cap)
    RefundableCrowdsale(_goal)
    TimedCrowdsale(_startDate, _endDate)
    Crowdsale(_rate, _wallet, IERC20(_token))
    {
        require(_goal <= _cap, "Goal is bigger than cap");
        require(_endDate.sub(_startDate) == CROWDSALE_DURATION, "Crowdsale duration is not 7 weeks");

        preSalesEndDate = _startDate.add(DEFAULT_PRESALES_DURATION);
    }

    function buyTokens(address beneficiary) public nonReentrant payable {
        uint256 weiAmount = msg.value;
        _preValidatePurchase(beneficiary, weiAmount);

        // calculate token amount to be created
        uint256 tokens = _getTokenAmount(weiAmount, beneficiary);

        // update state
        _weiRaised = _weiRaised.add(weiAmount);

        _processPurchase(beneficiary, tokens);
        emit TokensPurchased(
            msg.sender,
            beneficiary,
            weiAmount,
            tokens
        );

        _updatePurchasingState(beneficiary, weiAmount);

        _forwardFunds();
        _postValidatePurchase(beneficiary, weiAmount);
    }

    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view onlyKYCAddress(beneficiary) {
        require(weiAmount >= MIN_CONTRIBUTION_AMOUNT, "Your have to pay minimum of 50 finney to buy tokens");

        super._preValidatePurchase(beneficiary, weiAmount);
    }

    function _getTokenAmount(uint256 weiAmount, address beneficiary) internal view returns(uint256) {
        uint beneficiaryRate = getRate(beneficiary);
        return weiAmount.mul(beneficiaryRate);
    }

    function getRate(address beneficiary) internal view returns(uint256) {

        if(now <= preSalesEndDate){
            require(preSalesSpecialUsers[beneficiary] > 0, "Beneficiary has not allowance to buy tokens");
            
            return preSalesSpecialUsers[beneficiary];
        }

        if(publicSalesSpecialUsers[beneficiary]){
            return PUBLIC_SALES_SPECIAL_USERS_RATE;
        }

        if(now <= preSalesEndDate.add(PUBLIC_SALES_1_PERIOD_END)) {
            return PUBLIC_SALES_1_RATE;
        }

        if(now <= preSalesEndDate.add(PUBLIC_SALES_2_PERIOD_END)) {
            return PUBLIC_SALES_2_RATE;
        }

        return REGULAR_RATE;
    }

    function donateBountyToken(address beneficiary, uint256 amount) public onlyOwner {
        require(!hasClosed(), "Crowdsale has been finalized");

        totalMintedBountyTokens = totalMintedBountyTokens.add(amount);
        require(totalMintedBountyTokens <= MAX_BOUNTYTOKENS_AMOUNT);

        _deliverTokens(beneficiary, amount);
        
        emit LogBountyTokenDonation(beneficiary, amount);
    }
}
