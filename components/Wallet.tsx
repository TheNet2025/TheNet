import React, { useState } from 'react';
import Card from './common/Card';
import Button from './common/Button';
import Input from './common/Input';
import { BtcIcon, EthIcon, UsdtIcon, CheckCircleIcon, CopyIcon } from './common/Icons';
import { Transaction, TransactionType, Balances } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useDatabase } from '../hooks/useDatabase';

const COINS = {
    USDT: { name: 'Tether (TRC20)', address: 'TCN8mSR9UVH57kYjbP1wfLPAg88WqJxmG7', icon: <UsdtIcon />, minWithdraw: 50 },
    BTC: { name: 'Bitcoin', address: '154d8w8X4jLGVbqwjdR9T1Gx47JVDzVWCu', icon: <BtcIcon />, minWithdraw: 0.0005 },
    ETH: { name: 'Ethereum (ERC20)', address: '0x46aaf15a144f49b2b8d67c29135d30d852841ec0', icon: <EthIcon />, minWithdraw: 0.01 },
};
type Coin = keyof typeof COINS;
interface Rates {
    btc: number;
    eth: number;
    usdt: number;
}

const DepositView: React.FC<{}> = () => {
    const { user } = useAuth();
    const { addTransaction } = useDatabase();
    const [selectedCoin, setSelectedCoin] = useState<Coin>('USDT');
    const [copied, setCopied] = useState(false);
    const [amount, setAmount] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const walletAddress = COINS[selectedCoin].address;

    const handleCopy = () => {
        navigator.clipboard.writeText(walletAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setError(null);
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            setError("Please enter a valid deposit amount.");
            return;
        }

        addTransaction({
            userId: user.id,
            type: TransactionType.Deposit,
            amount: amountNum,
            currency: selectedCoin,
            address: 'user_deposit_request',
        });

        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setAmount('');
        }, 4000);
    };
    
    if (submitted) {
        return (
            <div className="text-center p-8 flex flex-col items-center h-96 justify-center">
                 <CheckCircleIcon className="h-24 w-24 text-success" />
                <h3 className="text-2xl font-bold mt-6 text-text-dark">Deposit Submitted</h3>
                <p className="text-text-muted-dark mt-2 max-w-xs">Your deposit request for {amount} {selectedCoin} has been sent for approval.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
            <div>
                <h3 className="text-lg text-center font-semibold text-text-dark mb-4">Select Currency to Deposit</h3>
                <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(COINS) as Coin[]).map((coin) => (
                        <button
                            type="button"
                            key={coin}
                            onClick={() => setSelectedCoin(coin)}
                            className={`py-4 rounded-2xl font-semibold border-2 transition-all flex flex-col items-center space-y-2 ${
                                selectedCoin === coin 
                                ? 'bg-primary/10 border-primary text-primary shadow-inner' 
                                : 'bg-transparent border-border-dark text-text-muted-dark hover:border-primary/50'
                            }`}
                        >
                            <span className="w-8 h-8">{COINS[coin].icon}</span>
                            <span>{coin}</span>
                        </button>
                    ))}
                </div>
            </div>

            <Input 
                label={`Deposit Amount (${selectedCoin})`} 
                type="number" 
                step="any" 
                placeholder="0.00" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                required 
            />
            {error && <p className="text-danger text-sm text-center -mt-2">{error}</p>}
            
            <Card>
                <h3 className="text-md font-semibold my-2 text-text-dark text-center">Deposit to Your {COINS[selectedCoin].name} Address</h3>

                <div className="flex justify-center my-6">
                    <div className="p-2 bg-white rounded-xl">
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${walletAddress}`} alt="Wallet QR Code" className="rounded-md" />
                    </div>
                </div>
                <div className="bg-background-dark rounded-lg p-3 text-center break-all border border-border-dark">
                     <p className="text-text-muted-dark text-sm font-mono">{walletAddress}</p>
                </div>
                <Button type="button" onClick={handleCopy} className="w-full mt-6" variant="secondary" icon={copied ? <CheckCircleIcon /> : <CopyIcon />}>
                    {copied ? 'Copied!' : 'Copy Address'}
                </Button>
            </Card>
             <Button type="submit" className="w-full !py-4" disabled={!amount}>
                Submit Deposit
            </Button>
        </form>
    );
};

const WithdrawView: React.FC<{ balances: Balances; setBalances: (balances: Balances) => void; rates: Rates; }> = ({ balances, setBalances, rates }) => {
    const { user } = useAuth();
    const { addTransaction } = useDatabase();
    const [selectedCoin, setSelectedCoin] = useState<Coin>('BTC');
    const [address, setAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const balance = balances[selectedCoin.toLowerCase() as keyof Balances];
    const rate = rates[selectedCoin.toLowerCase() as keyof Rates] || 0;
    const usdValue = balance * rate;


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setError(null);
        const amountNum = parseFloat(amount);
        const minWithdraw = COINS[selectedCoin].minWithdraw;

        if (amountNum > balance) {
            setError('Insufficient funds for this withdrawal.');
            return;
        }
        if (amountNum < minWithdraw) {
            setError(`Minimum withdrawal is ${minWithdraw} ${selectedCoin}.`);
            return;
        }
        
        // 1. Debit Balance (Hold funds)
        const newBalances = { ...balances };
        newBalances[selectedCoin.toLowerCase() as keyof Balances] -= amountNum;
        setBalances(newBalances);
        
        // 2. Create PENDING Transaction
        addTransaction({
            userId: user.id,
            type: TransactionType.Withdrawal,
            amount: amountNum,
            currency: selectedCoin,
            address: address.slice(0, 12) + '...',
        });
        
        setSubmitted(true);

        setTimeout(() => {
            setSubmitted(false);
            setAddress('');
            setAmount('');
        }, 4000);
    };
    
    if (submitted) {
        return (
            <div className="text-center p-8 flex flex-col items-center h-96 justify-center">
                 <CheckCircleIcon className="h-24 w-24 text-success" />
                <h3 className="text-2xl font-bold mt-6 text-text-dark">Withdrawal Submitted</h3>
                <p className="text-text-muted-dark mt-2 max-w-xs">Your request has been sent for approval. Your balance will be updated upon confirmation.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
            <div className="grid grid-cols-3 gap-3">
                {(Object.keys(COINS) as Coin[]).map((coin) => (
                    <button
                        type="button"
                        key={coin}
                        onClick={() => setSelectedCoin(coin)}
                        className={`py-3 rounded-2xl font-semibold border-2 transition-all flex flex-col items-center space-y-1 ${
                            selectedCoin === coin 
                            ? 'bg-primary/10 border-primary text-primary shadow-inner' 
                            : 'bg-transparent border-border-dark text-text-muted-dark hover:border-primary/50'
                        }`}
                    >
                        <span className="w-6 h-6">{COINS[coin].icon}</span>
                        <span className="text-sm">{coin}</span>
                    </button>
                ))}
            </div>
             <div className="text-right text-sm text-text-muted-dark -mt-4">
                Available: <span className="font-bold text-text-dark">{balance.toFixed(6)} {selectedCoin}</span>
                <span className="block text-xs">~ ${usdValue.toFixed(2)} USD</span>
            </div>

            <Input label={`Recipient ${selectedCoin} Address`} placeholder={`Enter ${selectedCoin} address`} value={address} onChange={e => setAddress(e.target.value)} required />
            <Input label={`Amount (${selectedCoin})`} type="number" step="any" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} required />
             {error && <p className="text-danger text-sm text-center -mt-2">{error}</p>}
            <Card>
                <div className="flex justify-between text-sm">
                    <span className="text-text-muted-dark">Minimum Withdrawal:</span>
                    <span className="font-bold text-text-dark">{COINS[selectedCoin].minWithdraw} {selectedCoin}</span>
                </div>
                <div className="flex justify-between mt-2 text-base">
                    <span className="text-text-muted-dark">You will send:</span>
                    <span className="font-bold text-primary text-lg">{amount || '0.00'} {selectedCoin}</span>
                </div>
            </Card>
            <Button type="submit" className="w-full !py-4" disabled={!address || !amount}>
                Request Withdrawal
            </Button>
        </form>
    );
};


const Wallet: React.FC<{ balances: Balances; setBalances: (balances: Balances) => void; rates: Rates; }> = ({ balances, setBalances, rates }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const coinData: { key: keyof Balances; name: string; icon: React.ReactNode }[] = [
    { key: 'btc', name: 'Bitcoin', icon: <BtcIcon /> },
    { key: 'eth', name: 'Ethereum', icon: <EthIcon /> },
    { key: 'usdt', name: 'Tether', icon: <UsdtIcon /> },
  ];

  return (
    <div className="p-5 space-y-8">
      <h1 className="text-4xl font-extrabold text-text-dark">Wallet</h1>
      
      <Card>
        <h2 className="text-xl font-bold text-text-dark mb-4">Your Balances</h2>
        <div className="space-y-4">
          {coinData.map(({ key, name, icon }) => {
            const balance = balances[key];
            const rate = rates[key];
            const usdValue = balance * rate;
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10">{icon}</div>
                  <div>
                    <p className="font-bold text-lg text-text-dark">{name}</p>
                    <p className="text-sm text-text-muted-dark">{key.toUpperCase()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-text-dark">{balance.toFixed(6)}</p>
                  <p className="text-sm text-text-muted-dark">${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      <div className="flex bg-secondary rounded-2xl p-1">
        <button 
          onClick={() => setActiveTab('deposit')}
          className={`w-1/2 py-2.5 rounded-xl font-bold text-base transition-all duration-300 ${activeTab === 'deposit' ? 'bg-card-dark text-primary shadow-md' : 'text-text-muted-dark'}`}
        >
          Deposit
        </button>
        <button 
          onClick={() => setActiveTab('withdraw')}
          className={`w-1/2 py-2.5 rounded-xl font-bold text-base transition-all duration-300 ${activeTab === 'withdraw' ? 'bg-card-dark text-primary shadow-md' : 'text-text-muted-dark'}`}
        >
          Withdraw
        </button>
      </div>

      {activeTab === 'deposit' ? <DepositView /> : <WithdrawView balances={balances} setBalances={setBalances} rates={rates} />}
    </div>
  );
};

export default Wallet;