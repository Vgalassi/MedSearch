import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { X509Certificate } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { networkInterfaces } from "node:os";
import { generate } from "selfsigned";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const certificateDirectory = resolve(scriptDirectory, "..", "certs");
const keyPath = resolve(certificateDirectory, "localhost-key.pem");
const certificatePath = resolve(certificateDirectory, "localhost-cert.pem");
const localIpAddresses = Object.values(networkInterfaces())
  .flatMap((addresses) => addresses ?? [])
  .filter((address) => address.family === "IPv4" && !address.internal)
  .map((address) => address.address);

if (existsSync(keyPath) && existsSync(certificatePath)) {
  const currentCertificate = new X509Certificate(readFileSync(certificatePath));
  const containsEveryLocalIp = localIpAddresses.every((ip) =>
    currentCertificate.subjectAltName?.includes(`IP Address:${ip}`),
  );

  if (containsEveryLocalIp) {
    process.exit(0);
  }
}

mkdirSync(certificateDirectory, { recursive: true });

const notAfterDate = new Date();
notAfterDate.setFullYear(notAfterDate.getFullYear() + 10);

const certificate = await generate(
  [{ name: "commonName", value: "localhost" }],
  {
    algorithm: "sha256",
    keySize: 2048,
    notAfterDate,
    extensions: [
      { name: "basicConstraints", cA: false, critical: true },
      { name: "keyUsage", digitalSignature: true, keyEncipherment: true, critical: true },
      { name: "extKeyUsage", serverAuth: true },
      {
        name: "subjectAltName",
        altNames: [
          { type: 2, value: "localhost" },
          { type: 7, ip: "127.0.0.1" },
          ...localIpAddresses.map((ip) => ({ type: 7, ip })),
        ],
      },
    ],
  },
);

writeFileSync(keyPath, certificate.private, { mode: 0o600 });
writeFileSync(certificatePath, certificate.cert);

console.log(`Certificado HTTPS local criado em ${certificateDirectory}`);
