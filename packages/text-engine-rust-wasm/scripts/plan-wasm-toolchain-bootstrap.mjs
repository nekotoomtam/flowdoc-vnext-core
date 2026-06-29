#!/usr/bin/env node

import { spawnSync } from "node:child_process"

const summaryId = "text-engine-wasm-toolchain-provisioning-bootstrap-v1"
const acceptedArtifactPath = "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm"
const wasmPackProvisioningCommand = "cargo install wasm-pack --locked"
const wasmTargetProvisioningCommand = "rustup target add wasm32-unknown-unknown"

function normalizeOutput(value) {
  const text = value == null ? "" : String(value).trim()
  return text.length === 0 ? null : text
}

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: false,
  })

  if (result.error != null) {
    return {
      command,
      args,
      available: false,
      exitCode: null,
      stdout: null,
      stderr: normalizeOutput(result.error.message),
      errorCode: result.error.code ?? "unknown-error",
    }
  }

  return {
    command,
    args,
    available: result.status === 0,
    exitCode: result.status,
    stdout: normalizeOutput(result.stdout),
    stderr: normalizeOutput(result.stderr),
    errorCode: null,
  }
}

function installedTargetsFrom(result) {
  if (result.stdout == null) return []
  return result.stdout
    .split(/\r?\n/u)
    .map((target) => target.trim())
    .filter((target) => target.length > 0)
}

const rustcVersion = run("rustc", ["--version"])
const cargoVersion = run("cargo", ["--version"])
const rustupTargets = run("rustup", ["target", "list", "--installed"])
const wasmPackVersion = run("wasm-pack", ["--version"])
const wasmBindgenVersion = run("wasm-bindgen", ["--version"])
const installedTargets = installedTargetsFrom(rustupTargets)
const wasm32UnknownUnknownInstalled = installedTargets.includes("wasm32-unknown-unknown")
const toolchainReady = wasmPackVersion.available && wasm32UnknownUnknownInstalled

const summary = {
  summaryId,
  owner: "@flowdoc/text-engine-rust-wasm",
  bootstrapKind: "package-local-wasm-toolchain-provisioning-bootstrap",
  bootstrapExitPolicy: "always-zero",
  mode: "plan-and-check-only",
  sourceAvailabilityScript: "packages/text-engine-rust-wasm/scripts/check-wasm-toolchain.mjs",
  sourceAvailabilityCommand: "npm run wasm:readiness-smoke",
  acceptedArtifactPath,
  acceptedBuildPath: "wasm-pack",
  provisioningDecision: {
    strategy: "developer-or-ci-bootstrap",
    installExecuted: false,
    scriptInstallsTooling: false,
    packageLocalOnly: true,
    rootCheckDependency: false,
    cachedBinaryAllowed: true,
    pinnedCiImageAllowed: true,
    defaultNetworkCommandRequiresApproval: true,
  },
  acceptedProvisioning: {
    wasmPack: {
      path: "cargo-install-locked",
      command: wasmPackProvisioningCommand,
      alternatePaths: ["pinned-ci-image", "internal-tool-cache", "preinstalled-developer-toolchain"],
      currentStatus: wasmPackVersion.available ? "available-unpinned" : "missing",
      requiredBeforeArtifactProduction: true,
    },
    wasm32UnknownUnknown: {
      path: "rustup-target-add",
      command: wasmTargetProvisioningCommand,
      alternatePaths: ["pinned-ci-image", "preinstalled-developer-toolchain"],
      currentStatus: wasm32UnknownUnknownInstalled ? "installed" : "missing",
      requiredBeforeArtifactProduction: true,
    },
  },
  versionPolicy: {
    wasmPack: {
      captureCommand: "wasm-pack --version",
      currentVersion: wasmPackVersion.stdout,
      status: wasmPackVersion.available ? "available-pending-pin" : "pending-until-installed",
      pinExactVersionBeforeArtifactProduction: true,
    },
    rustc: {
      captureCommand: "rustc --version",
      currentVersion: rustcVersion.stdout,
      status: rustcVersion.available ? "observed" : "missing",
      recordBeforeArtifactProduction: true,
    },
    cargo: {
      captureCommand: "cargo --version",
      currentVersion: cargoVersion.stdout,
      status: cargoVersion.available ? "observed" : "missing",
      recordBeforeArtifactProduction: true,
    },
    rustTarget: {
      captureCommand: "rustup target list --installed",
      target: "wasm32-unknown-unknown",
      installedTargets,
      status: wasm32UnknownUnknownInstalled ? "installed" : "missing",
      requiredBeforeArtifactProduction: true,
    },
  },
  commands: {
    rustcVersion,
    cargoVersion,
    rustupTargets,
    wasmPackVersion,
    wasmBindgenVersion,
  },
  availability: {
    rustcAvailable: rustcVersion.available,
    cargoAvailable: cargoVersion.available,
    rustupAvailable: rustupTargets.available,
    wasmPackAvailable: wasmPackVersion.available,
    wasmBindgenCliAvailable: wasmBindgenVersion.available,
    wasm32UnknownUnknownInstalled,
    toolchainReady,
  },
  rootCheck: {
    requiresWasmPack: false,
    requiresWasm32UnknownUnknown: false,
    requiresBootstrapPlan: false,
    requiresArtifact: false,
    requiresWasmBuild: false,
  },
  artifactProductionBlocked: !toolchainReady,
  digestPinningBlocked: true,
  artifactProduced: false,
  digestStatus: "pending",
  sha256: null,
  rawEvidenceIncluded: false,
  blockedReasons: [
    ...(wasmPackVersion.available ? [] : ["wasm-pack-not-available"]),
    ...(wasmPackVersion.available ? ["wasm-pack-version-not-yet-accepted-for-artifact-production"] : ["wasm-pack-version-unpinned"]),
    ...(wasm32UnknownUnknownInstalled ? [] : ["wasm32-unknown-unknown-target-not-installed"]),
    "accepted-artifact-path-not-produced",
    "sha256-not-computed",
  ],
}

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
process.exitCode = 0
