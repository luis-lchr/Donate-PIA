import React, { useEffect, useState } from 'react';
import Web3 from 'web3';
import getContract from './contract';

const App = () => {
    const [account, setAccount] = useState('');
    const [balance, setBalance] = useState('');
    const [amount, setAmount] = useState(''); // Nueva variable para el monto a enviar
    const [contractInstance, setContractInstance] = useState(null); // Guardar la instancia del contrato

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
  
      // Obtener la cuenta principal
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
  
      // Obtener el balance
      const balanceInWei = await web3.eth.getBalance(accounts[0]);
      const balanceInEther = web3.utils.fromWei(balanceInWei, 'ether');
      setBalance(balanceInEther);
  
      // Obtener la instancia del contrato
      const contract = await getContract();
      setContractInstance(contract);
  };  

    useEffect(() => {
        loadAccountData();
    }, []);

    // Función para manejar el envío de fondos
    const handleSendFunds = async (e) => {
        e.preventDefault();
        if (!contractInstance || !amount) {
            alert("Por favor, completa todos los campos y asegúrate de que el contrato esté cargado.");
            return;
        }

        try {
            const web3 = window.web3;
            const amountInWei = web3.utils.toWei(amount, 'ether');

            // Enviar la transacción al contrato
            await contractInstance.methods.donate().send({
                from: account,
                value: amountInWei
            });

            alert(`¡Fondos enviados exitosamente!`);
            setAmount(''); // Resetear el campo de monto
            loadAccountData(); // Recargar los datos para actualizar el balance

        } catch (error) {
            console.error("Error al enviar fondos:", error);
            alert("Error al enviar fondos. Verifica la consola para más detalles.");
        }
    };

    return (
        <div>
            <h1>Crowdfunding con Smart Contracts</h1>
            <p><strong>Cuenta conectada:</strong> {account}</p>
            <p><strong>Balance:</strong> {balance} ETH</p>

            <form onSubmit={handleSendFunds}>
                <h2>Enviar Fondos</h2>
                <label>
                    Monto en ETH:
                    <input 
                        type="text" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        placeholder="0.1"
                    />
                </label>
                <button type="submit">Enviar Fondos</button>
            </form>
        </div>
    );
};

export default App;
