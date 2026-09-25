// Lean compiler output
// Module: CertificateCore.FFI
// Imports: public import Init public meta import Init public import CertificateCore.SpectralContraction
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
lean_object* l_Nat_cast___at___00Dyadic_toRat_spec__0(lean_object*);
lean_object* l_Rat_mul(lean_object*, lean_object*);
lean_object* l_Rat_sub(lean_object*, lean_object*);
static lean_once_cell_t lp_certificate_x2dcore_CertificateCore_FFI_factor___closed__0_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_certificate_x2dcore_CertificateCore_FFI_factor___closed__0;
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_FFI_factor(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_FFI_factor___boxed(lean_object*, lean_object*);
static lean_object* _init_lp_certificate_x2dcore_CertificateCore_FFI_factor___closed__0(void){
_start:
{
lean_object* v___x_1_; lean_object* v___x_2_; 
v___x_1_ = lean_unsigned_to_nat(1u);
v___x_2_ = l_Nat_cast___at___00Dyadic_toRat_spec__0(v___x_1_);
return v___x_2_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_FFI_factor(lean_object* v_alpha_3_, lean_object* v_lambda2_4_){
_start:
{
lean_object* v___x_5_; lean_object* v___x_6_; lean_object* v___x_7_; lean_object* v___x_8_; 
v___x_5_ = lean_obj_once(&lp_certificate_x2dcore_CertificateCore_FFI_factor___closed__0, &lp_certificate_x2dcore_CertificateCore_FFI_factor___closed__0_once, _init_lp_certificate_x2dcore_CertificateCore_FFI_factor___closed__0);
v___x_6_ = l_Rat_mul(v_alpha_3_, v_lambda2_4_);
v___x_7_ = l_Rat_sub(v___x_5_, v___x_6_);
lean_inc_ref(v___x_7_);
v___x_8_ = l_Rat_mul(v___x_7_, v___x_7_);
lean_dec_ref(v___x_7_);
return v___x_8_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_FFI_factor___boxed(lean_object* v_alpha_9_, lean_object* v_lambda2_10_){
_start:
{
lean_object* v_res_11_; 
v_res_11_ = lp_certificate_x2dcore_CertificateCore_FFI_factor(v_alpha_9_, v_lambda2_10_);
lean_dec_ref(v_alpha_9_);
return v_res_11_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_SpectralContraction(uint8_t builtin);
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_certificate_x2dcore_CertificateCore_FFI(uint8_t builtin) {
lean_object * res;
if (_G_initialized) return lean_io_result_mk_ok(lean_box(0));
_G_initialized = true;
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_certificate_x2dcore_CertificateCore_SpectralContraction(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
