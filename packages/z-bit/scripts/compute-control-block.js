#!/usr/bin/env node
// Control block computation for two-leaf Taproot tree
// Usage: node compute-control-block.js
// Set environment variables: I_XONLY, ADMIN_XONLY, ANCHOR_ROOT_HEX

// npm install tapscript
const { Tap, Script } = require('tapscript')

// Inputs you already know
const I_XONLY = Buffer.from(process.env.I_XONLY || 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'hex')         // 32B
const ADMIN_XONLY = Buffer.from(process.env.ADMIN_XONLY || 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 'hex') // 32B
const H = Buffer.from(process.env.ANCHOR_ROOT_HEX || 'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc', 'hex')       // 32B

// Leaf A: sha256(H) -> OP_SHA256 <H> OP_EQUAL
const leafA = Script.encode(['OP_SHA256', H, 'OP_EQUAL'])

// Leaf B: and_v(v:older(6),pk(admin))
const leafB = Script.encode(['OP_CHECKSEQUENCEVERIFY', 6, 'OP_DROP', ADMIN_XONLY, 'OP_CHECKSIG'])

// Build tree with two leaves; target = leafA for proofs
const target = Tap.tree.getLeaf(leafA)
const tree = [leafA, leafB] // Tap will balance

const [tapkey, cblock] = Tap.getPubKey(I_XONLY, { tree, target })

console.log(JSON.stringify({
  controlBlock: cblock.toString('hex'),
  outputKey: Buffer.from(tapkey).toString('hex')
}, null, 2))
