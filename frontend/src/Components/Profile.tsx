import { useReadContract, useWriteContract } from "wagmi"
import { VOTER_CONTRACT_ADDRESS, VOTER_CONTRACT_ABI } from "../constants"
import {ConnectWallet} from "./buttonComponent.tsx"
export function Profile() {
  // Read all votes (example: for 5 IDs)
  const { data: allVotes } = useReadContract({
    address: VOTER_CONTRACT_ADDRESS,
    abi: VOTER_CONTRACT_ABI,
    functionName: "getAllVotes",
    args: [5],
  })

  const { writeContract } = useWriteContract()

  const handleVote = (id: number) => {
    writeContract({
      address: VOTER_CONTRACT_ADDRESS,
      abi: VOTER_CONTRACT_ABI,
      functionName: "castVote",
      args: [id],
      value: BigInt(10 ** 16), // 0.01 ether in wei
    })
  }

  return (
    <div>
      <ConnectWallet/>
      <h2>Votes:</h2>
      <ul>
         {/* @ts-ignore */}
        {allVotes?.map((voter, idx) => (
          <li key={idx}>
            ID {idx}: {voter === "0x0000000000000000000000000000000000000000" ? "No vote yet" : voter}
          </li>
        ))}
      </ul>

      <h3>Cast your vote:</h3>
      {[1, 2, 3, 4, 5].map((id) => (
        <button key={id} onClick={() => handleVote(id)}>
          Vote for ID {id}
        </button>
      ))}
    </div>
  )
}
