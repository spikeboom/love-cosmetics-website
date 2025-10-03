import crypto from "crypto";

export function createLogger() {
  const logHash = crypto.randomBytes(4).toString("hex");
  // @ts-expect-error
  return (message, data) => {
    if (process.env.STAGE === "LOCAL") {
      console.dir({ logHash, message, data }, { depth: null, colors: true });
    } else {
      console.log(
        JSON.stringify({ logHash, message, data }, null, 0), // Gera uma única linha de log
      );
    }
  };
}
