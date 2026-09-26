#!/usr/bin/env node
// Schema validation test for Bitcoin anchor schemas

const Ajv = require('ajv')
const addFormats = require('ajv-formats')
const fs = require('fs')
const path = require('path')

// Use AJV with validateSchema disabled to avoid meta-schema issues
const ajv = new Ajv({ strict: false, allErrors: true, validateSchema: false })
addFormats(ajv)

const schemasDir = path.join(__dirname, '../schemas')
const examplesDir = path.join(__dirname, '../examples')

// Load schemas
const receiptSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'receipt.schema.json'), 'utf8'))
const batchHeaderSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'batchheader.schema.json'), 'utf8'))
const anchorProofSchema = JSON.parse(fs.readFileSync(path.join(schemasDir, 'anchorproof.schema.json'), 'utf8'))

// Load examples
const receiptExample = JSON.parse(fs.readFileSync(path.join(examplesDir, 'receipt.example.json'), 'utf8'))
const batchHeaderExample = JSON.parse(fs.readFileSync(path.join(examplesDir, 'batchheader.example.json'), 'utf8'))
const anchorProofExample = JSON.parse(fs.readFileSync(path.join(examplesDir, 'anchorproof.example.json'), 'utf8'))

// Compile validators
const validateReceipt = ajv.compile(receiptSchema)
const validateBatchHeader = ajv.compile(batchHeaderSchema)
const validateAnchorProof = ajv.compile(anchorProofSchema)

let allValid = true

// Validate receipt
console.log('Testing Receipt schema...')
if (validateReceipt(receiptExample)) {
  console.log('  ✅ Receipt example is valid')
} else {
  console.log('  ❌ Receipt example is invalid:')
  console.log(validateReceipt.errors)
  allValid = false
}

// Validate batch header
console.log('Testing BatchHeader schema...')
if (validateBatchHeader(batchHeaderExample)) {
  console.log('  ✅ BatchHeader example is valid')
} else {
  console.log('  ❌ BatchHeader example is invalid:')
  console.log(validateBatchHeader.errors)
  allValid = false
}

// Validate anchor proof
console.log('Testing AnchorProof schema...')
if (validateAnchorProof(anchorProofExample)) {
  console.log('  ✅ AnchorProof example is valid')
} else {
  console.log('  ❌ AnchorProof example is invalid:')
  console.log(validateAnchorProof.errors)
  allValid = false
}

// Test invalid data
console.log('\nTesting schema rejection of invalid data...')

// Invalid receipt (missing required field)
const invalidReceipt = { ...receiptExample }
delete invalidReceipt.version
if (!validateReceipt(invalidReceipt)) {
  console.log('  ✅ Schema correctly rejects receipt missing version field')
} else {
  console.log('  ❌ Schema should reject invalid receipt')
  allValid = false
}

// Invalid batch header (wrong network_id)
const invalidBatchHeader = { ...batchHeaderExample, network_id: 5 }
if (!validateBatchHeader(invalidBatchHeader)) {
  console.log('  ✅ Schema correctly rejects invalid network_id')
} else {
  console.log('  ❌ Schema should reject invalid network_id')
  allValid = false
}

// Invalid anchor proof (invalid hex pattern)
const invalidAnchorProof = { ...anchorProofExample, txid: 'not-hex' }
if (!validateAnchorProof(invalidAnchorProof)) {
  console.log('  ✅ Schema correctly rejects invalid txid format')
} else {
  console.log('  ❌ Schema should reject invalid txid format')
  allValid = false
}

console.log('\n' + '='.repeat(50))
if (allValid) {
  console.log('✅ All schema validation tests passed!')
  process.exit(0)
} else {
  console.log('❌ Some schema validation tests failed')
  process.exit(1)
}
