import { NetworkErrorMessage } from ".NetworkerrorMessage";

export function ConnectWallet({connectWallet, networkError, dismiss}) {
  return (
    <>
      <div>
        {networkError && (
          <NetworkErrorMessage message={networkError} dismiss={dismiss} />
        )}
      </div>

      <p>Connect your Wallet</p>
      <button type="button" onClick={connectWallet}>
        Connect wallet!
      </button>
    </>
  )
}