import { runItemPreviewTests } from "./item-preview.test.ts";
import { runSearchExplainTests } from "./search-explain.test.ts";

function main() {
  runSearchExplainTests();
  runItemPreviewTests();
  process.stdout.write("Tests passed\n");
}

main();
