// import helperConfig from "./helperConfig.deploy";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("voter", (m) => {
  const newVoterInstance = m.contract("Voter");

  m.call(newVoterInstance, "initialize", []);

  return { newVoterInstance };
});