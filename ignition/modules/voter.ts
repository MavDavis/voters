import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { networkConfig } from "./helperConfig.deploy";
import hre from "hardhat";

export default buildModule("voter", (m) => {
  const chainId = hre.network.config.chainId ?? 31337;

  const config = networkConfig[chainId as keyof typeof networkConfig];
  if (!config) {
    throw new Error(`No config found for chainId ${chainId}`);
  }

  const newVoterInstance = m.contract("Voter");

  // Pass acceptableVoteIds to initialize
  m.call(newVoterInstance, "initialize", [config.acceptableVoteIds]);

  // Optionally, addAcceptableId calls if needed (but likely redundant if initialize sets them)
  // config.acceptableVoteIds.forEach((voteId, index) => {
  //   m.call(
  //     newVoterInstance,
  //     "addAcceptableId",
  //     [voteId],
  //     { id: `AddAcceptableId_${voteId}_${index}` }
  //   );
  // });

  return { newVoterInstance };
});