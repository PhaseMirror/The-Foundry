// Lean compiler output
// Module: TheExaminerAdr.FFI
// Imports: public import Init public meta import Init public import TheExaminerAdr.Core
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
uint8_t lean_uint32_dec_eq(uint32_t, uint32_t);
LEAN_EXPORT uint8_t the_examiner_adr_check_acyclic(uint32_t, uint32_t);
LEAN_EXPORT lean_object* lp_the__examiner__adr_TheExaminerAdr_checkAcyclic___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t the_examiner_adr_check_acyclic(uint32_t v_id_1_, uint32_t v_supersedesId_2_){
_start:
{
uint8_t v___x_3_; 
v___x_3_ = lean_uint32_dec_eq(v_id_1_, v_supersedesId_2_);
if (v___x_3_ == 0)
{
uint8_t v___x_4_; 
v___x_4_ = 1;
return v___x_4_;
}
else
{
uint8_t v___x_5_; 
v___x_5_ = 0;
return v___x_5_;
}
}
}
LEAN_EXPORT lean_object* lp_the__examiner__adr_TheExaminerAdr_checkAcyclic___boxed(lean_object* v_id_6_, lean_object* v_supersedesId_7_){
_start:
{
uint32_t v_id_boxed_8_; uint32_t v_supersedesId_boxed_9_; uint8_t v_res_10_; lean_object* v_r_11_; 
v_id_boxed_8_ = lean_unbox_uint32(v_id_6_);
lean_dec(v_id_6_);
v_supersedesId_boxed_9_ = lean_unbox_uint32(v_supersedesId_7_);
lean_dec(v_supersedesId_7_);
v_res_10_ = the_examiner_adr_check_acyclic(v_id_boxed_8_, v_supersedesId_boxed_9_);
v_r_11_ = lean_box(v_res_10_);
return v_r_11_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_the__examiner__adr_TheExaminerAdr_Core(uint8_t builtin);
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_the__examiner__adr_TheExaminerAdr_FFI(uint8_t builtin) {
lean_object * res;
if (_G_initialized) return lean_io_result_mk_ok(lean_box(0));
_G_initialized = true;
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_Init(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_the__examiner__adr_TheExaminerAdr_Core(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
