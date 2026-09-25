// Lean compiler output
// Module: GeneralistAdr.Core
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
lean_object* lean_string_length(lean_object*);
lean_object* lean_nat_to_int(lean_object*);
lean_object* l_Repr_addAppParen(lean_object*, lean_object*);
uint8_t lean_nat_dec_le(lean_object*, lean_object*);
lean_object* l_String_quote(lean_object*);
uint8_t lean_string_dec_eq(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorIdx(lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorIdx___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Proposed_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Proposed_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Accepted_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Accepted_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Superseded_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Superseded_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Deprecated_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Deprecated_elim(lean_object*, lean_object*, lean_object*, lean_object*);
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 33, .m_capacity = 33, .m_length = 32, .m_data = "GeneralistAdr.ADRStatus.Accepted"};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__0 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__0_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__0_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__1 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__1_value;
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 33, .m_capacity = 33, .m_length = 32, .m_data = "GeneralistAdr.ADRStatus.Proposed"};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__2 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__2_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__2_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__3 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__3_value;
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 35, .m_capacity = 35, .m_length = 34, .m_data = "GeneralistAdr.ADRStatus.Deprecated"};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__4 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__4_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__4_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__5 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__5_value;
static lean_once_cell_t lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6;
static lean_once_cell_t lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7;
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 35, .m_capacity = 35, .m_length = 34, .m_data = "GeneralistAdr.ADRStatus.Superseded"};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__8 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__8_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__9_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__8_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__9 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__9_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__10_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__9_value),((lean_object*)(((size_t)(1) << 1) | 1))}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__10 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__10_value;
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_generalist__adr_GeneralistAdr_instReprADRStatus___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus___closed__0 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus___closed__0_value;
LEAN_EXPORT const lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprADRStatus___closed__0_value;
LEAN_EXPORT uint8_t lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus_decEq(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus_decEq___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus___boxed(lean_object*, lean_object*);
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = "{ "};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__0 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__0_value;
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 4, .m_capacity = 4, .m_length = 3, .m_data = "rel"};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__1 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__1_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__1_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__2 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__2_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)(((size_t)(0) << 1) | 1)),((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__2_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__3 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__3_value;
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 5, .m_capacity = 5, .m_length = 4, .m_data = " := "};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__4 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__4_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__4_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__5 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__5_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__3_value),((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__5_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__6 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__6_value;
static lean_once_cell_t lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__7_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__7;
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = ","};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__8 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__8_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__9_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__8_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__9 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__9_value;
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__10_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 4, .m_capacity = 4, .m_length = 3, .m_data = "url"};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__10 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__10_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__11_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__10_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__11 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__11_value;
static const lean_string_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__12_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = " }"};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__12 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__12_value;
static lean_once_cell_t lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__13_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__13;
static lean_once_cell_t lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__14_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__14;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__15_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__0_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__15 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__15_value;
static const lean_ctor_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__16_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__12_value)}};
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__16 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__16_value;
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_generalist__adr_GeneralistAdr_instReprArtifactLink___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink___closed__0 = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink___closed__0_value;
LEAN_EXPORT const lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink = (const lean_object*)&lp_generalist__adr_GeneralistAdr_instReprArtifactLink___closed__0_value;
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorIdx(lean_object* v_x_1_){
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
case 2:
{
lean_object* v___x_4_; 
v___x_4_ = lean_unsigned_to_nat(2u);
return v___x_4_;
}
default: 
{
lean_object* v___x_5_; 
v___x_5_ = lean_unsigned_to_nat(3u);
return v___x_5_;
}
}
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorIdx___boxed(lean_object* v_x_6_){
_start:
{
lean_object* v_res_7_; 
v_res_7_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorIdx(v_x_6_);
lean_dec(v_x_6_);
return v_res_7_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(lean_object* v_t_8_, lean_object* v_k_9_){
_start:
{
if (lean_obj_tag(v_t_8_) == 2)
{
lean_object* v_id_10_; lean_object* v___x_11_; 
v_id_10_ = lean_ctor_get(v_t_8_, 0);
lean_inc_ref(v_id_10_);
lean_dec_ref_known(v_t_8_, 1);
v___x_11_ = lean_apply_1(v_k_9_, v_id_10_);
return v___x_11_;
}
else
{
lean_dec(v_t_8_);
return v_k_9_;
}
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim(lean_object* v_motive_12_, lean_object* v_ctorIdx_13_, lean_object* v_t_14_, lean_object* v_h_15_, lean_object* v_k_16_){
_start:
{
lean_object* v___x_17_; 
v___x_17_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_14_, v_k_16_);
return v___x_17_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___boxed(lean_object* v_motive_18_, lean_object* v_ctorIdx_19_, lean_object* v_t_20_, lean_object* v_h_21_, lean_object* v_k_22_){
_start:
{
lean_object* v_res_23_; 
v_res_23_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim(v_motive_18_, v_ctorIdx_19_, v_t_20_, v_h_21_, v_k_22_);
lean_dec(v_ctorIdx_19_);
return v_res_23_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Proposed_elim___redArg(lean_object* v_t_24_, lean_object* v_Proposed_25_){
_start:
{
lean_object* v___x_26_; 
v___x_26_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_24_, v_Proposed_25_);
return v___x_26_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Proposed_elim(lean_object* v_motive_27_, lean_object* v_t_28_, lean_object* v_h_29_, lean_object* v_Proposed_30_){
_start:
{
lean_object* v___x_31_; 
v___x_31_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_28_, v_Proposed_30_);
return v___x_31_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Accepted_elim___redArg(lean_object* v_t_32_, lean_object* v_Accepted_33_){
_start:
{
lean_object* v___x_34_; 
v___x_34_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_32_, v_Accepted_33_);
return v___x_34_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Accepted_elim(lean_object* v_motive_35_, lean_object* v_t_36_, lean_object* v_h_37_, lean_object* v_Accepted_38_){
_start:
{
lean_object* v___x_39_; 
v___x_39_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_36_, v_Accepted_38_);
return v___x_39_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Superseded_elim___redArg(lean_object* v_t_40_, lean_object* v_Superseded_41_){
_start:
{
lean_object* v___x_42_; 
v___x_42_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_40_, v_Superseded_41_);
return v___x_42_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Superseded_elim(lean_object* v_motive_43_, lean_object* v_t_44_, lean_object* v_h_45_, lean_object* v_Superseded_46_){
_start:
{
lean_object* v___x_47_; 
v___x_47_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_44_, v_Superseded_46_);
return v___x_47_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Deprecated_elim___redArg(lean_object* v_t_48_, lean_object* v_Deprecated_49_){
_start:
{
lean_object* v___x_50_; 
v___x_50_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_48_, v_Deprecated_49_);
return v___x_50_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_ADRStatus_Deprecated_elim(lean_object* v_motive_51_, lean_object* v_t_52_, lean_object* v_h_53_, lean_object* v_Deprecated_54_){
_start:
{
lean_object* v___x_55_; 
v___x_55_ = lp_generalist__adr_GeneralistAdr_ADRStatus_ctorElim___redArg(v_t_52_, v_Deprecated_54_);
return v___x_55_;
}
}
static lean_object* _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6(void){
_start:
{
lean_object* v___x_65_; lean_object* v___x_66_; 
v___x_65_ = lean_unsigned_to_nat(2u);
v___x_66_ = lean_nat_to_int(v___x_65_);
return v___x_66_;
}
}
static lean_object* _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7(void){
_start:
{
lean_object* v___x_67_; lean_object* v___x_68_; 
v___x_67_ = lean_unsigned_to_nat(1u);
v___x_68_ = lean_nat_to_int(v___x_67_);
return v___x_68_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr(lean_object* v_x_75_, lean_object* v_prec_76_){
_start:
{
lean_object* v___y_78_; lean_object* v___y_85_; lean_object* v___y_92_; 
switch(lean_obj_tag(v_x_75_))
{
case 0:
{
lean_object* v___x_98_; uint8_t v___x_99_; 
v___x_98_ = lean_unsigned_to_nat(1024u);
v___x_99_ = lean_nat_dec_le(v___x_98_, v_prec_76_);
if (v___x_99_ == 0)
{
lean_object* v___x_100_; 
v___x_100_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6, &lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6_once, _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6);
v___y_85_ = v___x_100_;
goto v___jp_84_;
}
else
{
lean_object* v___x_101_; 
v___x_101_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7, &lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7_once, _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7);
v___y_85_ = v___x_101_;
goto v___jp_84_;
}
}
case 1:
{
lean_object* v___x_102_; uint8_t v___x_103_; 
v___x_102_ = lean_unsigned_to_nat(1024u);
v___x_103_ = lean_nat_dec_le(v___x_102_, v_prec_76_);
if (v___x_103_ == 0)
{
lean_object* v___x_104_; 
v___x_104_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6, &lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6_once, _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6);
v___y_78_ = v___x_104_;
goto v___jp_77_;
}
else
{
lean_object* v___x_105_; 
v___x_105_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7, &lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7_once, _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7);
v___y_78_ = v___x_105_;
goto v___jp_77_;
}
}
case 2:
{
lean_object* v_id_106_; lean_object* v___x_108_; uint8_t v_isShared_109_; uint8_t v_isSharedCheck_126_; 
v_id_106_ = lean_ctor_get(v_x_75_, 0);
v_isSharedCheck_126_ = !lean_is_exclusive(v_x_75_);
if (v_isSharedCheck_126_ == 0)
{
v___x_108_ = v_x_75_;
v_isShared_109_ = v_isSharedCheck_126_;
goto v_resetjp_107_;
}
else
{
lean_inc(v_id_106_);
lean_dec(v_x_75_);
v___x_108_ = lean_box(0);
v_isShared_109_ = v_isSharedCheck_126_;
goto v_resetjp_107_;
}
v_resetjp_107_:
{
lean_object* v___y_111_; lean_object* v___x_122_; uint8_t v___x_123_; 
v___x_122_ = lean_unsigned_to_nat(1024u);
v___x_123_ = lean_nat_dec_le(v___x_122_, v_prec_76_);
if (v___x_123_ == 0)
{
lean_object* v___x_124_; 
v___x_124_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6, &lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6_once, _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6);
v___y_111_ = v___x_124_;
goto v___jp_110_;
}
else
{
lean_object* v___x_125_; 
v___x_125_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7, &lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7_once, _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7);
v___y_111_ = v___x_125_;
goto v___jp_110_;
}
v___jp_110_:
{
lean_object* v___x_112_; lean_object* v___x_113_; lean_object* v___x_115_; 
v___x_112_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__10));
v___x_113_ = l_String_quote(v_id_106_);
if (v_isShared_109_ == 0)
{
lean_ctor_set_tag(v___x_108_, 3);
lean_ctor_set(v___x_108_, 0, v___x_113_);
v___x_115_ = v___x_108_;
goto v_reusejp_114_;
}
else
{
lean_object* v_reuseFailAlloc_121_; 
v_reuseFailAlloc_121_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v_reuseFailAlloc_121_, 0, v___x_113_);
v___x_115_ = v_reuseFailAlloc_121_;
goto v_reusejp_114_;
}
v_reusejp_114_:
{
lean_object* v___x_116_; lean_object* v___x_117_; uint8_t v___x_118_; lean_object* v___x_119_; lean_object* v___x_120_; 
v___x_116_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_116_, 0, v___x_112_);
lean_ctor_set(v___x_116_, 1, v___x_115_);
lean_inc(v___y_111_);
v___x_117_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_117_, 0, v___y_111_);
lean_ctor_set(v___x_117_, 1, v___x_116_);
v___x_118_ = 0;
v___x_119_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_119_, 0, v___x_117_);
lean_ctor_set_uint8(v___x_119_, sizeof(void*)*1, v___x_118_);
v___x_120_ = l_Repr_addAppParen(v___x_119_, v_prec_76_);
return v___x_120_;
}
}
}
}
default: 
{
lean_object* v___x_127_; uint8_t v___x_128_; 
v___x_127_ = lean_unsigned_to_nat(1024u);
v___x_128_ = lean_nat_dec_le(v___x_127_, v_prec_76_);
if (v___x_128_ == 0)
{
lean_object* v___x_129_; 
v___x_129_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6, &lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6_once, _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__6);
v___y_92_ = v___x_129_;
goto v___jp_91_;
}
else
{
lean_object* v___x_130_; 
v___x_130_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7, &lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7_once, _init_lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__7);
v___y_92_ = v___x_130_;
goto v___jp_91_;
}
}
}
v___jp_77_:
{
lean_object* v___x_79_; lean_object* v___x_80_; uint8_t v___x_81_; lean_object* v___x_82_; lean_object* v___x_83_; 
v___x_79_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__1));
lean_inc(v___y_78_);
v___x_80_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_80_, 0, v___y_78_);
lean_ctor_set(v___x_80_, 1, v___x_79_);
v___x_81_ = 0;
v___x_82_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_82_, 0, v___x_80_);
lean_ctor_set_uint8(v___x_82_, sizeof(void*)*1, v___x_81_);
v___x_83_ = l_Repr_addAppParen(v___x_82_, v_prec_76_);
return v___x_83_;
}
v___jp_84_:
{
lean_object* v___x_86_; lean_object* v___x_87_; uint8_t v___x_88_; lean_object* v___x_89_; lean_object* v___x_90_; 
v___x_86_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__3));
lean_inc(v___y_85_);
v___x_87_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_87_, 0, v___y_85_);
lean_ctor_set(v___x_87_, 1, v___x_86_);
v___x_88_ = 0;
v___x_89_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_89_, 0, v___x_87_);
lean_ctor_set_uint8(v___x_89_, sizeof(void*)*1, v___x_88_);
v___x_90_ = l_Repr_addAppParen(v___x_89_, v_prec_76_);
return v___x_90_;
}
v___jp_91_:
{
lean_object* v___x_93_; lean_object* v___x_94_; uint8_t v___x_95_; lean_object* v___x_96_; lean_object* v___x_97_; 
v___x_93_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___closed__5));
lean_inc(v___y_92_);
v___x_94_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_94_, 0, v___y_92_);
lean_ctor_set(v___x_94_, 1, v___x_93_);
v___x_95_ = 0;
v___x_96_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_96_, 0, v___x_94_);
lean_ctor_set_uint8(v___x_96_, sizeof(void*)*1, v___x_95_);
v___x_97_ = l_Repr_addAppParen(v___x_96_, v_prec_76_);
return v___x_97_;
}
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr___boxed(lean_object* v_x_131_, lean_object* v_prec_132_){
_start:
{
lean_object* v_res_133_; 
v_res_133_ = lp_generalist__adr_GeneralistAdr_instReprADRStatus_repr(v_x_131_, v_prec_132_);
lean_dec(v_prec_132_);
return v_res_133_;
}
}
LEAN_EXPORT uint8_t lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus_decEq(lean_object* v_x_136_, lean_object* v_x_137_){
_start:
{
switch(lean_obj_tag(v_x_136_))
{
case 0:
{
switch(lean_obj_tag(v_x_137_))
{
case 0:
{
uint8_t v___x_138_; 
v___x_138_ = 1;
return v___x_138_;
}
case 2:
{
uint8_t v___x_139_; 
v___x_139_ = 0;
return v___x_139_;
}
default: 
{
uint8_t v___x_140_; 
v___x_140_ = 0;
return v___x_140_;
}
}
}
case 1:
{
switch(lean_obj_tag(v_x_137_))
{
case 1:
{
uint8_t v___x_141_; 
v___x_141_ = 1;
return v___x_141_;
}
case 2:
{
uint8_t v___x_142_; 
v___x_142_ = 0;
return v___x_142_;
}
default: 
{
uint8_t v___x_143_; 
v___x_143_ = 0;
return v___x_143_;
}
}
}
case 2:
{
lean_object* v_id_144_; uint8_t v___x_145_; 
v_id_144_ = lean_ctor_get(v_x_136_, 0);
v___x_145_ = 0;
if (lean_obj_tag(v_x_137_) == 2)
{
lean_object* v_id_146_; uint8_t v___x_147_; 
v_id_146_ = lean_ctor_get(v_x_137_, 0);
v___x_147_ = lean_string_dec_eq(v_id_144_, v_id_146_);
if (v___x_147_ == 0)
{
return v___x_145_;
}
else
{
return v___x_147_;
}
}
else
{
return v___x_145_;
}
}
default: 
{
switch(lean_obj_tag(v_x_137_))
{
case 2:
{
uint8_t v___x_148_; 
v___x_148_ = 0;
return v___x_148_;
}
case 3:
{
uint8_t v___x_149_; 
v___x_149_ = 1;
return v___x_149_;
}
default: 
{
uint8_t v___x_150_; 
v___x_150_ = 0;
return v___x_150_;
}
}
}
}
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus_decEq___boxed(lean_object* v_x_151_, lean_object* v_x_152_){
_start:
{
uint8_t v_res_153_; lean_object* v_r_154_; 
v_res_153_ = lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus_decEq(v_x_151_, v_x_152_);
lean_dec(v_x_152_);
lean_dec(v_x_151_);
v_r_154_ = lean_box(v_res_153_);
return v_r_154_;
}
}
LEAN_EXPORT uint8_t lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus(lean_object* v_x_155_, lean_object* v_x_156_){
_start:
{
uint8_t v___x_157_; 
v___x_157_ = lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus_decEq(v_x_155_, v_x_156_);
return v___x_157_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus___boxed(lean_object* v_x_158_, lean_object* v_x_159_){
_start:
{
uint8_t v_res_160_; lean_object* v_r_161_; 
v_res_160_ = lp_generalist__adr_GeneralistAdr_instDecidableEqADRStatus(v_x_158_, v_x_159_);
lean_dec(v_x_159_);
lean_dec(v_x_158_);
v_r_161_ = lean_box(v_res_160_);
return v_r_161_;
}
}
static lean_object* _init_lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__7(void){
_start:
{
lean_object* v___x_175_; lean_object* v___x_176_; 
v___x_175_ = lean_unsigned_to_nat(7u);
v___x_176_ = lean_nat_to_int(v___x_175_);
return v___x_176_;
}
}
static lean_object* _init_lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__13(void){
_start:
{
lean_object* v___x_184_; lean_object* v___x_185_; 
v___x_184_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__0));
v___x_185_ = lean_string_length(v___x_184_);
return v___x_185_;
}
}
static lean_object* _init_lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__14(void){
_start:
{
lean_object* v___x_186_; lean_object* v___x_187_; 
v___x_186_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__13, &lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__13_once, _init_lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__13);
v___x_187_ = lean_nat_to_int(v___x_186_);
return v___x_187_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg(lean_object* v_x_192_){
_start:
{
lean_object* v_rel_193_; lean_object* v_url_194_; lean_object* v___x_196_; uint8_t v_isShared_197_; uint8_t v_isSharedCheck_228_; 
v_rel_193_ = lean_ctor_get(v_x_192_, 0);
v_url_194_ = lean_ctor_get(v_x_192_, 1);
v_isSharedCheck_228_ = !lean_is_exclusive(v_x_192_);
if (v_isSharedCheck_228_ == 0)
{
v___x_196_ = v_x_192_;
v_isShared_197_ = v_isSharedCheck_228_;
goto v_resetjp_195_;
}
else
{
lean_inc(v_url_194_);
lean_inc(v_rel_193_);
lean_dec(v_x_192_);
v___x_196_ = lean_box(0);
v_isShared_197_ = v_isSharedCheck_228_;
goto v_resetjp_195_;
}
v_resetjp_195_:
{
lean_object* v___x_198_; lean_object* v___x_199_; lean_object* v___x_200_; lean_object* v___x_201_; lean_object* v___x_202_; lean_object* v___x_204_; 
v___x_198_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__5));
v___x_199_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__6));
v___x_200_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__7, &lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__7_once, _init_lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__7);
v___x_201_ = l_String_quote(v_rel_193_);
v___x_202_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_202_, 0, v___x_201_);
if (v_isShared_197_ == 0)
{
lean_ctor_set_tag(v___x_196_, 4);
lean_ctor_set(v___x_196_, 1, v___x_202_);
lean_ctor_set(v___x_196_, 0, v___x_200_);
v___x_204_ = v___x_196_;
goto v_reusejp_203_;
}
else
{
lean_object* v_reuseFailAlloc_227_; 
v_reuseFailAlloc_227_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v_reuseFailAlloc_227_, 0, v___x_200_);
lean_ctor_set(v_reuseFailAlloc_227_, 1, v___x_202_);
v___x_204_ = v_reuseFailAlloc_227_;
goto v_reusejp_203_;
}
v_reusejp_203_:
{
uint8_t v___x_205_; lean_object* v___x_206_; lean_object* v___x_207_; lean_object* v___x_208_; lean_object* v___x_209_; lean_object* v___x_210_; lean_object* v___x_211_; lean_object* v___x_212_; lean_object* v___x_213_; lean_object* v___x_214_; lean_object* v___x_215_; lean_object* v___x_216_; lean_object* v___x_217_; lean_object* v___x_218_; lean_object* v___x_219_; lean_object* v___x_220_; lean_object* v___x_221_; lean_object* v___x_222_; lean_object* v___x_223_; lean_object* v___x_224_; lean_object* v___x_225_; lean_object* v___x_226_; 
v___x_205_ = 0;
v___x_206_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_206_, 0, v___x_204_);
lean_ctor_set_uint8(v___x_206_, sizeof(void*)*1, v___x_205_);
v___x_207_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_207_, 0, v___x_199_);
lean_ctor_set(v___x_207_, 1, v___x_206_);
v___x_208_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__9));
v___x_209_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_209_, 0, v___x_207_);
lean_ctor_set(v___x_209_, 1, v___x_208_);
v___x_210_ = lean_box(1);
v___x_211_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_211_, 0, v___x_209_);
lean_ctor_set(v___x_211_, 1, v___x_210_);
v___x_212_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__11));
v___x_213_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_213_, 0, v___x_211_);
lean_ctor_set(v___x_213_, 1, v___x_212_);
v___x_214_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_214_, 0, v___x_213_);
lean_ctor_set(v___x_214_, 1, v___x_198_);
v___x_215_ = l_String_quote(v_url_194_);
v___x_216_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_216_, 0, v___x_215_);
v___x_217_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_217_, 0, v___x_200_);
lean_ctor_set(v___x_217_, 1, v___x_216_);
v___x_218_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_218_, 0, v___x_217_);
lean_ctor_set_uint8(v___x_218_, sizeof(void*)*1, v___x_205_);
v___x_219_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_219_, 0, v___x_214_);
lean_ctor_set(v___x_219_, 1, v___x_218_);
v___x_220_ = lean_obj_once(&lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__14, &lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__14_once, _init_lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__14);
v___x_221_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__15));
v___x_222_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_222_, 0, v___x_221_);
lean_ctor_set(v___x_222_, 1, v___x_219_);
v___x_223_ = ((lean_object*)(lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg___closed__16));
v___x_224_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_224_, 0, v___x_222_);
lean_ctor_set(v___x_224_, 1, v___x_223_);
v___x_225_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_225_, 0, v___x_220_);
lean_ctor_set(v___x_225_, 1, v___x_224_);
v___x_226_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_226_, 0, v___x_225_);
lean_ctor_set_uint8(v___x_226_, sizeof(void*)*1, v___x_205_);
return v___x_226_;
}
}
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr(lean_object* v_x_229_, lean_object* v_prec_230_){
_start:
{
lean_object* v___x_231_; 
v___x_231_ = lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___redArg(v_x_229_);
return v___x_231_;
}
}
LEAN_EXPORT lean_object* lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr___boxed(lean_object* v_x_232_, lean_object* v_prec_233_){
_start:
{
lean_object* v_res_234_; 
v_res_234_ = lp_generalist__adr_GeneralistAdr_instReprArtifactLink_repr(v_x_232_, v_prec_233_);
lean_dec(v_prec_233_);
return v_res_234_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_generalist__adr_GeneralistAdr_Core(uint8_t builtin) {
lean_object * res;
if (_G_initialized) return lean_io_result_mk_ok(lean_box(0));
_G_initialized = true;
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
