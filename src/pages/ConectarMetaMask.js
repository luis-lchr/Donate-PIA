import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

const ConectarMetaMask = () => {
    const [account, setAccount] = useState(null);
    
    useEffect(() => {
        const checkMetaMaskConnection = async () => {
            if (window.ethereum) {
                const web3 = new Web3(window.ethereum);
                try {
                    const accounts = await web3.eth.requestAccounts();
                    setAccount(accounts[0]);
                } catch (error) {
                    console.error("No se pudo conectar a MetaMask:", error);
                }
            } else {
                console.log("MetaMask no está instalado.");
            }
        };
        checkMetaMaskConnection();
    }, []);

    return (
        <div>
            <h2>Conectar a MetaMask</h2>
            {account ? (
                <p>Cuenta conectada: {account}</p>
            ) : (
                <p>Por favor, conecta MetaMask.</p>
            )}
        </div>
    );
};

export default ConectarMetaMask;
