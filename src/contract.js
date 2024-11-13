import Web3 from 'web3';
import ContractABI from './CrowdfundingABI.json';

const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0x4205dd2FD0765a03600Ba8E79d6Abae01f14d803';
    const contractInstance = new web3.eth.Contract(ContractABI.abi, contractAddress);
    return contractInstance;
};

export default getContract;
