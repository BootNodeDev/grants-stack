import ProjectRegistryABI from "./abis/ProjectRegistry.json";
import { ethers } from "ethers";
import { Provider } from "@wagmi/core";
import { Web3Provider } from "@ethersproject/providers";
import {
  Multicall,
  ContractCallContext,
} from "ethereum-multicall";

export const fetchProjectOwners = async (
  provider: Provider | Web3Provider,
  chainID: number,
  projectID: number,
): Promise<string[]> => {
  const addresses = addressesByChainID(chainID);

  const projectRegistry = new ethers.Contract(
    addresses.projectRegistry!,
    ProjectRegistryABI,
    provider,
  );

  try {
    const projectOwners = await projectRegistry.getProjectOwners(projectID);
    return projectOwners as string[];
  } catch (err) {
    // console.log(err);
    console.log(
      `Error fetching owners from registry on chain ${chainID} for project ${projectID}`,
    );
    return [];
  }
};

export const fetchMultipleProjectOwners = async (
  provider: Provider | Web3Provider,
  chainID: number,
  projectIDs: number[],
): Promise<string[][]> => {

  const addresses = addressesByChainID(chainID);
  const registryAddress = addresses.projectRegistry!;

  const multicall = new Multicall({
    ethersProvider: provider,
    tryAggregate: true,
  });

  const contractCallContext: ContractCallContext[] = [
    {
      reference: "projectRegistry",
      contractAddress: registryAddress,
      abi: ProjectRegistryABI,
      calls: [],
    },
  ]

  for (const projectID of projectIDs) {
    contractCallContext[0].calls.push({
      reference: projectID.toString(),
      methodName: "getProjectOwners",
      methodParameters: [projectID],
    });
  }

  const results: any = await multicall.call(
    contractCallContext,
  );

  return results.results?.projectRegistry ? results.results.projectRegistry.callsReturnContext.map(
    (result: any) => (result.returnValues ? result.returnValues : []),
  ) : [[]];
};

export const addressesByChainID = (chainID: number) => {
  const chainName: string = chains[chainID];
  return addresses[chainName];
};

export const chains: { [key: number]: string } = {
  31337: "localhost",
  5: "goerli",
  10: "optimism",
  69: "optimisticKovan", // todo: update to 420: "optimisticGoerli"
  4002: "fantomTestnet",
  250: "fantom",
  1: "mainnet",
};

export const addresses: DeploymentAddress = {
  localhost: {
    projectRegistry: "0x832c5391dc7931312CbdBc1046669c9c3A4A28d5",
  },
  optimism: {
    projectRegistry: "0x8e1bD5Da87C14dd8e08F7ecc2aBf9D1d558ea174",
  },
  mainnet: {
    projectRegistry: "0x03506eD3f57892C85DB20C36846e9c808aFe9ef4",
  },
  goerli: {
    projectRegistry: "0xa71864fAd36439C50924359ECfF23Bb185FFDf21",
  },
  fantomTestnet: {
    projectRegistry: "0x984749e408FF0446d8ADaf20E293F2F299396631",
  },
  fantom: {
    projectRegistry: "0x8e1bd5da87c14dd8e08f7ecc2abf9d1d558ea174",
  },
};

export type DeploymentAddress = {
  [key: string]: {
    projectRegistry: string | undefined;
  };
};