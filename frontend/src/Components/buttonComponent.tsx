import { useConnect, useAccount } from "wagmi"
import { injected } from "wagmi/connectors"

export function ConnectWallet() {
  const { connect } = useConnect()
  const { address, isConnected } = useAccount()

  if (isConnected) {
    return <p>Connected: {address}</p>
  }

  return (
    <button
      onClick={() =>
        connect({
          connector: injected(), // Use MetaMask / injected wallet
        })
      }
    >
      Connect Wallet
    </button>
  )
}
