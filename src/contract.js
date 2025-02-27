import Web3 from 'web3';
import ContractABI from './DonateABI.json';

const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    const contractAddress = '0x89C56BAAA0541ad188EC63c6aEEF210a3f466a3D';
    const contractInstance = new web3.eth.Contract(ContractABI.abi, contractAddress);
    return contractInstance;
};

export default getContract;
