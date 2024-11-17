import Web3 from 'web3';
import ContractABI from './CrowdfundingABI.json';

const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0xAb03cb6aC3F0F26359Fea6e9B6822DD798937Ab0';
    const contractInstance = new web3.eth.Contract(ContractABI.abi, contractAddress);
    return contractInstance;
};

export default getContract;
