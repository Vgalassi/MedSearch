import { cpSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const backendDirectory = resolve(scriptDirectory, "..");
const source = resolve(backendDirectory, "src", "infra", "generated", "prisma");
const destination = resolve(backendDirectory, "dist", "infra", "generated", "prisma");

mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true, force: true });
