import Web3 from 'web3';
import ContractABI from './CrowdfundingABI.json';

const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0xAA89eAD4f4C8BBcaf4232BAF5937f45c91D08c95';
    const contractInstance = new web3.eth.Contract(ContractABI.abi, contractAddress);
    return contractInstance;
};

export default getContract;
