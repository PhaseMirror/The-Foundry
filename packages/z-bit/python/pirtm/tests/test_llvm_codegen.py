"""
PIRTM Phase 4: MLIR to LLVM Code Generation Tests
"""
import unittest
from unittest.mock import patch, MagicMock
import os
import tempfile
from pirtm.mlir.llvm_codegen import LLVMCodeGenerator

class LLVMCodeGeneratorTest(unittest.TestCase):
    @patch('pirtm.mlir.llvm_codegen.subprocess.run')
    def test_mlir_to_llvm_ir_conversion(self, mock_subprocess_run):
        # A simple MLIR module implementing a function that adds two numbers
        mlir_code = """
        module {
          func.func @add(%arg0: i32, %arg1: i32) -> i32 {
            %1 = arith.addi %arg0, %arg1 : i32
            return %1 : i32
          }
        }
        """

        # Mock the behavior of subprocess.run
        mock_process = MagicMock()
        mock_process.returncode = 0
        mock_process.stdout = """
        define i32 @add(i32 %arg0, i32 %arg1) {
          %2 = add i32 %arg0, %arg1
          ret i32 %2
        }
        """
        mock_subprocess_run.return_value = mock_process

        # We also need to patch the constructor's verification call
        with patch.object(LLVMCodeGenerator, '_verify_tools', return_value=None):
            codegen = LLVMCodeGenerator()
            try:
                llvm_ir = codegen.mlir_to_llvm_ir(mlir_code)
                self.assertIn("define i32 @add(i32 %arg0, i32 %arg1)", llvm_ir)
                self.assertIn("add i32 %arg0, %arg1", llvm_ir)
            except RuntimeError as e:
                self.fail(f"MLIR to LLVM IR conversion failed with: {e}")

    @patch('pirtm.mlir.llvm_codegen.subprocess.run')
    def test_lowering_pirtm_sigmoid_and_clip(self, mock_subprocess_run):
        """
        Test that MLIR containing pirtm.sigmoid and pirtm.clip is lowered to LLVM IR (runtime call or pattern).
        """
        mlir_code = '''
        module {
          func.func @test_sigmoid_clip(%x: tensor<?xf64>) -> tensor<?xf64> {
            %s = "pirtm.sigmoid"(%x) : (tensor<?xf64>) -> tensor<?xf64>
            %c = "pirtm.clip"(%s) { bound_low = -1.0 : f64, bound_high = 1.0 : f64 } : (tensor<?xf64>) -> tensor<?xf64>
            return %c : tensor<?xf64>
          }
        }
        '''
        # Mock subprocess.run to simulate lowering
        mock_process = MagicMock()
        mock_process.returncode = 0
        mock_process.stdout = """
        define void @test_sigmoid_clip() {
          ; call @pirtm_sigmoid
          ; call @pirtm_clip
          ret void
        }
        """
        mock_subprocess_run.return_value = mock_process
        with patch.object(LLVMCodeGenerator, '_verify_tools', return_value=None):
            codegen = LLVMCodeGenerator()
            llvm_ir = codegen.mlir_to_llvm_ir(mlir_code)
            self.assertIn("@pirtm_sigmoid", llvm_ir)
            self.assertIn("@pirtm_clip", llvm_ir)

if __name__ == '__main__':
    unittest.main()
