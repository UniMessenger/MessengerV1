pragma experimental ABIEncoderV2;

import "./UnMsgToken.sol";
import "./MsgXToken.sol";

contract UniMessenger {

    string public name = "UniMessenger V1";
    MsgXToken public msgXToken;
    UnMsgToken public unMsgToken;

    address public owner;
    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    mapping(address => string[]) public message;
    mapping(address => address[]) public authors;
    mapping(address => address[]) public contact;

    constructor(MsgXToken _msgXToken, UnMsgToken _unimsgToken) public {
        msgXToken = _msgXToken;
        unMsgToken = _unimsgToken;
        owner = msg.sender;
    }

    function issue() public {
        require(msg.sender == owner, "Gotta be contract creator");
        for (uint i = 0; i < stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient] * 2;

            if (balance > 0) {
                msgXToken.transfer(recipient, balance);
            }
        }
    }

    function stake(uint _amount) public {
        require(_amount > 0, "Has to be bigger then 0");
        unMsgToken.transferFrom(msg.sender, address(this), _amount);
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }

        hasStaked[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    function unstake() public {
        uint balance = stakingBalance[msg.sender];
        require(balance > 0, "Staking balance cant be 0");
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
        unMsgToken.transfer(msg.sender, balance);
    }

    function sendMessage(address _receiver, string calldata _content) external {
        uint balance = msgXToken.balanceOf(msg.sender);
        require(balance > 1, "Gotta have msgx");
        message[_receiver].push(_content);
        authors[_receiver].push(msg.sender);
    }

    function getMessage(address _receiver, uint _index) external view returns (string memory) {
        return message[_receiver][_index];
    }

    function getMessages(address _receiver) external view returns (string[] memory) {
        return message[_receiver];
    }

    function getAuthors(address _receiver) external view returns (address[] memory) {
        return authors[_receiver];
    }

    function deleteMessage(uint _index) public returns (bool result) {
        delete message[msg.sender][_index];
        delete authors[msg.sender][_index];
        return true;
    }
}