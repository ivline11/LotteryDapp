import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import jaesangmomImage from './assets/jaesangmom.jpg'
import winnerImage from './assets/winner.jpg'

// Components
import Navigation from './components/Navigation';

// ABIs
import Lottery from './abis/Lottery.json';

// Config
import config from './config.json';


function App() {
  const [provider, setProvider] = useState(null);
  const [lottery, setLottery] = useState(null);
  const [jaesangmom, setJaesangmom] = useState(null);
  const [account, setAccount] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [participateAmount, setParticipateAmount] = useState(null);
  const [winner, setWinner] = useState(null);
  
  const connectWallet = async () => {
    if (!window.ethereum) {
      console.error("MetaMask is not installed!");
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);

    // Connect to MetaMask
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

    // 사용자에게 계정 선택 옵션 제공
    const selectedAccount = window.prompt(
      `Choose an account by entering a number (0 - ${accounts.length - 1}): \n${accounts.map((acc, idx) => `${idx}: ${acc}`).join("\n")}`
    );

    // 사용자가 입력한 값이 유효한지 검사하고 선택된 계정으로 설정
    if (selectedAccount >= 0 && selectedAccount < accounts.length) {
      setAccount(accounts[selectedAccount]);
    } else {
      console.error("Invalid account selection!");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
  };

  const loadBlockchainData = async () => {
    if (!provider) return;

    const network = await provider.getNetwork();
    const networkConfig = config[network.chainId];
    if (!networkConfig || !networkConfig.lottery) {
      console.error("Lottery contract not deployed on this network");
      return;
    }

    const signer = provider.getSigner(account);
    const lottery = new ethers.Contract(networkConfig.lottery.address, Lottery.abi, signer);
    setLottery(lottery);
    const manager = await lottery.jaesangmom();
    setJaesangmom(manager); 
    const fetchedPlayers = await lottery.getPlayers();
    setPlayers(fetchedPlayers);
  };

  useEffect(() => {
    if (lottery) {
        // WinnerPicked 이벤트 리스너 추가
        lottery.on("WinnerPicked", (winnerAddress) => {
            setWinner(winnerAddress);
            console.log("Winner picked:", winnerAddress); // 콘솔 출력으로 당첨자 주소 확인
        });

        // 컴포넌트가 언마운트될 때 리스너 제거
        return () => {
            lottery.removeAllListeners("WinnerPicked");
        };
    }
}, [lottery]);

  useEffect(() => {
    if (provider) {
      loadBlockchainData();
    }
  }, [provider, account]);

  

  const participate = async () => {
    if (!participateAmount || isNaN(participateAmount) || parseFloat(participateAmount) <= 0) {
      alert("Please enter a valid amount of ETH.");
      return;
    }
    try {
      setIsLoading(true);

      const tx = await lottery.participate({
        value: ethers.utils.parseEther(participateAmount),
      });
      await tx.wait();
      const updatedPlayers = await lottery.getPlayers();
      setPlayers(updatedPlayers);
    } catch (error) {
      console.error("Participation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickWinner = async () => {
    if (account?.toLowerCase() != jaesangmom?.toLowerCase()) {
      alert("Only jaesangmom can pick the winner.");
      return;
    }
    try {
      setIsLoading(true);
      const tx = await lottery.pickWinner();
      await tx.wait();

      lottery.on("WinnerPicked", (winnerAddress) => {
        setWinner(winnerAddress);
        console.log("Winner picked:", winnerAddress);
      });

      setPlayers([]);
    } catch (error) {
      console.error("Picking winner failed:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div>
      <Navigation account={account} connectWallet={connectWallet} disconnectWallet={disconnectWallet} />
      <div className='central-section'>
        <h3>Welcome to Jaesangmom's Lottery</h3>
        <div className="image-container">
        <img src={winner ? winnerImage : jaesangmomImage} alt="Jaesangmom" className='jaesangmomImage' />
          {winner && (
            <div className="winner-message">
              <h4>Congratulations to the winner!</h4>
              <p>Winner: {winner}</p>
            </div>
          )}
        </div>

        <input
          type="number"
          min="0.01" 
          step="0.01"
          value={participateAmount}
          onChange={(e) => setParticipateAmount(e.target.value)}
          placeholder="Enter ETH amount"
          className="participate-input"
        />
        <button onClick={participate} disabled={isLoading}>
          {isLoading ? "Participating..." : "Participate with more than 0.01 ETH"}
        </button>
        
        {account?.toLowerCase() === jaesangmom?.toLowerCase() && (
          <button onClick={pickWinner} disabled={isLoading}>
            {isLoading ? "Picking Winner..." : "Pick Winner"}
          </button>
        )}

        <h4>Players:</h4>
        <ul>
          {players.length > 0 ? (
            players.map((player, index) => <li key={index}>{player}</li>)
          ) : (
            <li>No players yet</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
