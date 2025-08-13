import { 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt, 
  useWatchContractEvent 
} from "wagmi"
import { VOTER_CONTRACT_ADDRESS, VOTER_CONTRACT_ABI } from "../constants"
import { ConnectWallet } from "./buttonComponent.tsx"
import { useState } from "react"

export function Profile() {
  const [hash, setHash] = useState<`0x${string}` | undefined>()
  const [idForVote, setIdForVote] = useState<number>(0)
  // Read all votes
  const { data: allVotes, refetch } = useReadContract({
    address: VOTER_CONTRACT_ADDRESS,
    abi: VOTER_CONTRACT_ABI,
    functionName: "getAllVotes",
    args: [5],
  })

  // Write to contract
  const { writeContractAsync } = useWriteContract()

  // Track tx confirmation
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Listen for VoteCast events
  useWatchContractEvent({
    address: VOTER_CONTRACT_ADDRESS,
    abi: VOTER_CONTRACT_ABI,
    eventName: "VoteCast",
    onLogs(logs) {
      console.log("VoteCast event:", logs)
      refetch() // refresh votes list
    },
  })

  // Trigger vote
  const handleVote = async (id: number) => {
    try {
      const txHash = await writeContractAsync({
        address: VOTER_CONTRACT_ADDRESS,
        abi: VOTER_CONTRACT_ABI,
        functionName: "castVote",
        args: [id],
        value: BigInt(10 ** 16),
      })
      setHash(txHash)
    } catch (error) {
      console.error("Vote transaction failed:", error)
    }
  }

  return (
    <div>
      <ConnectWallet />

      <h2>Votes:</h2>
      {isLoading && <p>Transaction pending...</p>}
      {isSuccess && <p>Vote confirmed ✅</p>}

      <ul>
        {/* @ts-ignore */}
        {allVotes?.map((voter, idx) => (
          <li key={idx}>
            ID {idx}:{" "}
            {voter === "0x0000000000000000000000000000000000000000"
              ? "No vote yet"
              : voter}
          </li>
        ))}
      </ul>

      <h3>Cast your vote:</h3>
      <form action="" onSubmit={(e) => {
        e.preventDefault();
        handleVote(idForVote)
      }}>

        <input
          type="number"
          value={idForVote}
          onChange={(e) => setIdForVote(Number(e.target.value))}
        />
        <br />
      <button style={{marginTop:10}}>Vote {idForVote}</button>
      </form>
    </div>
  )
}
