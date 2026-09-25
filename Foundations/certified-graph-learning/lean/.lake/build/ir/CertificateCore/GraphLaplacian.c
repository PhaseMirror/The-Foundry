// Lean compiler output
// Module: CertificateCore.GraphLaplacian
// Imports: public import Init public meta import Init public import CertificateCore.Matrix
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
lean_object* lp_certificate_x2dcore_CertificateCore_Mat_mulVec___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_Vec_smul___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_Vec_vsub___redArg(lean_object*, lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___boxed(lean_object*, lean_object*, lean_object*);
lean_object* l_Rat_neg(lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_Mat_madd___redArg(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_GraphLaplacian_heatStep(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_GraphLaplacian_heatStepMatrix(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_GraphLaplacian_heatStep(lean_object* v_n_1_, lean_object* v_G_2_, lean_object* v_alpha_3_, lean_object* v_u_4_, lean_object* v_a_5_){
_start:
{
lean_object* v___x_6_; lean_object* v___x_7_; lean_object* v___x_8_; 
lean_inc_ref(v_u_4_);
lean_inc(v_n_1_);
v___x_6_ = lean_alloc_closure((void*)(lp_certificate_x2dcore_CertificateCore_Mat_mulVec___boxed), 4, 3);
lean_closure_set(v___x_6_, 0, v_n_1_);
lean_closure_set(v___x_6_, 1, v_G_2_);
lean_closure_set(v___x_6_, 2, v_u_4_);
v___x_7_ = lean_alloc_closure((void*)(lp_certificate_x2dcore_CertificateCore_Vec_smul___boxed), 4, 3);
lean_closure_set(v___x_7_, 0, v_n_1_);
lean_closure_set(v___x_7_, 1, v_alpha_3_);
lean_closure_set(v___x_7_, 2, v___x_6_);
v___x_8_ = lp_certificate_x2dcore_CertificateCore_Vec_vsub___redArg(v_u_4_, v___x_7_, v_a_5_);
return v___x_8_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_GraphLaplacian_heatStepMatrix(lean_object* v_n_9_, lean_object* v_G_10_, lean_object* v_alpha_11_, lean_object* v_a_12_, lean_object* v_a_13_){
_start:
{
lean_object* v___x_14_; lean_object* v___x_15_; lean_object* v___x_16_; lean_object* v___x_17_; 
lean_inc(v_n_9_);
v___x_14_ = lean_alloc_closure((void*)(lp_certificate_x2dcore_CertificateCore_Mat_id___boxed), 3, 1);
lean_closure_set(v___x_14_, 0, v_n_9_);
v___x_15_ = l_Rat_neg(v_alpha_11_);
v___x_16_ = lean_alloc_closure((void*)(lp_certificate_x2dcore_CertificateCore_Mat_smul___boxed), 5, 3);
lean_closure_set(v___x_16_, 0, v_n_9_);
lean_closure_set(v___x_16_, 1, v___x_15_);
lean_closure_set(v___x_16_, 2, v_G_10_);
v___x_17_ = lp_certificate_x2dcore_CertificateCore_Mat_madd___redArg(v___x_14_, v___x_16_, v_a_12_, v_a_13_);
return v___x_17_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_Matrix(uint8_t builtin);
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_certificate_x2dcore_CertificateCore_GraphLaplacian(uint8_t builtin) {
lean_object * res;
if (_G_initialized) return lean_io_result_mk_ok(lean_box(0));
_G_initialized = true;
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_certificate_x2dcore_CertificateCore_Matrix(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
