#!/usr/bin/env node

import { spawnSync } from "node:child_process"

const summaryId = "text-engine-wasm-toolchain-diagnostic-v1"

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
  diagnosticKind: "package-local-wasm-toolchain",
  diagnosticExitPolicy: "always-zero",
  rootCheckRequiresWasmPack: false,
  rootCheckRequiresWasmTarget: false,
  acceptedBuildPath: "wasm-pack",
  acceptedArtifactPath: "packages/text-engine-rust-wasm/pkg/flowdoc_text_engine_bg.wasm",
  commands: {
    cargoVersion,
    rustupTargets,
    wasmPackVersion,
    wasmBindgenVersion,
  },
  installedRustTargets: installedTargets,
  wasmPackAvailable: wasmPackVersion.available,
  wasmBindgenCliAvailable: wasmBindgenVersion.available,
  wasm32UnknownUnknownInstalled,
  toolchainReady,
  canProduceArtifactNow: toolchainReady,
  artifactProductionBlocked: !toolchainReady,
  artifactProduced: false,
  digestStatus: "pending",
  sha256: null,
  rawEvidenceIncluded: false,
  blockedReasons: [
    ...(wasmPackVersion.available ? [] : ["wasm-pack-not-available"]),
    ...(wasm32UnknownUnknownInstalled ? [] : ["wasm32-unknown-unknown-target-not-installed"]),
  ],
}

process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`)
process.exitCode = 0
