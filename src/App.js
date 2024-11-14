import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import getContract from './contract.js';

const App = () => {
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('');
    const [isOwner, setIsOwner] = useState(false);
    const [organizations, setOrganizations] = useState([]);
    const [contractInstance, setContractInstance] = useState(null);
    const [newOrg, setNewOrg] = useState({ name: '', description: '', fundGoal: '' });

    const initWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
            return window.web3;
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            return window.web3;
        } else {
            console.log('No se ha detectado ningún proveedor de Web3. Por favor, instala MetaMask.');
            return null;
        }
    };

    const loadAccountData = async () => {
        const web3 = await initWeb3();
        if (!web3) {
            console.log('Web3 no está inicializado.');
            return;
        }

        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const balanceInWei = await web3.eth.getBalance(accounts[0]);
        const balanceInEther = web3.utils.fromWei(balanceInWei, 'ether');
        setBalance(balanceInEther);

        const contract = await getContract();
        setContractInstance(contract);

        const ownerAddress = await contract.methods.owner().call();
        setIsOwner(accounts[0].toLowerCase() === ownerAddress.toLowerCase());

        const orgs = await contract.methods.getOrganizations().call();
        console.log("Organizaciones obtenidas:", orgs);
        setOrganizations(orgs);
    };

    useEffect(() => {
        loadAccountData();
    }, []);

    const handleAddOrganization = async () => {
        if (newOrg.name.trim() === '' || newOrg.description.trim() === '' || !newOrg.fundGoal) return;
        if (!contractInstance) {
            console.error("El contrato no está inicializado.");
            return;
        }
    
        try {
            await contractInstance.methods
                .addOrganization(newOrg.name, newOrg.description, Web3.utils.toWei(newOrg.fundGoal, 'ether'))
                .send({ from: account });
            setNewOrg({ name: '', description: '', fundGoal: '' });
            loadAccountData();
        } catch (error) {
            console.error("Error al agregar organización:", error);
        }
    };
    
    const handleWithdraw = async () => {
        if (!contractInstance) return;

        try {
            console.log("Retirando fondos del contrato");
            await contractInstance.methods.withdrawFunds().send({ from: account });
            loadAccountData();
            alert("Fondos retirados exitosamente.");
        } catch (error) {
            console.error("Error al retirar fondos:", error);
            alert("Error al retirar fondos. Asegúrate de estar usando la cuenta del propietario.");
        }
    };

    const handleDonate = async (orgIndex, amount) => {
        if (!amount || amount <= 0) return;

        try {
            const amountInWei = Web3.utils.toWei(amount.toString(), 'ether');
            console.log(`Donando ${amount} ETH a la organización en el índice ${orgIndex}`);
            await contractInstance.methods.donate().send({
                from: account,
                value: amountInWei
            });
            loadAccountData();
        } catch (error) {
            console.error("Error al donar:", error);
        }
    };

    return (
        <div>
            <h1>Donate</h1>
            <p>Tu cuenta: {account}</p>
            <p>Balance: {balance} ETH</p>

            {isOwner ? (
                <div>
                    <h2>OWNER</h2>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={handleWithdraw}>
                            Sacar fondos de contrato
                        </button>
                        <div>
                            <input 
                                type="text" 
                                placeholder="Nombre de la organización"
                                value={newOrg.name}
                                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} 
                            />
                            <input
                                type="text"
                                placeholder="Descripcion de la organización"
                                value={newOrg.description}
                                onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })} 
                            />
                            <input 
                                type="number" 
                                placeholder="Meta de fondos en ETH" 
                                value={newOrg.fundGoal} 
                                onChange={(e) => setNewOrg({ ...newOrg, fundGoal: e.target.value })} 
                            />
                            <button onClick={handleAddOrganization}>Agregar org</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h2>Organizaciones</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {organizations.map((org, index) => (
                            <div key={index} style={{ border: '1px solid #ccc', padding: '10px' }}>
                            <h3>{org.name}</h3>
                            <p>Descripción: {org.description}</p>
                            <p>Meta de fondos: {Web3.utils.fromWei(org.fundGoal, 'ether')} ETH</p>
                            <p>Balance: {Web3.utils.fromWei(org.balance, 'ether')} ETH</p>
                            <input 
                                type="number" 
                                placeholder="Cantidad en ETH" 
                                onChange={(e) => setOrganizations(prevOrgs => 
                                    prevOrgs.map((o, i) => i === index ? {...o, donationAmount: e.target.value} : o)
                                )}
                            />
                            <button onClick={() => handleDonate(index, org.donationAmount || 0)}>
                                Donar
                            </button>
                        </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;