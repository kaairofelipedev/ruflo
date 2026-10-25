import { pathToFileURL } from "node:url";

export function isDirectRun(moduleUrl, entry = process.argv[1]) {
  if (!entry) return false;
  return moduleUrl === pathToFileURL(entry).href;
}
