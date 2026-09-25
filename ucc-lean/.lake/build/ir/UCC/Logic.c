// Lean compiler output
// Module: UCC.Logic
// Imports: public import Init public meta import Init
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
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorIdx(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorIdx___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorElim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorElim(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorElim___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_var_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_var_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_and_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_and_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_implies_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_implies_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorIdx(lean_object* v_x_1_){
_start:
{
switch(lean_obj_tag(v_x_1_))
{
case 0:
{
lean_object* v___x_2_; 
v___x_2_ = lean_unsigned_to_nat(0u);
return v___x_2_;
}
case 1:
{
lean_object* v___x_3_; 
v___x_3_ = lean_unsigned_to_nat(1u);
return v___x_3_;
}
default: 
{
lean_object* v___x_4_; 
v___x_4_ = lean_unsigned_to_nat(2u);
return v___x_4_;
}
}
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorIdx___boxed(lean_object* v_x_5_){
_start:
{
lean_object* v_res_6_; 
v_res_6_ = lp_ucc_UCC_Logic_Expr_ctorIdx(v_x_5_);
lean_dec_ref(v_x_5_);
return v_res_6_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorElim___redArg(lean_object* v_t_7_, lean_object* v_k_8_){
_start:
{
if (lean_obj_tag(v_t_7_) == 0)
{
lean_object* v_name_9_; lean_object* v___x_10_; 
v_name_9_ = lean_ctor_get(v_t_7_, 0);
lean_inc_ref(v_name_9_);
lean_dec_ref_known(v_t_7_, 1);
v___x_10_ = lean_apply_1(v_k_8_, v_name_9_);
return v___x_10_;
}
else
{
lean_object* v_e1_11_; lean_object* v_e2_12_; lean_object* v___x_13_; 
v_e1_11_ = lean_ctor_get(v_t_7_, 0);
lean_inc_ref(v_e1_11_);
v_e2_12_ = lean_ctor_get(v_t_7_, 1);
lean_inc_ref(v_e2_12_);
lean_dec_ref(v_t_7_);
v___x_13_ = lean_apply_2(v_k_8_, v_e1_11_, v_e2_12_);
return v___x_13_;
}
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorElim(lean_object* v_motive_14_, lean_object* v_ctorIdx_15_, lean_object* v_t_16_, lean_object* v_h_17_, lean_object* v_k_18_){
_start:
{
lean_object* v___x_19_; 
v___x_19_ = lp_ucc_UCC_Logic_Expr_ctorElim___redArg(v_t_16_, v_k_18_);
return v___x_19_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_ctorElim___boxed(lean_object* v_motive_20_, lean_object* v_ctorIdx_21_, lean_object* v_t_22_, lean_object* v_h_23_, lean_object* v_k_24_){
_start:
{
lean_object* v_res_25_; 
v_res_25_ = lp_ucc_UCC_Logic_Expr_ctorElim(v_motive_20_, v_ctorIdx_21_, v_t_22_, v_h_23_, v_k_24_);
lean_dec(v_ctorIdx_21_);
return v_res_25_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_var_elim___redArg(lean_object* v_t_26_, lean_object* v_var_27_){
_start:
{
lean_object* v___x_28_; 
v___x_28_ = lp_ucc_UCC_Logic_Expr_ctorElim___redArg(v_t_26_, v_var_27_);
return v___x_28_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_var_elim(lean_object* v_motive_29_, lean_object* v_t_30_, lean_object* v_h_31_, lean_object* v_var_32_){
_start:
{
lean_object* v___x_33_; 
v___x_33_ = lp_ucc_UCC_Logic_Expr_ctorElim___redArg(v_t_30_, v_var_32_);
return v___x_33_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_and_elim___redArg(lean_object* v_t_34_, lean_object* v_and_35_){
_start:
{
lean_object* v___x_36_; 
v___x_36_ = lp_ucc_UCC_Logic_Expr_ctorElim___redArg(v_t_34_, v_and_35_);
return v___x_36_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_and_elim(lean_object* v_motive_37_, lean_object* v_t_38_, lean_object* v_h_39_, lean_object* v_and_40_){
_start:
{
lean_object* v___x_41_; 
v___x_41_ = lp_ucc_UCC_Logic_Expr_ctorElim___redArg(v_t_38_, v_and_40_);
return v___x_41_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_implies_elim___redArg(lean_object* v_t_42_, lean_object* v_implies_43_){
_start:
{
lean_object* v___x_44_; 
v___x_44_ = lp_ucc_UCC_Logic_Expr_ctorElim___redArg(v_t_42_, v_implies_43_);
return v___x_44_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Logic_Expr_implies_elim(lean_object* v_motive_45_, lean_object* v_t_46_, lean_object* v_h_47_, lean_object* v_implies_48_){
_start:
{
lean_object* v___x_49_; 
v___x_49_ = lp_ucc_UCC_Logic_Expr_ctorElim___redArg(v_t_46_, v_implies_48_);
return v___x_49_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
void lean_initialize_runtime_module();
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_ucc_UCC_Logic(uint8_t builtin) {
lean_object * res;
if (_G_initialized) return lean_io_result_mk_ok(lean_box(0));
_G_initialized = true;
lean_initialize_runtime_module();
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
