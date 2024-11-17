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
    const [editingOrg, setEditingOrg] = useState(null);

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
        setOrganizations(
            orgs.map((org) => ({
                name: org.name,
                description: org.description,
                fundGoal: Web3.utils.fromWei(org.fundGoal, 'ether'),
                balance: Web3.utils.fromWei(org.balance, 'ether'),
                goalReached: Web3.utils.fromWei(org.balance, 'ether') >= Web3.utils.fromWei(org.fundGoal, 'ether'),
            }))
        );
    };

    useEffect(() => {
        loadAccountData();
    }, []);

    const handleAddOrganization = async () => {
        if (newOrg.name.trim() === '' || newOrg.description.trim() === '' || !newOrg.fundGoal) return;
        if (!contractInstance) {
            console.error('El contrato no está inicializado.');
            return;
        }

        try {
            await contractInstance.methods
                .addOrganization(newOrg.name, newOrg.description, Web3.utils.toWei(newOrg.fundGoal, 'ether'))
                .send({ from: account });
            setNewOrg({ name: '', description: '', fundGoal: '' });
            loadAccountData();
        } catch (error) {
            console.error('Error al agregar organización:', error);
        }
    };

    const handleEditOrganization = async (index) => {
        if (
            !editingOrg ||
            editingOrg.name.trim() === '' ||
            editingOrg.description.trim() === '' ||
            !editingOrg.fundGoal
        )
            return;

        try {
            await contractInstance.methods
                .editOrganization(
                    index,
                    editingOrg.name,
                    editingOrg.description,
                    Web3.utils.toWei(editingOrg.fundGoal, 'ether')
                )
                .send({ from: account });
            setEditingOrg(null);
            loadAccountData();
        } catch (error) {
            console.error('Error al editar la organización:', error);
        }
    };

    const handleDeleteOrganization = async (index) => {
        if (!contractInstance) {
            console.error('El contrato no está inicializado.');
            return;
        }

        try {
            await contractInstance.methods.deleteOrganization(index).send({ from: account });
            loadAccountData();
            alert('Organización eliminada exitosamente.');
        } catch (error) {
            console.error('Error al eliminar la organización:', error);
        }
    };

    const handleWithdraw = async () => {
        if (!contractInstance) return;

        try {
            await contractInstance.methods.withdrawFunds().send({ from: account });
            loadAccountData();
            alert('Fondos retirados exitosamente.');
        } catch (error) {
            console.error('Error al retirar fondos:', error);
            alert('Error al retirar fondos. Asegúrate de estar usando la cuenta del propietario.');
        }
    };

    const handleDonate = async (orgIndex, amount) => {
        if (!amount || amount <= 0) return;

        try {
            const amountInWei = Web3.utils.toWei(amount.toString(), 'ether');
            await contractInstance.methods.donate(orgIndex).send({
                from: account,
                value: amountInWei,
            });
            loadAccountData();
        } catch (error) {
            console.error('Error al donar:', error);
        }
    };

    return (
        <div>
            <h1>Crowdfunding</h1>
            <p>Tu cuenta: {account}</p>
            <p>Balance: {balance} ETH</p>

            {isOwner && (
                <div>
                    <h2>OWNER</h2>
                    <button onClick={handleWithdraw}>Sacar fondos de contrato</button>
                    <div>
                        <input
                            type="text"
                            placeholder="Nombre de la organización"
                            value={newOrg.name}
                            onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Descripción de la organización"
                            value={newOrg.description}
                            onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                        />
                        <input
                            type="number"
                            placeholder="Meta de fondos en ETH"
                            value={newOrg.fundGoal}
                            onChange={(e) => setNewOrg({ ...newOrg, fundGoal: e.target.value })}
                        />
                        <button onClick={handleAddOrganization}>Agregar organización</button>
                    </div>
                </div>
            )}

            <h2>Organizaciones</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {organizations.map((org, index) => (
                    <div
                        key={index}
                        style={{
                            border: '1px solid #ccc',
                            padding: '10px',
                            backgroundColor: org.goalReached ? '#d4edda' : '#f8f9fa',
                        }}
                    >
                        {editingOrg && editingOrg.index === index ? (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Nuevo nombre"
                                    value={editingOrg.name}
                                    onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Nueva descripción"
                                    value={editingOrg.description}
                                    onChange={(e) =>
                                        setEditingOrg({ ...editingOrg, description: e.target.value })
                                    }
                                />
                                <input
                                    type="number"
                                    placeholder="Nueva meta en ETH"
                                    value={editingOrg.fundGoal}
                                    onChange={(e) =>
                                        setEditingOrg({ ...editingOrg, fundGoal: e.target.value })
                                    }
                                />
                                <button onClick={() => handleEditOrganization(index)}>Guardar</button>
                                <button onClick={() => setEditingOrg(null)}>Cancelar</button>
                            </div>
                        ) : (
                            <div>
                                <h3>{org.name}</h3>
                                <p>Descripción: {org.description}</p>
                                <p>Meta de fondos: {org.fundGoal} ETH</p>
                                <p>Balance: {org.balance} ETH</p>
                                {org.goalReached && <p style={{ color: 'green' }}>¡Meta alcanzada!</p>}
                                {!org.goalReached && isOwner && (
                                    <button
                                        onClick={() =>
                                            setEditingOrg({
                                                index,
                                                name: org.name,
                                                description: org.description,
                                                fundGoal: org.fundGoal,
                                            })
                                        }
                                    >
                                        Editar
                                    </button>
                                )}
                                {isOwner && (
                                    <button onClick={() => handleDeleteOrganization(index)}>
                                        Eliminar
                                    </button>
                                )}
                                {!org.goalReached && !isOwner && (
                                    <>
                                        <input
                                            type="number"
                                            placeholder="Cantidad en ETH"
                                            onChange={(e) =>
                                                setOrganizations((prev) =>
                                                    prev.map((o, i) =>
                                                        i === index ? { ...o, donationAmount: e.target.value } : o
                                                    )
                                                )
                                            }
                                        />
                                        <button onClick={() => handleDonate(index, org.donationAmount || 0)}>
                                            Donar
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default App;
