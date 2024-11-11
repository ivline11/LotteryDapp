import logo from '../assets/logo.svg';

const Navigation = ({ account, connectWallet, disconnectWallet }) => {
    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="#">Baik</a></li>
                <li><a href="#">Jae</a></li>
                <li><a href="#">Sang</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>Lottery</h1>
            </div>

            {account ? (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={disconnectWallet} // 연결 해제 버튼
                >
                    {account.slice(0, 6) + '...' + account.slice(-4)}
                </button>
            ) : (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectWallet} // 연결 버튼
                >
                    Connect
                </button>
            )}
        </nav>
    );
}

export default Navigation;
