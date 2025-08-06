// import helperConfig from "./helperConfig.deploy";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("Voter", (m) => {
  const apollo = m.contract("Vote", ["SaturnV"]);

  m.call(apollo, "launch", []);

  return { apollo };
});