import Web3 from "web3";
import DIDRegistryArtifact from "../build/contracts/DIDRegistry.json" assert { type: "json" };

(async () => {
    // 1.Web3インスタンス作成
    const web3 = new Web3("http://127.0.0.1:8545");

    // 2.アカウント一覧取得
    const accounts = await web3.eth.getAccounts();
    console.log("Accounts from Ganache:", accounts);

    // 3.ネットワークID取得
    const rawNetworkId = await web3.eth.net.getId();
    const networkId = rawNetworkId.toString();
    console.log("Network ID:", networkId);

    // 4.DID Registryのデプロイ情報取得
    const deployed = DIDRegistryArtifact.networks[networkId];
    if(!deployed) {
        console.error("DIDRegistry is not deployed on network:", networkId);
        return;
    }
    console.log("DIDRegistry address:", deployed.address);
})();