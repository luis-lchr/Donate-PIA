import Web3 from 'web3';
import ContractABI from './CrowdfundingABI.json';

const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0x8220b94E6deBeA1d0F8Ef256A06F1bD8C7A99e3A';
    const contractInstance = new web3.eth.Contract(ContractABI.abi, contractAddress);
    return contractInstance;
};

export default getContract;
