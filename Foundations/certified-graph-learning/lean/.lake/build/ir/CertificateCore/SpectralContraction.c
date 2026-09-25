// Lean compiler output
// Module: CertificateCore.SpectralContraction
// Imports: public import Init public meta import Init public import CertificateCore.GraphLaplacian
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
uint8_t lean_nat_dec_eq(lean_object*, lean_object*);
lean_object* lean_nat_sub(lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_GraphLaplacian_heatStep(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
lean_object* l_Nat_cast___at___00Dyadic_toRat_spec__0(lean_object*);
lean_object* l_Rat_mul(lean_object*, lean_object*);
lean_object* l_Rat_sub(lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_Vec_meanZero(lean_object*, lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_Vec_inner(lean_object*, lean_object*, lean_object*);
static lean_once_cell_t lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor___closed__0_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor___closed__0;
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_energy(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_heatSteps___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_heatSteps(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
static lean_object* _init_lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor___closed__0(void){
_start:
{
lean_object* v___x_1_; lean_object* v___x_2_; 
v___x_1_ = lean_unsigned_to_nat(1u);
v___x_2_ = l_Nat_cast___at___00Dyadic_toRat_spec__0(v___x_1_);
return v___x_2_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor(lean_object* v_alpha_3_, lean_object* v_lambda2_4_){
_start:
{
lean_object* v___x_5_; lean_object* v___x_6_; lean_object* v___x_7_; lean_object* v___x_8_; 
v___x_5_ = lean_obj_once(&lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor___closed__0, &lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor___closed__0_once, _init_lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor___closed__0);
v___x_6_ = l_Rat_mul(v_alpha_3_, v_lambda2_4_);
v___x_7_ = l_Rat_sub(v___x_5_, v___x_6_);
lean_inc_ref(v___x_7_);
v___x_8_ = l_Rat_mul(v___x_7_, v___x_7_);
lean_dec_ref(v___x_7_);
return v___x_8_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor___boxed(lean_object* v_alpha_9_, lean_object* v_lambda2_10_){
_start:
{
lean_object* v_res_11_; 
v_res_11_ = lp_certificate_x2dcore_CertificateCore_SpectralContraction_factor(v_alpha_9_, v_lambda2_10_);
lean_dec_ref(v_alpha_9_);
return v_res_11_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_energy(lean_object* v_n_12_, lean_object* v_u_13_){
_start:
{
lean_object* v___x_14_; lean_object* v___x_15_; 
lean_inc(v_n_12_);
v___x_14_ = lean_alloc_closure((void*)(lp_certificate_x2dcore_CertificateCore_Vec_meanZero), 3, 2);
lean_closure_set(v___x_14_, 0, v_n_12_);
lean_closure_set(v___x_14_, 1, v_u_13_);
lean_inc_ref(v___x_14_);
v___x_15_ = lp_certificate_x2dcore_CertificateCore_Vec_inner(v_n_12_, v___x_14_, v___x_14_);
lean_dec(v_n_12_);
return v___x_15_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_heatSteps___boxed(lean_object* v_n_16_, lean_object* v_G_17_, lean_object* v_alpha_18_, lean_object* v_u0_19_, lean_object* v_x_20_, lean_object* v_a_21_){
_start:
{
lean_object* v_res_22_; 
v_res_22_ = lp_certificate_x2dcore_CertificateCore_SpectralContraction_heatSteps(v_n_16_, v_G_17_, v_alpha_18_, v_u0_19_, v_x_20_, v_a_21_);
lean_dec(v_x_20_);
return v_res_22_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_SpectralContraction_heatSteps(lean_object* v_n_23_, lean_object* v_G_24_, lean_object* v_alpha_25_, lean_object* v_u0_26_, lean_object* v_x_27_, lean_object* v_a_28_){
_start:
{
lean_object* v_zero_29_; uint8_t v_isZero_30_; 
v_zero_29_ = lean_unsigned_to_nat(0u);
v_isZero_30_ = lean_nat_dec_eq(v_x_27_, v_zero_29_);
if (v_isZero_30_ == 1)
{
lean_object* v___x_31_; 
lean_dec_ref(v_alpha_25_);
lean_dec_ref(v_G_24_);
lean_dec(v_n_23_);
v___x_31_ = lean_apply_1(v_u0_26_, v_a_28_);
return v___x_31_;
}
else
{
lean_object* v_one_32_; lean_object* v_n_33_; lean_object* v___x_34_; lean_object* v___x_35_; 
v_one_32_ = lean_unsigned_to_nat(1u);
v_n_33_ = lean_nat_sub(v_x_27_, v_one_32_);
lean_inc_ref(v_alpha_25_);
lean_inc_ref(v_G_24_);
lean_inc(v_n_23_);
v___x_34_ = lean_alloc_closure((void*)(lp_certificate_x2dcore_CertificateCore_SpectralContraction_heatSteps___boxed), 6, 5);
lean_closure_set(v___x_34_, 0, v_n_23_);
lean_closure_set(v___x_34_, 1, v_G_24_);
lean_closure_set(v___x_34_, 2, v_alpha_25_);
lean_closure_set(v___x_34_, 3, v_u0_26_);
lean_closure_set(v___x_34_, 4, v_n_33_);
v___x_35_ = lp_certificate_x2dcore_CertificateCore_GraphLaplacian_heatStep(v_n_23_, v_G_24_, v_alpha_25_, v___x_34_, v_a_28_);
return v___x_35_;
}
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_GraphLaplacian(uint8_t builtin);
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_certificate_x2dcore_CertificateCore_SpectralContraction(uint8_t builtin) {
lean_object * res;
if (_G_initialized) return lean_io_result_mk_ok(lean_box(0));
_G_initialized = true;
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_certificate_x2dcore_CertificateCore_GraphLaplacian(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
