import Web3 from 'web3';
import ContractABI from './CrowdfundingABI.json';

const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0xa83f6c60FcaD935A2748d83c91df1CFa58102D06';
    const contractInstance = new web3.eth.Contract(ContractABI.abi, contractAddress);
    return contractInstance;
};

export default getContract;
