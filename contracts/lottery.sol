// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract Lottery{
    address public jaesangmom;
    address[] public players;
    address public winner;

    event WinnerPicked(address indexed winner);

    constructor() {
        jaesangmom = msg.sender;
    }

    function participate() public payable{
        require(msg.value > 0.01 ether, "Minimum 0.01 ether required");
        players.push(msg.sender);
    }
    function getPlayers() public view returns (address[] memory){
        return players;
    }
    function random() private view returns (uint){
         bytes32 chainid = keccak256(abi.encodePacked(address(this), block.chainid));
        uint256 timestamp = block.timestamp; 
        return uint256(keccak256(abi.encodePacked(chainid, timestamp)));
    }
    function pickWinner() public {
        require(players.length > 0, "No players in the lottery");
        uint index = random() % players.length;
        winner = players[index];
        emit WinnerPicked(winner); // 이벤트 발생
        payable(winner).transfer(address(this).balance);
        delete players;
    }
}