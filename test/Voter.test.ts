import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

/**
| Feature                 | What to test                                        |
| ----------------------- | --------------------------------------------------- |
| ✅ Valid vote            | User can vote once for an allowed ID                |
| ❌ Double voting         | Revert if same ID is voted twice                    |
| ❌ Invalid ID            | Revert if ID not in `acceptableIds`                 |
| ❌ Insufficient ETH      | Revert if sent < 0.01 ETH                           |
| ✅ View function         | `getVote()` returns correct voter                   |
| 🛠 Owner functions      | Only owner can `add/remove ID`, `pause`, `withdraw` |
| 🔐 Reentrancy & Pausing | Test `nonReentrant` and `whenNotPaused` logic       |
| 💸 Withdraw             | ETH is transferred to owner and event is emitted    |
| ⛔ Fallback              | Contract can accept ETH via fallback                |
*/

describe("Voter Contract", function () {
  let voter: any;
  let owner: Signer;
  let user1: Signer;
  async function initiateContract() {
    [owner, user1] = await ethers.getSigners();
    const Voter = await ethers.getContractFactory("Voter");
    voter = await Voter.deploy();
  }
  beforeEach(initiateContract);
  it("should allow only valid id to be cast on vote", async function () {
    await expect(
      voter.castVote(4, { value: ethers.parseEther("0.01") })
    ).to.emit(voter, "Voter__Cast").withArgs(1,user1.getAddress());
  });
  it("should not allow an invalid id to be cast on vote", async function () {
    await expect(
      voter.castVote(999, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(voter, "InvalidVoteId");
  });
  it("should not allow an id to vote twice",async function () {
    
  })
  it("should allow owner to withdraw funds", async function () {});
  it("should not allow non-owner to withdraw funds", async function () {});
});
