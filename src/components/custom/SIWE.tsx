import { BrowserProvider, SignatureLike, verifyMessage } from "ethers";
import { SiweMessage } from "siwe";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/appStore";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";
import SIWEIcon from "@/assets/siwe.svg";

export const SIWE = () => {
  const setAuthenticated = useAppStore().setAuthenticated;
  const scheme = window.location.protocol.slice(0, -1);
  const domain = window.location.host;
  const origin = window.location.origin;
  if (!window.ethereum) {
    console.error(
      "No Ethereum provider found. Make sure you have a wallet installed.",
    );
    toast("No Ethereum provider found. Make sure you have a wallet installed.");
  }
  const provider = new BrowserProvider(window.ethereum);

  const createSiweMessage = (address?: string, statement?: string) => {
    const message = new SiweMessage({
      scheme,
      domain,
      address,
      statement,
      uri: origin,
      version: "1",
      chainId: 1,
    });
    return message.prepareMessage();
  };

  const connectWallet = () => {
    provider
      .send("eth_requestAccounts", [])
      .then(() => {
        console.info("INFO: user approved request.");
        toast("INFO: user approved request.");
      })
      .catch(() => {
        console.error("ERROR: user rejected request.");
        toast("Wallet connection request rejected.", {
          description: `It is possible that you need to either unlock your wallet or approve the connection. ${formatDate(Date.now().toString(), false)}`,
        });
      });
  };

  const signInWithEthereum = async () => {
    const signer = await provider.getSigner();
    const message = createSiweMessage(
      signer.address,
      "Sign in with Ethereum to the app.",
    );
    signer
      .signMessage(message)
      .then((signature) => {
        verifySignature({ message, address: signer.address, signature });
        setAuthenticated(true);
      })
      .catch((error) => {
        console.error("ERROR: signing failed", error);
        toast("ERROR: signing failed", error);
      });
  };

  const verifySignature = async ({
    message,
    address,
    signature,
  }: {
    message: Uint8Array | string;
    address: string;
    signature: SignatureLike;
  }) => {
    try {
      const signerAddr = verifyMessage(message, signature);
      return (
        signerAddr === address &&
        signerAddr === import.meta.env.VITE_ALLOWED_ETH_ACCOUNT
      );
    } catch (err) {
      console.error(err);
      toast("ERROR: signature verification failed");
      return false;
    }
  };
  return (
    <div className="flex justify-between gap-2">
      <Button onClick={connectWallet}>Connect Wallet</Button>
      <Button onClick={signInWithEthereum} variant="secondary">
        <img src={SIWEIcon} alt="SIWE Icon" className="h-5 w-5 pr-2" />
        <p>Sign in with Ethereum</p>
      </Button>
    </div>
  );
};
