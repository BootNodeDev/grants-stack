import { graphql_fetch } from "common";
import { RoundCategory } from "./types";

export async function getCurrentSubgraphBlockNumber(
  chainId: number,
  roundCategory?: RoundCategory
): Promise<number> {
  const res = await graphql_fetch(
    `
      {
        _meta {
          block {
            number,
            hash
          }
        }
      }
    `,
    chainId,
    {},
    false,
    roundCategory
  );
  return res.data._meta.block.number;
}

export async function waitForSubgraphSyncTo(
  chainId: number,
  blockNumber: number,
  pollIntervalInMs = 1000,
  roundCategory?: RoundCategory
): Promise<number> {
  let currentBlockNumber = await getCurrentSubgraphBlockNumber(
    chainId,
    roundCategory
  );
  while (currentBlockNumber < blockNumber) {
    await wait(pollIntervalInMs);
    currentBlockNumber = await getCurrentSubgraphBlockNumber(
      chainId,
      roundCategory
    );
  }
  return currentBlockNumber;
}

const wait = (ms = 1000) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
