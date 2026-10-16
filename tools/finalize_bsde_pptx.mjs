import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const SKILL_DIR = "/Users/agatbe/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations";
const workspaceDir = "/Users/agatbe/Claude Project/Claude Vibecode (NiFi)";
const candidatePath = path.join(workspaceDir, "output/BSDE - Credit Analysis PPT FIXED v3.pptx");
const finalPath = path.join(workspaceDir, "output/BSDE - Credit Analysis PPT FINAL.pptx");
const stagingDir = path.join(workspaceDir, ".codex-finalizer");

await fs.mkdir(stagingDir, { recursive: true });

const { finalizePresentation } = await import(pathToFileURL(
  path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs"),
).href);

const result = await finalizePresentation({
  workspaceDir,
  candidatePath,
  finalPath,
  explicitTotalSlideCount: 4,
  sourceTemplatePath: "/Users/agatbe/BCA Internship/Credit - Analysis/HRTA - Credit Analysis PPT.pptx",
  requiredNativeTableOwnerSlides: [2],
  requiredNativeChartOwnerSlides: [],
  pythonExecutable: "/Users/agatbe/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3",
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: [
    "--expected-slide-size-emu", "12192000,6858000",
    "--validate-bullet-geometry",
    "--validate-heading-fit",
    "--require-native-table-slide", "2",
  ],
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "BSDE - Credit Analysis PPT FINAL.validation.json"),
});

console.log(JSON.stringify(result, null, 2));
