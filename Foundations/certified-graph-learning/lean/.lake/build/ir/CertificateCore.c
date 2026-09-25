// Lean compiler output
// Module: CertificateCore
// Imports: public import Init public meta import Init public import CertificateCore.Vector public import CertificateCore.Matrix public import CertificateCore.GraphLaplacian public import CertificateCore.SpectralContraction public import CertificateCore.FFI
#include <lean/lean.h>
#if defined(__clang__)
#pragma clang diagnostic ignored "-Wunused-parameter"
#pragma clang diagnostic ignored "-Wunused-label"
#elif defined(__GNUC__) && !defined(__CLANG__)
#pragma GCC diagnostic ignored "-Wunused-parameter"
#pragma GCC diagnostic ignored "-Wunused-label"
#pragma GCC diagnostic ignored "-Wunused-but-set-variable"
#endif
#ifdef __cplusplus
extern "C" {
#endif
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_Vector(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_Matrix(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_GraphLaplacian(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_SpectralContraction(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_FFI(uint8_t builtin);
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_certificate_x2dcore_CertificateCore(uint8_t builtin) {
lean_object * res;
if (_G_initialized) return lean_io_result_mk_ok(lean_box(0));
_G_initialized = true;
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_certificate_x2dcore_CertificateCore_Vector(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_certificate_x2dcore_CertificateCore_Matrix(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_certificate_x2dcore_CertificateCore_GraphLaplacian(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_certificate_x2dcore_CertificateCore_SpectralContraction(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_certificate_x2dcore_CertificateCore_FFI(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
