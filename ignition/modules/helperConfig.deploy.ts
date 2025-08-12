export interface NetworkConfigItem {
  name: string;
  acceptableVoteIds: number[];
  entranceFee: string;
}

export const networkConfig: Record<number, NetworkConfigItem> = {
  31337: {
    name: "localhost",
    acceptableVoteIds: [1, 2, 3, 4, 5],
    entranceFee: "10000000000000000", // 0.01 ETH
  },
  11155111: {
    name: "sepolia",
    acceptableVoteIds: [1, 2, 3, 4, 5],
    entranceFee: "10000000000000000",
  },
};
