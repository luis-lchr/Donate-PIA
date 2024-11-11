import Web3 from 'web3';
import CrowdfundingContract from './CrowdfundingABI.json'; // Asegúrate de que el nombre y ruta del ABI sean correctos

const getContract = async () => {
    const web3 = new Web3(window.ethereum);
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = CrowdfundingContract.networks[networkId];
    const contractInstance = new web3.eth.Contract(
        CrowdfundingContract.abi,
        deployedNetwork && deployedNetwork.address
    );
    return contractInstance;
};

export default getContract;
