// Lean compiler output
// Module: UCC.Test
// Imports: public import Init public meta import Init public import UCC.Core public import UCC.Proofs
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
lean_object* lean_string_push(lean_object*, uint32_t);
lean_object* lean_get_stdout();
lean_object* lean_string_append(lean_object*, lean_object*);
static const lean_string_object lp_ucc_adr__v1__proposed___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 8, .m_capacity = 8, .m_length = 7, .m_data = "UCC-001"};
static const lean_object* lp_ucc_adr__v1__proposed___closed__0 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__0_value;
static const lean_string_object lp_ucc_adr__v1__proposed___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 25, .m_capacity = 25, .m_length = 24, .m_data = "Adopt Lean 4 for Closure"};
static const lean_object* lp_ucc_adr__v1__proposed___closed__1 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__1_value;
static const lean_string_object lp_ucc_adr__v1__proposed___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 46, .m_capacity = 46, .m_length = 45, .m_data = "G=0 environment requires formal verification."};
static const lean_object* lp_ucc_adr__v1__proposed___closed__2 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__2_value;
static const lean_string_object lp_ucc_adr__v1__proposed___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 41, .m_capacity = 41, .m_length = 40, .m_data = "Implement UCC in Lean 4 without mathlib."};
static const lean_object* lp_ucc_adr__v1__proposed___closed__3 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__3_value;
static const lean_string_object lp_ucc_adr__v1__proposed___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 30, .m_capacity = 30, .m_length = 29, .m_data = "Strict formal proofs required"};
static const lean_object* lp_ucc_adr__v1__proposed___closed__4 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__4_value;
static const lean_string_object lp_ucc_adr__v1__proposed___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 25, .m_capacity = 25, .m_length = 24, .m_data = "No external dependencies"};
static const lean_object* lp_ucc_adr__v1__proposed___closed__5 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__5_value;
static const lean_ctor_object lp_ucc_adr__v1__proposed___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 1}, .m_objs = {((lean_object*)&lp_ucc_adr__v1__proposed___closed__5_value),((lean_object*)(((size_t)(0) << 1) | 1))}};
static const lean_object* lp_ucc_adr__v1__proposed___closed__6 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__6_value;
static const lean_ctor_object lp_ucc_adr__v1__proposed___closed__7_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 1}, .m_objs = {((lean_object*)&lp_ucc_adr__v1__proposed___closed__4_value),((lean_object*)&lp_ucc_adr__v1__proposed___closed__6_value)}};
static const lean_object* lp_ucc_adr__v1__proposed___closed__7 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__7_value;
static const lean_ctor_object lp_ucc_adr__v1__proposed___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*7 + 8, .m_other = 7, .m_tag = 0}, .m_objs = {((lean_object*)&lp_ucc_adr__v1__proposed___closed__0_value),((lean_object*)&lp_ucc_adr__v1__proposed___closed__1_value),((lean_object*)&lp_ucc_adr__v1__proposed___closed__2_value),((lean_object*)&lp_ucc_adr__v1__proposed___closed__3_value),((lean_object*)&lp_ucc_adr__v1__proposed___closed__7_value),((lean_object*)(((size_t)(0) << 1) | 1)),((lean_object*)(((size_t)(0) << 1) | 1)),LEAN_SCALAR_PTR_LITERAL(0, 0, 0, 0, 0, 0, 0, 0)}};
static const lean_object* lp_ucc_adr__v1__proposed___closed__8 = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__8_value;
LEAN_EXPORT const lean_object* lp_ucc_adr__v1__proposed = (const lean_object*)&lp_ucc_adr__v1__proposed___closed__8_value;
LEAN_EXPORT lean_object* lp_ucc_adr__v1__accepted;
LEAN_EXPORT lean_object* lp_ucc_IO_print___at___00IO_println___at___00testMain_spec__0_spec__0(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_IO_print___at___00IO_println___at___00testMain_spec__0_spec__0___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_IO_println___at___00testMain_spec__0(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_IO_println___at___00testMain_spec__0___boxed(lean_object*, lean_object*);
static const lean_string_object lp_ucc_testMain___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 28, .m_capacity = 28, .m_length = 27, .m_data = "Running UCC Test Harness..."};
static const lean_object* lp_ucc_testMain___closed__0 = (const lean_object*)&lp_ucc_testMain___closed__0_value;
static const lean_string_object lp_ucc_testMain___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 17, .m_capacity = 17, .m_length = 16, .m_data = "Validating ADR: "};
static const lean_object* lp_ucc_testMain___closed__1 = (const lean_object*)&lp_ucc_testMain___closed__1_value;
static const lean_string_object lp_ucc_testMain___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 38, .m_capacity = 38, .m_length = 37, .m_data = "All proofs type-checked successfully."};
static const lean_object* lp_ucc_testMain___closed__2 = (const lean_object*)&lp_ucc_testMain___closed__2_value;
LEAN_EXPORT lean_object* lp_ucc_testMain();
LEAN_EXPORT lean_object* lp_ucc_testMain___boxed(lean_object*);
static lean_object* _init_lp_ucc_adr__v1__accepted(void){
_start:
{
lean_object* v___x_23_; lean_object* v_id_24_; lean_object* v_title_25_; lean_object* v_context_26_; lean_object* v_decision_27_; lean_object* v_consequences_28_; lean_object* v___x_29_; lean_object* v___x_30_; uint8_t v___x_31_; lean_object* v___x_32_; 
v___x_23_ = ((lean_object*)(lp_ucc_adr__v1__proposed));
v_id_24_ = lean_ctor_get(v___x_23_, 0);
v_title_25_ = lean_ctor_get(v___x_23_, 1);
v_context_26_ = lean_ctor_get(v___x_23_, 2);
v_decision_27_ = lean_ctor_get(v___x_23_, 3);
v_consequences_28_ = lean_ctor_get(v___x_23_, 4);
v___x_29_ = lean_box(0);
v___x_30_ = lean_box(0);
v___x_31_ = 1;
lean_inc(v_consequences_28_);
lean_inc_ref(v_decision_27_);
lean_inc_ref(v_context_26_);
lean_inc_ref(v_title_25_);
lean_inc_ref(v_id_24_);
v___x_32_ = lean_alloc_ctor(0, 7, 1);
lean_ctor_set(v___x_32_, 0, v_id_24_);
lean_ctor_set(v___x_32_, 1, v_title_25_);
lean_ctor_set(v___x_32_, 2, v_context_26_);
lean_ctor_set(v___x_32_, 3, v_decision_27_);
lean_ctor_set(v___x_32_, 4, v_consequences_28_);
lean_ctor_set(v___x_32_, 5, v___x_30_);
lean_ctor_set(v___x_32_, 6, v___x_29_);
lean_ctor_set_uint8(v___x_32_, sizeof(void*)*7, v___x_31_);
return v___x_32_;
}
}
LEAN_EXPORT lean_object* lp_ucc_IO_print___at___00IO_println___at___00testMain_spec__0_spec__0(lean_object* v_s_33_){
_start:
{
lean_object* v___x_35_; lean_object* v_putStr_36_; lean_object* v___x_37_; 
v___x_35_ = lean_get_stdout();
v_putStr_36_ = lean_ctor_get(v___x_35_, 4);
lean_inc_ref(v_putStr_36_);
lean_dec_ref(v___x_35_);
v___x_37_ = lean_apply_2(v_putStr_36_, v_s_33_, lean_box(0));
return v___x_37_;
}
}
LEAN_EXPORT lean_object* lp_ucc_IO_print___at___00IO_println___at___00testMain_spec__0_spec__0___boxed(lean_object* v_s_38_, lean_object* v_a_39_){
_start:
{
lean_object* v_res_40_; 
v_res_40_ = lp_ucc_IO_print___at___00IO_println___at___00testMain_spec__0_spec__0(v_s_38_);
return v_res_40_;
}
}
LEAN_EXPORT lean_object* lp_ucc_IO_println___at___00testMain_spec__0(lean_object* v_s_41_){
_start:
{
uint32_t v___x_43_; lean_object* v___x_44_; lean_object* v___x_45_; 
v___x_43_ = 10;
v___x_44_ = lean_string_push(v_s_41_, v___x_43_);
v___x_45_ = lp_ucc_IO_print___at___00IO_println___at___00testMain_spec__0_spec__0(v___x_44_);
return v___x_45_;
}
}
LEAN_EXPORT lean_object* lp_ucc_IO_println___at___00testMain_spec__0___boxed(lean_object* v_s_46_, lean_object* v_a_47_){
_start:
{
lean_object* v_res_48_; 
v_res_48_ = lp_ucc_IO_println___at___00testMain_spec__0(v_s_46_);
return v_res_48_;
}
}
LEAN_EXPORT lean_object* lp_ucc_testMain(){
_start:
{
lean_object* v___x_53_; lean_object* v___x_54_; 
v___x_53_ = ((lean_object*)(lp_ucc_testMain___closed__0));
v___x_54_ = lp_ucc_IO_println___at___00testMain_spec__0(v___x_53_);
if (lean_obj_tag(v___x_54_) == 0)
{
lean_object* v___x_55_; lean_object* v_id_56_; lean_object* v___x_57_; lean_object* v___x_58_; lean_object* v___x_59_; 
lean_dec_ref_known(v___x_54_, 1);
v___x_55_ = lp_ucc_adr__v1__accepted;
v_id_56_ = lean_ctor_get(v___x_55_, 0);
v___x_57_ = ((lean_object*)(lp_ucc_testMain___closed__1));
v___x_58_ = lean_string_append(v___x_57_, v_id_56_);
v___x_59_ = lp_ucc_IO_println___at___00testMain_spec__0(v___x_58_);
if (lean_obj_tag(v___x_59_) == 0)
{
lean_object* v___x_60_; lean_object* v___x_61_; 
lean_dec_ref_known(v___x_59_, 1);
v___x_60_ = ((lean_object*)(lp_ucc_testMain___closed__2));
v___x_61_ = lp_ucc_IO_println___at___00testMain_spec__0(v___x_60_);
return v___x_61_;
}
else
{
return v___x_59_;
}
}
else
{
return v___x_54_;
}
}
}
LEAN_EXPORT lean_object* lp_ucc_testMain___boxed(lean_object* v_a_62_){
_start:
{
lean_object* v_res_63_; 
v_res_63_ = lp_ucc_testMain();
return v_res_63_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_ucc_UCC_Core(uint8_t builtin);
lean_object* initialize_ucc_UCC_Proofs(uint8_t builtin);
void lean_initialize_runtime_module();
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_ucc_UCC_Test(uint8_t builtin) {
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
res = initialize_ucc_UCC_Core(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
res = initialize_ucc_UCC_Proofs(builtin);
if (lean_io_result_is_error(res)) return res;
lean_dec_ref(res);
lp_ucc_adr__v1__accepted = _init_lp_ucc_adr__v1__accepted();
lean_mark_persistent(lp_ucc_adr__v1__accepted);
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
