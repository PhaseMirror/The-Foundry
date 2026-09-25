// Lean compiler output
// Module: CertificateCore.Matrix
// Imports: public import Init public meta import Init public import CertificateCore.Vector
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
lean_object* l_Rat_add(lean_object*, lean_object*);
lean_object* l_Nat_cast___at___00Dyadic_toRat_spec__0(lean_object*);
lean_object* l_Rat_mul(lean_object*, lean_object*);
uint8_t lean_nat_dec_eq(lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_VecSum(lean_object*, lean_object*);
lean_object* lp_certificate_x2dcore_CertificateCore_Vec_inner(lean_object*, lean_object*, lean_object*);
static lean_once_cell_t lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0;
static lean_once_cell_t lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__1_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__1;
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___boxed(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_zero(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_zero___boxed(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_madd___redArg(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_madd(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_madd___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul___redArg(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul___redArg___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_transpose___redArg(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_transpose(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_transpose___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_mulVec___lam__0(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_mulVec(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_mulVec___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_quadraticForm(lean_object*, lean_object*, lean_object*);
static lean_object* _init_lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0(void){
_start:
{
lean_object* v___x_1_; lean_object* v___x_2_; 
v___x_1_ = lean_unsigned_to_nat(0u);
v___x_2_ = l_Nat_cast___at___00Dyadic_toRat_spec__0(v___x_1_);
return v___x_2_;
}
}
static lean_object* _init_lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__1(void){
_start:
{
lean_object* v___x_3_; lean_object* v___x_4_; 
v___x_3_ = lean_unsigned_to_nat(1u);
v___x_4_ = l_Nat_cast___at___00Dyadic_toRat_spec__0(v___x_3_);
return v___x_4_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___redArg(lean_object* v_i_5_, lean_object* v_j_6_){
_start:
{
uint8_t v___x_7_; 
v___x_7_ = lean_nat_dec_eq(v_i_5_, v_j_6_);
if (v___x_7_ == 0)
{
lean_object* v___x_8_; 
v___x_8_ = lean_obj_once(&lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0, &lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0_once, _init_lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0);
return v___x_8_;
}
else
{
lean_object* v___x_9_; 
v___x_9_ = lean_obj_once(&lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__1, &lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__1_once, _init_lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__1);
return v___x_9_;
}
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___boxed(lean_object* v_i_10_, lean_object* v_j_11_){
_start:
{
lean_object* v_res_12_; 
v_res_12_ = lp_certificate_x2dcore_CertificateCore_Mat_id___redArg(v_i_10_, v_j_11_);
lean_dec(v_j_11_);
lean_dec(v_i_10_);
return v_res_12_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id(lean_object* v_n_13_, lean_object* v_i_14_, lean_object* v_j_15_){
_start:
{
lean_object* v___x_16_; 
v___x_16_ = lp_certificate_x2dcore_CertificateCore_Mat_id___redArg(v_i_14_, v_j_15_);
return v___x_16_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_id___boxed(lean_object* v_n_17_, lean_object* v_i_18_, lean_object* v_j_19_){
_start:
{
lean_object* v_res_20_; 
v_res_20_ = lp_certificate_x2dcore_CertificateCore_Mat_id(v_n_17_, v_i_18_, v_j_19_);
lean_dec(v_j_19_);
lean_dec(v_i_18_);
lean_dec(v_n_17_);
return v_res_20_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_zero(lean_object* v_n_21_, lean_object* v_x_22_, lean_object* v_x_23_){
_start:
{
lean_object* v___x_24_; 
v___x_24_ = lean_obj_once(&lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0, &lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0_once, _init_lp_certificate_x2dcore_CertificateCore_Mat_id___redArg___closed__0);
return v___x_24_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_zero___boxed(lean_object* v_n_25_, lean_object* v_x_26_, lean_object* v_x_27_){
_start:
{
lean_object* v_res_28_; 
v_res_28_ = lp_certificate_x2dcore_CertificateCore_Mat_zero(v_n_25_, v_x_26_, v_x_27_);
lean_dec(v_x_27_);
lean_dec(v_x_26_);
lean_dec(v_n_25_);
return v_res_28_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_madd___redArg(lean_object* v_A_29_, lean_object* v_B_30_, lean_object* v_i_31_, lean_object* v_j_32_){
_start:
{
lean_object* v___x_33_; lean_object* v___x_34_; lean_object* v___x_35_; 
lean_inc(v_j_32_);
lean_inc(v_i_31_);
v___x_33_ = lean_apply_2(v_A_29_, v_i_31_, v_j_32_);
v___x_34_ = lean_apply_2(v_B_30_, v_i_31_, v_j_32_);
v___x_35_ = l_Rat_add(v___x_33_, v___x_34_);
return v___x_35_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_madd(lean_object* v_n_36_, lean_object* v_A_37_, lean_object* v_B_38_, lean_object* v_i_39_, lean_object* v_j_40_){
_start:
{
lean_object* v___x_41_; 
v___x_41_ = lp_certificate_x2dcore_CertificateCore_Mat_madd___redArg(v_A_37_, v_B_38_, v_i_39_, v_j_40_);
return v___x_41_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_madd___boxed(lean_object* v_n_42_, lean_object* v_A_43_, lean_object* v_B_44_, lean_object* v_i_45_, lean_object* v_j_46_){
_start:
{
lean_object* v_res_47_; 
v_res_47_ = lp_certificate_x2dcore_CertificateCore_Mat_madd(v_n_42_, v_A_43_, v_B_44_, v_i_45_, v_j_46_);
lean_dec(v_n_42_);
return v_res_47_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul___redArg(lean_object* v_c_48_, lean_object* v_A_49_, lean_object* v_i_50_, lean_object* v_j_51_){
_start:
{
lean_object* v___x_52_; lean_object* v___x_53_; 
v___x_52_ = lean_apply_2(v_A_49_, v_i_50_, v_j_51_);
v___x_53_ = l_Rat_mul(v_c_48_, v___x_52_);
return v___x_53_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul___redArg___boxed(lean_object* v_c_54_, lean_object* v_A_55_, lean_object* v_i_56_, lean_object* v_j_57_){
_start:
{
lean_object* v_res_58_; 
v_res_58_ = lp_certificate_x2dcore_CertificateCore_Mat_smul___redArg(v_c_54_, v_A_55_, v_i_56_, v_j_57_);
lean_dec_ref(v_c_54_);
return v_res_58_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul(lean_object* v_n_59_, lean_object* v_c_60_, lean_object* v_A_61_, lean_object* v_i_62_, lean_object* v_j_63_){
_start:
{
lean_object* v___x_64_; 
v___x_64_ = lp_certificate_x2dcore_CertificateCore_Mat_smul___redArg(v_c_60_, v_A_61_, v_i_62_, v_j_63_);
return v___x_64_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_smul___boxed(lean_object* v_n_65_, lean_object* v_c_66_, lean_object* v_A_67_, lean_object* v_i_68_, lean_object* v_j_69_){
_start:
{
lean_object* v_res_70_; 
v_res_70_ = lp_certificate_x2dcore_CertificateCore_Mat_smul(v_n_65_, v_c_66_, v_A_67_, v_i_68_, v_j_69_);
lean_dec_ref(v_c_66_);
lean_dec(v_n_65_);
return v_res_70_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_transpose___redArg(lean_object* v_A_71_, lean_object* v_i_72_, lean_object* v_j_73_){
_start:
{
lean_object* v___x_74_; 
v___x_74_ = lean_apply_2(v_A_71_, v_j_73_, v_i_72_);
return v___x_74_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_transpose(lean_object* v_n_75_, lean_object* v_A_76_, lean_object* v_i_77_, lean_object* v_j_78_){
_start:
{
lean_object* v___x_79_; 
v___x_79_ = lean_apply_2(v_A_76_, v_j_78_, v_i_77_);
return v___x_79_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_transpose___boxed(lean_object* v_n_80_, lean_object* v_A_81_, lean_object* v_i_82_, lean_object* v_j_83_){
_start:
{
lean_object* v_res_84_; 
v_res_84_ = lp_certificate_x2dcore_CertificateCore_Mat_transpose(v_n_80_, v_A_81_, v_i_82_, v_j_83_);
lean_dec(v_n_80_);
return v_res_84_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_mulVec___lam__0(lean_object* v_A_85_, lean_object* v_i_86_, lean_object* v_v_87_, lean_object* v_j_88_){
_start:
{
lean_object* v___x_89_; lean_object* v___x_90_; lean_object* v___x_91_; 
lean_inc(v_j_88_);
v___x_89_ = lean_apply_2(v_A_85_, v_i_86_, v_j_88_);
v___x_90_ = lean_apply_1(v_v_87_, v_j_88_);
v___x_91_ = l_Rat_mul(v___x_89_, v___x_90_);
lean_dec_ref(v___x_89_);
return v___x_91_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_mulVec(lean_object* v_n_92_, lean_object* v_A_93_, lean_object* v_v_94_, lean_object* v_i_95_){
_start:
{
lean_object* v___f_96_; lean_object* v___x_97_; 
v___f_96_ = lean_alloc_closure((void*)(lp_certificate_x2dcore_CertificateCore_Mat_mulVec___lam__0), 4, 3);
lean_closure_set(v___f_96_, 0, v_A_93_);
lean_closure_set(v___f_96_, 1, v_i_95_);
lean_closure_set(v___f_96_, 2, v_v_94_);
v___x_97_ = lp_certificate_x2dcore_CertificateCore_VecSum(v_n_92_, v___f_96_);
return v___x_97_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_mulVec___boxed(lean_object* v_n_98_, lean_object* v_A_99_, lean_object* v_v_100_, lean_object* v_i_101_){
_start:
{
lean_object* v_res_102_; 
v_res_102_ = lp_certificate_x2dcore_CertificateCore_Mat_mulVec(v_n_98_, v_A_99_, v_v_100_, v_i_101_);
lean_dec(v_n_98_);
return v_res_102_;
}
}
LEAN_EXPORT lean_object* lp_certificate_x2dcore_CertificateCore_Mat_quadraticForm(lean_object* v_n_103_, lean_object* v_A_104_, lean_object* v_x_105_){
_start:
{
lean_object* v___x_106_; lean_object* v___x_107_; 
lean_inc_ref(v_x_105_);
lean_inc(v_n_103_);
v___x_106_ = lean_alloc_closure((void*)(lp_certificate_x2dcore_CertificateCore_Mat_mulVec___boxed), 4, 3);
lean_closure_set(v___x_106_, 0, v_n_103_);
lean_closure_set(v___x_106_, 1, v_A_104_);
lean_closure_set(v___x_106_, 2, v_x_105_);
v___x_107_ = lp_certificate_x2dcore_CertificateCore_Vec_inner(v_n_103_, v_x_105_, v___x_106_);
lean_dec(v_n_103_);
return v___x_107_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_certificate_x2dcore_CertificateCore_Vector(uint8_t builtin);
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_certificate_x2dcore_CertificateCore_Matrix(uint8_t builtin) {
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
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
