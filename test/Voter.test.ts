import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { Contract, Signer } from "ethers";
import { Voter } from "../typechain-types";
/**
| Feature                 | What to test                                        |
| 🛠 Owner functions      | Only owner can `add/remove ID`, `pause`, `withdraw` |
| 🔐 Reentrancy & Pausing | Test `nonReentrant` and `whenNotPaused` logic       |
| 💸 Withdraw             | ETH is transferred to owner and event is emitted    |
| ⛔ Fallback              | Contract can accept ETH via fallback                |
*/

describe("Voter Contract", function () {
  let voter: Voter;
  let owner: Signer;
  let user1: Signer;

  beforeEach(async () => {
    [owner, user1] = await ethers.getSigners();
    const Voter = await ethers.getContractFactory("Voter");
    voter = (await upgrades.deployProxy(Voter, [], {
      initializer: "initialize",
    })) as unknown as Voter;
  });

  it("should allow only valid id to be cast on vote", async function () {
    await expect(
      voter.connect(user1).castVote(4, { value: ethers.parseEther("0.01") })
    )
      .to.emit(voter, "Voter__Cast")
      .withArgs(4, user1.getAddress());
  });
  it("should not allow an invalid id to be cast on vote", async function () {
    await expect(
      voter.castVote(999, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(voter, "InvalidVoteId");
  });
  it("should revert if msg.value is less than 0.001", async function () {
    await expect(
      voter.castVote(1, { value: ethers.parseEther("0.001") })
    ).to.be.revertedWithCustomError(voter, "InvalidVoteAmount");
  });
  it("should not allow an id to vote twice", async function () {
    await voter
      .connect(user1)
      .castVote(2, { value: ethers.parseEther("0.01") });
    await expect(
      voter.connect(user1).castVote(2, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(voter, "VoteAlreadyCast");
  });
  it("should allow owner to withdraw funds", async function () {
    await voter
      .connect(user1)
      .castVote(1, { value: ethers.parseEther("0.01") });
    await expect(voter.withdraw())
      .to.emit(voter, "Withdrawn")
      .withArgs(ethers.parseEther("0.01"));
  });
  it("should not allow non-owner to withdraw funds", async function () {
    await voter
      .connect(user1)
      .castVote(1, { value: ethers.parseEther("0.01") });
    await expect(voter.connect(user1).withdraw())
      .to.be.revertedWithCustomError(voter, "OwnableUnauthorizedAccount")
      .withArgs(user1.getAddress());
  });
  it("should return voters when getter for voters is called", async function () {
    await voter
      .connect(user1)
      .castVote(2, { value: ethers.parseEther("0.01") });
    const voters = await voter.getAllVotes(10);
    expect(voters[1]).to.equal(await user1.getAddress());
  });
  it("should allow owner to add acceptable id", async function () {
    await expect(voter.addAcceptableId(7))
      .to.emit(voter, "VoteIdAdded")
      .withArgs(7);
    const newVote = await voter
      .connect(user1)
      .castVote(7, { value: ethers.parseEther("0.01") });
    expect(newVote)
      .to.emit(voter, "Voter__Cast")
      .withArgs(7, await user1.getAddress());
  });
  it("should allow owner to remove acceptable id", async function () {
    await voter.removeAcceptableId(2);
    await expect(
      voter.connect(user1).castVote(2, { value: ethers.parseEther("0.01") })
    ).to.be.revertedWithCustomError(voter, "InvalidVoteId");
  });
  it("should not allow non-owner to add an id", async function () {
    await expect(
      voter.connect(user1).addAcceptableId(8)
    ).to.be.revertedWithCustomError(voter, "OwnableUnauthorizedAccount");
  });
  it("should not allow non-owner to remove an id", async function () {
    await expect(
      voter.connect(user1).removeAcceptableId(3)
    ).to.be.revertedWithCustomError(voter, "OwnableUnauthorizedAccount");
  });
  it("should pause the contract when paused", async function () {
    await expect(voter.pause())
      .to.emit(voter, "Paused");
    expect(await voter.paused()).to.be.true;
  });
  it("should not allow voting when paused", async function () {
    await voter.pause();
    expect(await voter.connect(user1).castVote(1, { value: ethers.parseEther("0.01") })).to.be.revertedWith("Voting is paused");
  });
});
