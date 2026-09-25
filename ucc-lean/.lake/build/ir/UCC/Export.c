// Lean compiler output
// Module: UCC.Export
// Imports: public import Init public meta import Init public import UCC.Core
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
lean_object* l_List_reverse___redArg(lean_object*);
lean_object* lean_string_append(lean_object*, lean_object*);
lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr(uint8_t, lean_object*);
lean_object* l_Std_Format_pretty(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_List_foldl___at___00UCC_Export_exportToMarkdown_spec__1(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_List_foldl___at___00UCC_Export_exportToMarkdown_spec__1___boxed(lean_object*, lean_object*);
static const lean_string_object lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = "\n"};
static const lean_object* lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__0 = (const lean_object*)&lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__0_value;
static const lean_string_object lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = "- "};
static const lean_object* lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__1 = (const lean_object*)&lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__1_value;
LEAN_EXPORT lean_object* lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0(lean_object*, lean_object*);
static const lean_string_object lp_ucc_UCC_Export_exportToMarkdown___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 7, .m_capacity = 7, .m_length = 6, .m_data = "# ADR "};
static const lean_object* lp_ucc_UCC_Export_exportToMarkdown___closed__0 = (const lean_object*)&lp_ucc_UCC_Export_exportToMarkdown___closed__0_value;
static const lean_string_object lp_ucc_UCC_Export_exportToMarkdown___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = ": "};
static const lean_object* lp_ucc_UCC_Export_exportToMarkdown___closed__1 = (const lean_object*)&lp_ucc_UCC_Export_exportToMarkdown___closed__1_value;
static const lean_string_object lp_ucc_UCC_Export_exportToMarkdown___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 13, .m_capacity = 13, .m_length = 12, .m_data = "**Status**: "};
static const lean_object* lp_ucc_UCC_Export_exportToMarkdown___closed__2 = (const lean_object*)&lp_ucc_UCC_Export_exportToMarkdown___closed__2_value;
static const lean_string_object lp_ucc_UCC_Export_exportToMarkdown___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = "\n\n"};
static const lean_object* lp_ucc_UCC_Export_exportToMarkdown___closed__3 = (const lean_object*)&lp_ucc_UCC_Export_exportToMarkdown___closed__3_value;
static const lean_string_object lp_ucc_UCC_Export_exportToMarkdown___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 12, .m_capacity = 12, .m_length = 11, .m_data = "## Context\n"};
static const lean_object* lp_ucc_UCC_Export_exportToMarkdown___closed__4 = (const lean_object*)&lp_ucc_UCC_Export_exportToMarkdown___closed__4_value;
static const lean_string_object lp_ucc_UCC_Export_exportToMarkdown___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 13, .m_capacity = 13, .m_length = 12, .m_data = "## Decision\n"};
static const lean_object* lp_ucc_UCC_Export_exportToMarkdown___closed__5 = (const lean_object*)&lp_ucc_UCC_Export_exportToMarkdown___closed__5_value;
static const lean_string_object lp_ucc_UCC_Export_exportToMarkdown___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 17, .m_capacity = 17, .m_length = 16, .m_data = "## Consequences\n"};
static const lean_object* lp_ucc_UCC_Export_exportToMarkdown___closed__6 = (const lean_object*)&lp_ucc_UCC_Export_exportToMarkdown___closed__6_value;
static const lean_string_object lp_ucc_UCC_Export_exportToMarkdown___closed__7_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 1, .m_capacity = 1, .m_length = 0, .m_data = ""};
static const lean_object* lp_ucc_UCC_Export_exportToMarkdown___closed__7 = (const lean_object*)&lp_ucc_UCC_Export_exportToMarkdown___closed__7_value;
LEAN_EXPORT lean_object* lp_ucc_UCC_Export_exportToMarkdown(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_List_foldl___at___00UCC_Export_exportToMarkdown_spec__1(lean_object* v_x_1_, lean_object* v_x_2_){
_start:
{
if (lean_obj_tag(v_x_2_) == 0)
{
return v_x_1_;
}
else
{
lean_object* v_head_3_; lean_object* v_tail_4_; lean_object* v___x_5_; 
v_head_3_ = lean_ctor_get(v_x_2_, 0);
v_tail_4_ = lean_ctor_get(v_x_2_, 1);
v___x_5_ = lean_string_append(v_x_1_, v_head_3_);
v_x_1_ = v___x_5_;
v_x_2_ = v_tail_4_;
goto _start;
}
}
}
LEAN_EXPORT lean_object* lp_ucc_List_foldl___at___00UCC_Export_exportToMarkdown_spec__1___boxed(lean_object* v_x_7_, lean_object* v_x_8_){
_start:
{
lean_object* v_res_9_; 
v_res_9_ = lp_ucc_List_foldl___at___00UCC_Export_exportToMarkdown_spec__1(v_x_7_, v_x_8_);
lean_dec(v_x_8_);
return v_res_9_;
}
}
LEAN_EXPORT lean_object* lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0(lean_object* v_a_12_, lean_object* v_a_13_){
_start:
{
if (lean_obj_tag(v_a_12_) == 0)
{
lean_object* v___x_14_; 
v___x_14_ = l_List_reverse___redArg(v_a_13_);
return v___x_14_;
}
else
{
lean_object* v_head_15_; lean_object* v_tail_16_; lean_object* v___x_18_; uint8_t v_isShared_19_; uint8_t v_isSharedCheck_28_; 
v_head_15_ = lean_ctor_get(v_a_12_, 0);
v_tail_16_ = lean_ctor_get(v_a_12_, 1);
v_isSharedCheck_28_ = !lean_is_exclusive(v_a_12_);
if (v_isSharedCheck_28_ == 0)
{
v___x_18_ = v_a_12_;
v_isShared_19_ = v_isSharedCheck_28_;
goto v_resetjp_17_;
}
else
{
lean_inc(v_tail_16_);
lean_inc(v_head_15_);
lean_dec(v_a_12_);
v___x_18_ = lean_box(0);
v_isShared_19_ = v_isSharedCheck_28_;
goto v_resetjp_17_;
}
v_resetjp_17_:
{
lean_object* v___x_20_; lean_object* v___x_21_; lean_object* v___x_22_; lean_object* v___x_23_; lean_object* v___x_25_; 
v___x_20_ = ((lean_object*)(lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__0));
v___x_21_ = ((lean_object*)(lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__1));
v___x_22_ = lean_string_append(v___x_21_, v_head_15_);
lean_dec(v_head_15_);
v___x_23_ = lean_string_append(v___x_22_, v___x_20_);
if (v_isShared_19_ == 0)
{
lean_ctor_set(v___x_18_, 1, v_a_13_);
lean_ctor_set(v___x_18_, 0, v___x_23_);
v___x_25_ = v___x_18_;
goto v_reusejp_24_;
}
else
{
lean_object* v_reuseFailAlloc_27_; 
v_reuseFailAlloc_27_ = lean_alloc_ctor(1, 2, 0);
lean_ctor_set(v_reuseFailAlloc_27_, 0, v___x_23_);
lean_ctor_set(v_reuseFailAlloc_27_, 1, v_a_13_);
v___x_25_ = v_reuseFailAlloc_27_;
goto v_reusejp_24_;
}
v_reusejp_24_:
{
v_a_12_ = v_tail_16_;
v_a_13_ = v___x_25_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Export_exportToMarkdown(lean_object* v_a_37_){
_start:
{
lean_object* v_id_38_; lean_object* v_title_39_; uint8_t v_status_40_; lean_object* v_context_41_; lean_object* v_decision_42_; lean_object* v_consequences_43_; lean_object* v___x_44_; lean_object* v___x_45_; lean_object* v___x_46_; lean_object* v___x_47_; lean_object* v___x_48_; lean_object* v___x_49_; lean_object* v___x_50_; lean_object* v___x_51_; lean_object* v___x_52_; lean_object* v___x_53_; lean_object* v___x_54_; lean_object* v___x_55_; lean_object* v___x_56_; lean_object* v___x_57_; lean_object* v___x_58_; lean_object* v___x_59_; lean_object* v___x_60_; lean_object* v___x_61_; lean_object* v___x_62_; lean_object* v___x_63_; lean_object* v___x_64_; lean_object* v___x_65_; lean_object* v___x_66_; lean_object* v___x_67_; lean_object* v___x_68_; lean_object* v___x_69_; lean_object* v___x_70_; lean_object* v___x_71_; lean_object* v___x_72_; lean_object* v___x_73_; lean_object* v___x_74_; 
v_id_38_ = lean_ctor_get(v_a_37_, 0);
lean_inc_ref(v_id_38_);
v_title_39_ = lean_ctor_get(v_a_37_, 1);
lean_inc_ref(v_title_39_);
v_status_40_ = lean_ctor_get_uint8(v_a_37_, sizeof(void*)*7);
v_context_41_ = lean_ctor_get(v_a_37_, 2);
lean_inc_ref(v_context_41_);
v_decision_42_ = lean_ctor_get(v_a_37_, 3);
lean_inc_ref(v_decision_42_);
v_consequences_43_ = lean_ctor_get(v_a_37_, 4);
lean_inc(v_consequences_43_);
lean_dec_ref(v_a_37_);
v___x_44_ = ((lean_object*)(lp_ucc_UCC_Export_exportToMarkdown___closed__0));
v___x_45_ = lean_string_append(v___x_44_, v_id_38_);
lean_dec_ref(v_id_38_);
v___x_46_ = ((lean_object*)(lp_ucc_UCC_Export_exportToMarkdown___closed__1));
v___x_47_ = lean_string_append(v___x_45_, v___x_46_);
v___x_48_ = lean_string_append(v___x_47_, v_title_39_);
lean_dec_ref(v_title_39_);
v___x_49_ = ((lean_object*)(lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0___closed__0));
v___x_50_ = lean_string_append(v___x_48_, v___x_49_);
v___x_51_ = ((lean_object*)(lp_ucc_UCC_Export_exportToMarkdown___closed__2));
v___x_52_ = lean_unsigned_to_nat(0u);
v___x_53_ = lp_ucc_UCC_Core_instReprADRStatus_repr(v_status_40_, v___x_52_);
v___x_54_ = lean_unsigned_to_nat(120u);
v___x_55_ = l_Std_Format_pretty(v___x_53_, v___x_54_, v___x_52_, v___x_52_);
v___x_56_ = lean_string_append(v___x_51_, v___x_55_);
lean_dec_ref(v___x_55_);
v___x_57_ = ((lean_object*)(lp_ucc_UCC_Export_exportToMarkdown___closed__3));
v___x_58_ = lean_string_append(v___x_56_, v___x_57_);
v___x_59_ = lean_string_append(v___x_50_, v___x_58_);
lean_dec_ref(v___x_58_);
v___x_60_ = ((lean_object*)(lp_ucc_UCC_Export_exportToMarkdown___closed__4));
v___x_61_ = lean_string_append(v___x_60_, v_context_41_);
lean_dec_ref(v_context_41_);
v___x_62_ = lean_string_append(v___x_61_, v___x_57_);
v___x_63_ = lean_string_append(v___x_59_, v___x_62_);
lean_dec_ref(v___x_62_);
v___x_64_ = ((lean_object*)(lp_ucc_UCC_Export_exportToMarkdown___closed__5));
v___x_65_ = lean_string_append(v___x_64_, v_decision_42_);
lean_dec_ref(v_decision_42_);
v___x_66_ = lean_string_append(v___x_65_, v___x_57_);
v___x_67_ = lean_string_append(v___x_63_, v___x_66_);
lean_dec_ref(v___x_66_);
v___x_68_ = ((lean_object*)(lp_ucc_UCC_Export_exportToMarkdown___closed__6));
v___x_69_ = lean_string_append(v___x_67_, v___x_68_);
v___x_70_ = lean_box(0);
v___x_71_ = lp_ucc_List_mapTR_loop___at___00UCC_Export_exportToMarkdown_spec__0(v_consequences_43_, v___x_70_);
v___x_72_ = ((lean_object*)(lp_ucc_UCC_Export_exportToMarkdown___closed__7));
v___x_73_ = lp_ucc_List_foldl___at___00UCC_Export_exportToMarkdown_spec__1(v___x_72_, v___x_71_);
lean_dec(v___x_71_);
v___x_74_ = lean_string_append(v___x_69_, v___x_73_);
lean_dec_ref(v___x_73_);
return v___x_74_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_ucc_UCC_Core(uint8_t builtin);
void lean_initialize_runtime_module();
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_ucc_UCC_Export(uint8_t builtin) {
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
return lean_io_result_mk_ok(lean_box(0));
}
#ifdef __cplusplus
}
#endif
