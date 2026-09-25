// Lean compiler output
// Module: UCC.Core
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
lean_object* lean_nat_to_int(lean_object*);
lean_object* l_String_quote(lean_object*);
lean_object* l_Repr_addAppParen(lean_object*, lean_object*);
uint8_t lean_nat_dec_le(lean_object*, lean_object*);
lean_object* l_List_repr_x27___at___00Lean_Syntax_instReprPreresolved_repr_spec__0___redArg(lean_object*);
lean_object* lean_string_length(lean_object*);
uint8_t lean_nat_dec_eq(lean_object*, lean_object*);
uint8_t lean_nat_dec_le(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorIdx(uint8_t);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorIdx___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorElim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorElim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorElim(lean_object*, lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorElim___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Proposed_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Proposed_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Proposed_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Proposed_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Accepted_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Accepted_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Accepted_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Accepted_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Deprecated_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Deprecated_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Deprecated_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Deprecated_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Superseded_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Superseded_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Superseded_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Superseded_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
static const lean_string_object lp_ucc_UCC_Core_instReprADRStatus_repr___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 28, .m_capacity = 28, .m_length = 27, .m_data = "UCC.Core.ADRStatus.Proposed"};
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__0 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__0_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADRStatus_repr___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__0_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__1 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__1_value;
static const lean_string_object lp_ucc_UCC_Core_instReprADRStatus_repr___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 28, .m_capacity = 28, .m_length = 27, .m_data = "UCC.Core.ADRStatus.Accepted"};
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__2 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__2_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADRStatus_repr___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__2_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__3 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__3_value;
static const lean_string_object lp_ucc_UCC_Core_instReprADRStatus_repr___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 30, .m_capacity = 30, .m_length = 29, .m_data = "UCC.Core.ADRStatus.Deprecated"};
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__4 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__4_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADRStatus_repr___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__4_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__5 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__5_value;
static const lean_string_object lp_ucc_UCC_Core_instReprADRStatus_repr___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 30, .m_capacity = 30, .m_length = 29, .m_data = "UCC.Core.ADRStatus.Superseded"};
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__6 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__6_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADRStatus_repr___closed__7_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__6_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__7 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__7_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9;
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr(uint8_t, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_ucc_UCC_Core_instReprADRStatus___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_ucc_UCC_Core_instReprADRStatus_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_ucc_UCC_Core_instReprADRStatus___closed__0 = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus___closed__0_value;
LEAN_EXPORT const lean_object* lp_ucc_UCC_Core_instReprADRStatus = (const lean_object*)&lp_ucc_UCC_Core_instReprADRStatus___closed__0_value;
LEAN_EXPORT uint8_t lp_ucc_UCC_Core_ADRStatus_ofNat(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ofNat___boxed(lean_object*);
LEAN_EXPORT uint8_t lp_ucc_UCC_Core_instDecidableEqADRStatus(uint8_t, uint8_t);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instDecidableEqADRStatus___boxed(lean_object*, lean_object*);
static const lean_string_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = "{ "};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__0 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__0_value;
static const lean_string_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 4, .m_capacity = 4, .m_length = 3, .m_data = "url"};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__1 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__1_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__1_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__2 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__2_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)(((size_t)(0) << 1) | 1)),((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__2_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__3 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__3_value;
static const lean_string_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 5, .m_capacity = 5, .m_length = 4, .m_data = " := "};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__4 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__4_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__4_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__5 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__5_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__3_value),((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__5_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__6 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__6_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__7_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__7;
static const lean_string_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = ","};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__8 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__8_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__9_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__8_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__9 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__9_value;
static const lean_string_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__10_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 12, .m_capacity = 12, .m_length = 11, .m_data = "description"};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__10 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__10_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__11_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__10_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__11 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__11_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__12_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__12;
static const lean_string_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__13_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = " }"};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__13 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__13_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__14_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__14;
static lean_once_cell_t lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15;
static const lean_ctor_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__16_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__0_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__16 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__16_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__17_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__13_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__17 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__17_value;
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_ucc_UCC_Core_instReprArtifactLink___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_ucc_UCC_Core_instReprArtifactLink_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_ucc_UCC_Core_instReprArtifactLink___closed__0 = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink___closed__0_value;
LEAN_EXPORT const lean_object* lp_ucc_UCC_Core_instReprArtifactLink = (const lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink___closed__0_value;
static const lean_string_object lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 5, .m_capacity = 5, .m_length = 4, .m_data = "none"};
static const lean_object* lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__0 = (const lean_object*)&lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__0_value;
static const lean_ctor_object lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__0_value)}};
static const lean_object* lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__1 = (const lean_object*)&lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__1_value;
static const lean_string_object lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 6, .m_capacity = 6, .m_length = 5, .m_data = "some "};
static const lean_object* lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__2 = (const lean_object*)&lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__2_value;
static const lean_ctor_object lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__2_value)}};
static const lean_object* lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__3 = (const lean_object*)&lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__3_value;
LEAN_EXPORT lean_object* lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1_spec__2_spec__3(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1_spec__2(lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1(lean_object*, lean_object*);
static const lean_string_object lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = "[]"};
static const lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__0 = (const lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__0_value;
static const lean_ctor_object lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__0_value)}};
static const lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__1 = (const lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__1_value;
static const lean_string_object lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = "["};
static const lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__2 = (const lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__2_value;
static const lean_ctor_object lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__9_value),((lean_object*)(((size_t)(1) << 1) | 1))}};
static const lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__3 = (const lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__3_value;
static const lean_string_object lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 2, .m_capacity = 2, .m_length = 1, .m_data = "]"};
static const lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__4 = (const lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__4_value;
static lean_once_cell_t lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__5_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__5;
static lean_once_cell_t lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__6_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__6;
static const lean_ctor_object lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__7_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__2_value)}};
static const lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__7 = (const lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__7_value;
static const lean_ctor_object lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__4_value)}};
static const lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__8 = (const lean_object*)&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__8_value;
LEAN_EXPORT lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg(lean_object*);
static const lean_string_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 3, .m_capacity = 3, .m_length = 2, .m_data = "id"};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__0 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__0_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__0_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__1 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__1_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)(((size_t)(0) << 1) | 1)),((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__1_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__2 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__2_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__2_value),((lean_object*)&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__5_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__3 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__3_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__4_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__4;
static const lean_string_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 6, .m_capacity = 6, .m_length = 5, .m_data = "title"};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__5 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__5_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__5_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__6 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__6_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__7_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__7;
static const lean_string_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 7, .m_capacity = 7, .m_length = 6, .m_data = "status"};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__8 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__8_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__9_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__8_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__9 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__9_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__10_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__10;
static const lean_string_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__11_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 8, .m_capacity = 8, .m_length = 7, .m_data = "context"};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__11 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__11_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__12_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__11_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__12 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__12_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__13_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__13;
static const lean_string_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__14_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 9, .m_capacity = 9, .m_length = 8, .m_data = "decision"};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__14 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__14_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__15_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__14_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__15 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__15_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__16_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__16;
static const lean_string_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__17_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 13, .m_capacity = 13, .m_length = 12, .m_data = "consequences"};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__17 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__17_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__18_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__17_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__18 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__18_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__19_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__19;
static const lean_string_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__20_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 11, .m_capacity = 11, .m_length = 10, .m_data = "supersedes"};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__20 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__20_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__21_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__20_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__21 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__21_value;
static lean_once_cell_t lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__22_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__22;
static const lean_string_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__23_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 6, .m_capacity = 6, .m_length = 5, .m_data = "links"};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__23 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__23_value;
static const lean_ctor_object lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__24_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__23_value)}};
static const lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__24 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__24_value;
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADR_repr(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADR_repr___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_ucc_UCC_Core_instReprADR___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_ucc_UCC_Core_instReprADR_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_ucc_UCC_Core_instReprADR___closed__0 = (const lean_object*)&lp_ucc_UCC_Core_instReprADR___closed__0_value;
LEAN_EXPORT const lean_object* lp_ucc_UCC_Core_instReprADR = (const lean_object*)&lp_ucc_UCC_Core_instReprADR___closed__0_value;
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorIdx(uint8_t v_x_1_){
_start:
{
switch(v_x_1_)
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
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorIdx___boxed(lean_object* v_x_6_){
_start:
{
uint8_t v_x_boxed_7_; lean_object* v_res_8_; 
v_x_boxed_7_ = lean_unbox(v_x_6_);
v_res_8_ = lp_ucc_UCC_Core_ADRStatus_ctorIdx(v_x_boxed_7_);
return v_res_8_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorElim___redArg(lean_object* v_k_9_){
_start:
{
lean_inc(v_k_9_);
return v_k_9_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorElim___redArg___boxed(lean_object* v_k_10_){
_start:
{
lean_object* v_res_11_; 
v_res_11_ = lp_ucc_UCC_Core_ADRStatus_ctorElim___redArg(v_k_10_);
lean_dec(v_k_10_);
return v_res_11_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorElim(lean_object* v_motive_12_, lean_object* v_ctorIdx_13_, uint8_t v_t_14_, lean_object* v_h_15_, lean_object* v_k_16_){
_start:
{
lean_inc(v_k_16_);
return v_k_16_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ctorElim___boxed(lean_object* v_motive_17_, lean_object* v_ctorIdx_18_, lean_object* v_t_19_, lean_object* v_h_20_, lean_object* v_k_21_){
_start:
{
uint8_t v_t_boxed_22_; lean_object* v_res_23_; 
v_t_boxed_22_ = lean_unbox(v_t_19_);
v_res_23_ = lp_ucc_UCC_Core_ADRStatus_ctorElim(v_motive_17_, v_ctorIdx_18_, v_t_boxed_22_, v_h_20_, v_k_21_);
lean_dec(v_k_21_);
lean_dec(v_ctorIdx_18_);
return v_res_23_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Proposed_elim___redArg(lean_object* v_Proposed_24_){
_start:
{
lean_inc(v_Proposed_24_);
return v_Proposed_24_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Proposed_elim___redArg___boxed(lean_object* v_Proposed_25_){
_start:
{
lean_object* v_res_26_; 
v_res_26_ = lp_ucc_UCC_Core_ADRStatus_Proposed_elim___redArg(v_Proposed_25_);
lean_dec(v_Proposed_25_);
return v_res_26_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Proposed_elim(lean_object* v_motive_27_, uint8_t v_t_28_, lean_object* v_h_29_, lean_object* v_Proposed_30_){
_start:
{
lean_inc(v_Proposed_30_);
return v_Proposed_30_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Proposed_elim___boxed(lean_object* v_motive_31_, lean_object* v_t_32_, lean_object* v_h_33_, lean_object* v_Proposed_34_){
_start:
{
uint8_t v_t_boxed_35_; lean_object* v_res_36_; 
v_t_boxed_35_ = lean_unbox(v_t_32_);
v_res_36_ = lp_ucc_UCC_Core_ADRStatus_Proposed_elim(v_motive_31_, v_t_boxed_35_, v_h_33_, v_Proposed_34_);
lean_dec(v_Proposed_34_);
return v_res_36_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Accepted_elim___redArg(lean_object* v_Accepted_37_){
_start:
{
lean_inc(v_Accepted_37_);
return v_Accepted_37_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Accepted_elim___redArg___boxed(lean_object* v_Accepted_38_){
_start:
{
lean_object* v_res_39_; 
v_res_39_ = lp_ucc_UCC_Core_ADRStatus_Accepted_elim___redArg(v_Accepted_38_);
lean_dec(v_Accepted_38_);
return v_res_39_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Accepted_elim(lean_object* v_motive_40_, uint8_t v_t_41_, lean_object* v_h_42_, lean_object* v_Accepted_43_){
_start:
{
lean_inc(v_Accepted_43_);
return v_Accepted_43_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Accepted_elim___boxed(lean_object* v_motive_44_, lean_object* v_t_45_, lean_object* v_h_46_, lean_object* v_Accepted_47_){
_start:
{
uint8_t v_t_boxed_48_; lean_object* v_res_49_; 
v_t_boxed_48_ = lean_unbox(v_t_45_);
v_res_49_ = lp_ucc_UCC_Core_ADRStatus_Accepted_elim(v_motive_44_, v_t_boxed_48_, v_h_46_, v_Accepted_47_);
lean_dec(v_Accepted_47_);
return v_res_49_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Deprecated_elim___redArg(lean_object* v_Deprecated_50_){
_start:
{
lean_inc(v_Deprecated_50_);
return v_Deprecated_50_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Deprecated_elim___redArg___boxed(lean_object* v_Deprecated_51_){
_start:
{
lean_object* v_res_52_; 
v_res_52_ = lp_ucc_UCC_Core_ADRStatus_Deprecated_elim___redArg(v_Deprecated_51_);
lean_dec(v_Deprecated_51_);
return v_res_52_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Deprecated_elim(lean_object* v_motive_53_, uint8_t v_t_54_, lean_object* v_h_55_, lean_object* v_Deprecated_56_){
_start:
{
lean_inc(v_Deprecated_56_);
return v_Deprecated_56_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Deprecated_elim___boxed(lean_object* v_motive_57_, lean_object* v_t_58_, lean_object* v_h_59_, lean_object* v_Deprecated_60_){
_start:
{
uint8_t v_t_boxed_61_; lean_object* v_res_62_; 
v_t_boxed_61_ = lean_unbox(v_t_58_);
v_res_62_ = lp_ucc_UCC_Core_ADRStatus_Deprecated_elim(v_motive_57_, v_t_boxed_61_, v_h_59_, v_Deprecated_60_);
lean_dec(v_Deprecated_60_);
return v_res_62_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Superseded_elim___redArg(lean_object* v_Superseded_63_){
_start:
{
lean_inc(v_Superseded_63_);
return v_Superseded_63_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Superseded_elim___redArg___boxed(lean_object* v_Superseded_64_){
_start:
{
lean_object* v_res_65_; 
v_res_65_ = lp_ucc_UCC_Core_ADRStatus_Superseded_elim___redArg(v_Superseded_64_);
lean_dec(v_Superseded_64_);
return v_res_65_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Superseded_elim(lean_object* v_motive_66_, uint8_t v_t_67_, lean_object* v_h_68_, lean_object* v_Superseded_69_){
_start:
{
lean_inc(v_Superseded_69_);
return v_Superseded_69_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_Superseded_elim___boxed(lean_object* v_motive_70_, lean_object* v_t_71_, lean_object* v_h_72_, lean_object* v_Superseded_73_){
_start:
{
uint8_t v_t_boxed_74_; lean_object* v_res_75_; 
v_t_boxed_74_ = lean_unbox(v_t_71_);
v_res_75_ = lp_ucc_UCC_Core_ADRStatus_Superseded_elim(v_motive_70_, v_t_boxed_74_, v_h_72_, v_Superseded_73_);
lean_dec(v_Superseded_73_);
return v_res_75_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8(void){
_start:
{
lean_object* v___x_88_; lean_object* v___x_89_; 
v___x_88_ = lean_unsigned_to_nat(2u);
v___x_89_ = lean_nat_to_int(v___x_88_);
return v___x_89_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9(void){
_start:
{
lean_object* v___x_90_; lean_object* v___x_91_; 
v___x_90_ = lean_unsigned_to_nat(1u);
v___x_91_ = lean_nat_to_int(v___x_90_);
return v___x_91_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr(uint8_t v_x_92_, lean_object* v_prec_93_){
_start:
{
lean_object* v___y_95_; lean_object* v___y_102_; lean_object* v___y_109_; lean_object* v___y_116_; 
switch(v_x_92_)
{
case 0:
{
lean_object* v___x_122_; uint8_t v___x_123_; 
v___x_122_ = lean_unsigned_to_nat(1024u);
v___x_123_ = lean_nat_dec_le(v___x_122_, v_prec_93_);
if (v___x_123_ == 0)
{
lean_object* v___x_124_; 
v___x_124_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8, &lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8_once, _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8);
v___y_95_ = v___x_124_;
goto v___jp_94_;
}
else
{
lean_object* v___x_125_; 
v___x_125_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9, &lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9_once, _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9);
v___y_95_ = v___x_125_;
goto v___jp_94_;
}
}
case 1:
{
lean_object* v___x_126_; uint8_t v___x_127_; 
v___x_126_ = lean_unsigned_to_nat(1024u);
v___x_127_ = lean_nat_dec_le(v___x_126_, v_prec_93_);
if (v___x_127_ == 0)
{
lean_object* v___x_128_; 
v___x_128_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8, &lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8_once, _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8);
v___y_102_ = v___x_128_;
goto v___jp_101_;
}
else
{
lean_object* v___x_129_; 
v___x_129_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9, &lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9_once, _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9);
v___y_102_ = v___x_129_;
goto v___jp_101_;
}
}
case 2:
{
lean_object* v___x_130_; uint8_t v___x_131_; 
v___x_130_ = lean_unsigned_to_nat(1024u);
v___x_131_ = lean_nat_dec_le(v___x_130_, v_prec_93_);
if (v___x_131_ == 0)
{
lean_object* v___x_132_; 
v___x_132_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8, &lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8_once, _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8);
v___y_109_ = v___x_132_;
goto v___jp_108_;
}
else
{
lean_object* v___x_133_; 
v___x_133_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9, &lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9_once, _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9);
v___y_109_ = v___x_133_;
goto v___jp_108_;
}
}
default: 
{
lean_object* v___x_134_; uint8_t v___x_135_; 
v___x_134_ = lean_unsigned_to_nat(1024u);
v___x_135_ = lean_nat_dec_le(v___x_134_, v_prec_93_);
if (v___x_135_ == 0)
{
lean_object* v___x_136_; 
v___x_136_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8, &lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8_once, _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__8);
v___y_116_ = v___x_136_;
goto v___jp_115_;
}
else
{
lean_object* v___x_137_; 
v___x_137_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9, &lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9_once, _init_lp_ucc_UCC_Core_instReprADRStatus_repr___closed__9);
v___y_116_ = v___x_137_;
goto v___jp_115_;
}
}
}
v___jp_94_:
{
lean_object* v___x_96_; lean_object* v___x_97_; uint8_t v___x_98_; lean_object* v___x_99_; lean_object* v___x_100_; 
v___x_96_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADRStatus_repr___closed__1));
lean_inc(v___y_95_);
v___x_97_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_97_, 0, v___y_95_);
lean_ctor_set(v___x_97_, 1, v___x_96_);
v___x_98_ = 0;
v___x_99_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_99_, 0, v___x_97_);
lean_ctor_set_uint8(v___x_99_, sizeof(void*)*1, v___x_98_);
v___x_100_ = l_Repr_addAppParen(v___x_99_, v_prec_93_);
return v___x_100_;
}
v___jp_101_:
{
lean_object* v___x_103_; lean_object* v___x_104_; uint8_t v___x_105_; lean_object* v___x_106_; lean_object* v___x_107_; 
v___x_103_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADRStatus_repr___closed__3));
lean_inc(v___y_102_);
v___x_104_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_104_, 0, v___y_102_);
lean_ctor_set(v___x_104_, 1, v___x_103_);
v___x_105_ = 0;
v___x_106_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_106_, 0, v___x_104_);
lean_ctor_set_uint8(v___x_106_, sizeof(void*)*1, v___x_105_);
v___x_107_ = l_Repr_addAppParen(v___x_106_, v_prec_93_);
return v___x_107_;
}
v___jp_108_:
{
lean_object* v___x_110_; lean_object* v___x_111_; uint8_t v___x_112_; lean_object* v___x_113_; lean_object* v___x_114_; 
v___x_110_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADRStatus_repr___closed__5));
lean_inc(v___y_109_);
v___x_111_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_111_, 0, v___y_109_);
lean_ctor_set(v___x_111_, 1, v___x_110_);
v___x_112_ = 0;
v___x_113_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_113_, 0, v___x_111_);
lean_ctor_set_uint8(v___x_113_, sizeof(void*)*1, v___x_112_);
v___x_114_ = l_Repr_addAppParen(v___x_113_, v_prec_93_);
return v___x_114_;
}
v___jp_115_:
{
lean_object* v___x_117_; lean_object* v___x_118_; uint8_t v___x_119_; lean_object* v___x_120_; lean_object* v___x_121_; 
v___x_117_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADRStatus_repr___closed__7));
lean_inc(v___y_116_);
v___x_118_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_118_, 0, v___y_116_);
lean_ctor_set(v___x_118_, 1, v___x_117_);
v___x_119_ = 0;
v___x_120_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_120_, 0, v___x_118_);
lean_ctor_set_uint8(v___x_120_, sizeof(void*)*1, v___x_119_);
v___x_121_ = l_Repr_addAppParen(v___x_120_, v_prec_93_);
return v___x_121_;
}
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADRStatus_repr___boxed(lean_object* v_x_138_, lean_object* v_prec_139_){
_start:
{
uint8_t v_x_233__boxed_140_; lean_object* v_res_141_; 
v_x_233__boxed_140_ = lean_unbox(v_x_138_);
v_res_141_ = lp_ucc_UCC_Core_instReprADRStatus_repr(v_x_233__boxed_140_, v_prec_139_);
lean_dec(v_prec_139_);
return v_res_141_;
}
}
LEAN_EXPORT uint8_t lp_ucc_UCC_Core_ADRStatus_ofNat(lean_object* v_n_144_){
_start:
{
lean_object* v___x_145_; uint8_t v___x_146_; 
v___x_145_ = lean_unsigned_to_nat(1u);
v___x_146_ = lean_nat_dec_le(v_n_144_, v___x_145_);
if (v___x_146_ == 0)
{
lean_object* v___x_147_; uint8_t v___x_148_; 
v___x_147_ = lean_unsigned_to_nat(2u);
v___x_148_ = lean_nat_dec_le(v_n_144_, v___x_147_);
if (v___x_148_ == 0)
{
uint8_t v___x_149_; 
v___x_149_ = 3;
return v___x_149_;
}
else
{
uint8_t v___x_150_; 
v___x_150_ = 2;
return v___x_150_;
}
}
else
{
lean_object* v___x_151_; uint8_t v___x_152_; 
v___x_151_ = lean_unsigned_to_nat(0u);
v___x_152_ = lean_nat_dec_le(v_n_144_, v___x_151_);
if (v___x_152_ == 0)
{
uint8_t v___x_153_; 
v___x_153_ = 1;
return v___x_153_;
}
else
{
uint8_t v___x_154_; 
v___x_154_ = 0;
return v___x_154_;
}
}
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_ADRStatus_ofNat___boxed(lean_object* v_n_155_){
_start:
{
uint8_t v_res_156_; lean_object* v_r_157_; 
v_res_156_ = lp_ucc_UCC_Core_ADRStatus_ofNat(v_n_155_);
lean_dec(v_n_155_);
v_r_157_ = lean_box(v_res_156_);
return v_r_157_;
}
}
LEAN_EXPORT uint8_t lp_ucc_UCC_Core_instDecidableEqADRStatus(uint8_t v_x_158_, uint8_t v_y_159_){
_start:
{
lean_object* v___x_160_; lean_object* v___x_161_; uint8_t v___x_162_; 
v___x_160_ = lp_ucc_UCC_Core_ADRStatus_ctorIdx(v_x_158_);
v___x_161_ = lp_ucc_UCC_Core_ADRStatus_ctorIdx(v_y_159_);
v___x_162_ = lean_nat_dec_eq(v___x_160_, v___x_161_);
lean_dec(v___x_161_);
lean_dec(v___x_160_);
return v___x_162_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instDecidableEqADRStatus___boxed(lean_object* v_x_163_, lean_object* v_y_164_){
_start:
{
uint8_t v_x_13__boxed_165_; uint8_t v_y_14__boxed_166_; uint8_t v_res_167_; lean_object* v_r_168_; 
v_x_13__boxed_165_ = lean_unbox(v_x_163_);
v_y_14__boxed_166_ = lean_unbox(v_y_164_);
v_res_167_ = lp_ucc_UCC_Core_instDecidableEqADRStatus(v_x_13__boxed_165_, v_y_14__boxed_166_);
v_r_168_ = lean_box(v_res_167_);
return v_r_168_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__7(void){
_start:
{
lean_object* v___x_182_; lean_object* v___x_183_; 
v___x_182_ = lean_unsigned_to_nat(7u);
v___x_183_ = lean_nat_to_int(v___x_182_);
return v___x_183_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__12(void){
_start:
{
lean_object* v___x_190_; lean_object* v___x_191_; 
v___x_190_ = lean_unsigned_to_nat(15u);
v___x_191_ = lean_nat_to_int(v___x_190_);
return v___x_191_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__14(void){
_start:
{
lean_object* v___x_193_; lean_object* v___x_194_; 
v___x_193_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__0));
v___x_194_ = lean_string_length(v___x_193_);
return v___x_194_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15(void){
_start:
{
lean_object* v___x_195_; lean_object* v___x_196_; 
v___x_195_ = lean_obj_once(&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__14, &lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__14_once, _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__14);
v___x_196_ = lean_nat_to_int(v___x_195_);
return v___x_196_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg(lean_object* v_x_201_){
_start:
{
lean_object* v_url_202_; lean_object* v_description_203_; lean_object* v___x_205_; uint8_t v_isShared_206_; uint8_t v_isSharedCheck_238_; 
v_url_202_ = lean_ctor_get(v_x_201_, 0);
v_description_203_ = lean_ctor_get(v_x_201_, 1);
v_isSharedCheck_238_ = !lean_is_exclusive(v_x_201_);
if (v_isSharedCheck_238_ == 0)
{
v___x_205_ = v_x_201_;
v_isShared_206_ = v_isSharedCheck_238_;
goto v_resetjp_204_;
}
else
{
lean_inc(v_description_203_);
lean_inc(v_url_202_);
lean_dec(v_x_201_);
v___x_205_ = lean_box(0);
v_isShared_206_ = v_isSharedCheck_238_;
goto v_resetjp_204_;
}
v_resetjp_204_:
{
lean_object* v___x_207_; lean_object* v___x_208_; lean_object* v___x_209_; lean_object* v___x_210_; lean_object* v___x_211_; lean_object* v___x_213_; 
v___x_207_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__5));
v___x_208_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__6));
v___x_209_ = lean_obj_once(&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__7, &lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__7_once, _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__7);
v___x_210_ = l_String_quote(v_url_202_);
v___x_211_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_211_, 0, v___x_210_);
if (v_isShared_206_ == 0)
{
lean_ctor_set_tag(v___x_205_, 4);
lean_ctor_set(v___x_205_, 1, v___x_211_);
lean_ctor_set(v___x_205_, 0, v___x_209_);
v___x_213_ = v___x_205_;
goto v_reusejp_212_;
}
else
{
lean_object* v_reuseFailAlloc_237_; 
v_reuseFailAlloc_237_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v_reuseFailAlloc_237_, 0, v___x_209_);
lean_ctor_set(v_reuseFailAlloc_237_, 1, v___x_211_);
v___x_213_ = v_reuseFailAlloc_237_;
goto v_reusejp_212_;
}
v_reusejp_212_:
{
uint8_t v___x_214_; lean_object* v___x_215_; lean_object* v___x_216_; lean_object* v___x_217_; lean_object* v___x_218_; lean_object* v___x_219_; lean_object* v___x_220_; lean_object* v___x_221_; lean_object* v___x_222_; lean_object* v___x_223_; lean_object* v___x_224_; lean_object* v___x_225_; lean_object* v___x_226_; lean_object* v___x_227_; lean_object* v___x_228_; lean_object* v___x_229_; lean_object* v___x_230_; lean_object* v___x_231_; lean_object* v___x_232_; lean_object* v___x_233_; lean_object* v___x_234_; lean_object* v___x_235_; lean_object* v___x_236_; 
v___x_214_ = 0;
v___x_215_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_215_, 0, v___x_213_);
lean_ctor_set_uint8(v___x_215_, sizeof(void*)*1, v___x_214_);
v___x_216_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_216_, 0, v___x_208_);
lean_ctor_set(v___x_216_, 1, v___x_215_);
v___x_217_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__9));
v___x_218_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_218_, 0, v___x_216_);
lean_ctor_set(v___x_218_, 1, v___x_217_);
v___x_219_ = lean_box(1);
v___x_220_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_220_, 0, v___x_218_);
lean_ctor_set(v___x_220_, 1, v___x_219_);
v___x_221_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__11));
v___x_222_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_222_, 0, v___x_220_);
lean_ctor_set(v___x_222_, 1, v___x_221_);
v___x_223_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_223_, 0, v___x_222_);
lean_ctor_set(v___x_223_, 1, v___x_207_);
v___x_224_ = lean_obj_once(&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__12, &lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__12_once, _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__12);
v___x_225_ = l_String_quote(v_description_203_);
v___x_226_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_226_, 0, v___x_225_);
v___x_227_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_227_, 0, v___x_224_);
lean_ctor_set(v___x_227_, 1, v___x_226_);
v___x_228_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_228_, 0, v___x_227_);
lean_ctor_set_uint8(v___x_228_, sizeof(void*)*1, v___x_214_);
v___x_229_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_229_, 0, v___x_223_);
lean_ctor_set(v___x_229_, 1, v___x_228_);
v___x_230_ = lean_obj_once(&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15, &lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15_once, _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15);
v___x_231_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__16));
v___x_232_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_232_, 0, v___x_231_);
lean_ctor_set(v___x_232_, 1, v___x_229_);
v___x_233_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__17));
v___x_234_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_234_, 0, v___x_232_);
lean_ctor_set(v___x_234_, 1, v___x_233_);
v___x_235_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_235_, 0, v___x_230_);
lean_ctor_set(v___x_235_, 1, v___x_234_);
v___x_236_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_236_, 0, v___x_235_);
lean_ctor_set_uint8(v___x_236_, sizeof(void*)*1, v___x_214_);
return v___x_236_;
}
}
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr(lean_object* v_x_239_, lean_object* v_prec_240_){
_start:
{
lean_object* v___x_241_; 
v___x_241_ = lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg(v_x_239_);
return v___x_241_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprArtifactLink_repr___boxed(lean_object* v_x_242_, lean_object* v_prec_243_){
_start:
{
lean_object* v_res_244_; 
v_res_244_ = lp_ucc_UCC_Core_instReprArtifactLink_repr(v_x_242_, v_prec_243_);
lean_dec(v_prec_243_);
return v_res_244_;
}
}
LEAN_EXPORT lean_object* lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0(lean_object* v_x_253_, lean_object* v_x_254_){
_start:
{
if (lean_obj_tag(v_x_253_) == 0)
{
lean_object* v___x_255_; 
v___x_255_ = ((lean_object*)(lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__1));
return v___x_255_;
}
else
{
lean_object* v_val_256_; lean_object* v___x_258_; uint8_t v_isShared_259_; uint8_t v_isSharedCheck_267_; 
v_val_256_ = lean_ctor_get(v_x_253_, 0);
v_isSharedCheck_267_ = !lean_is_exclusive(v_x_253_);
if (v_isSharedCheck_267_ == 0)
{
v___x_258_ = v_x_253_;
v_isShared_259_ = v_isSharedCheck_267_;
goto v_resetjp_257_;
}
else
{
lean_inc(v_val_256_);
lean_dec(v_x_253_);
v___x_258_ = lean_box(0);
v_isShared_259_ = v_isSharedCheck_267_;
goto v_resetjp_257_;
}
v_resetjp_257_:
{
lean_object* v___x_260_; lean_object* v___x_261_; lean_object* v___x_263_; 
v___x_260_ = ((lean_object*)(lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___closed__3));
v___x_261_ = l_String_quote(v_val_256_);
if (v_isShared_259_ == 0)
{
lean_ctor_set_tag(v___x_258_, 3);
lean_ctor_set(v___x_258_, 0, v___x_261_);
v___x_263_ = v___x_258_;
goto v_reusejp_262_;
}
else
{
lean_object* v_reuseFailAlloc_266_; 
v_reuseFailAlloc_266_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v_reuseFailAlloc_266_, 0, v___x_261_);
v___x_263_ = v_reuseFailAlloc_266_;
goto v_reusejp_262_;
}
v_reusejp_262_:
{
lean_object* v___x_264_; lean_object* v___x_265_; 
v___x_264_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_264_, 0, v___x_260_);
lean_ctor_set(v___x_264_, 1, v___x_263_);
v___x_265_ = l_Repr_addAppParen(v___x_264_, v_x_254_);
return v___x_265_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0___boxed(lean_object* v_x_268_, lean_object* v_x_269_){
_start:
{
lean_object* v_res_270_; 
v_res_270_ = lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0(v_x_268_, v_x_269_);
lean_dec(v_x_269_);
return v_res_270_;
}
}
LEAN_EXPORT lean_object* lp_ucc_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1_spec__2_spec__3(lean_object* v_x_271_, lean_object* v_x_272_, lean_object* v_x_273_){
_start:
{
if (lean_obj_tag(v_x_273_) == 0)
{
lean_dec(v_x_271_);
return v_x_272_;
}
else
{
lean_object* v_head_274_; lean_object* v_tail_275_; lean_object* v___x_277_; uint8_t v_isShared_278_; uint8_t v_isSharedCheck_285_; 
v_head_274_ = lean_ctor_get(v_x_273_, 0);
v_tail_275_ = lean_ctor_get(v_x_273_, 1);
v_isSharedCheck_285_ = !lean_is_exclusive(v_x_273_);
if (v_isSharedCheck_285_ == 0)
{
v___x_277_ = v_x_273_;
v_isShared_278_ = v_isSharedCheck_285_;
goto v_resetjp_276_;
}
else
{
lean_inc(v_tail_275_);
lean_inc(v_head_274_);
lean_dec(v_x_273_);
v___x_277_ = lean_box(0);
v_isShared_278_ = v_isSharedCheck_285_;
goto v_resetjp_276_;
}
v_resetjp_276_:
{
lean_object* v___x_280_; 
lean_inc(v_x_271_);
if (v_isShared_278_ == 0)
{
lean_ctor_set_tag(v___x_277_, 5);
lean_ctor_set(v___x_277_, 1, v_x_271_);
lean_ctor_set(v___x_277_, 0, v_x_272_);
v___x_280_ = v___x_277_;
goto v_reusejp_279_;
}
else
{
lean_object* v_reuseFailAlloc_284_; 
v_reuseFailAlloc_284_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_284_, 0, v_x_272_);
lean_ctor_set(v_reuseFailAlloc_284_, 1, v_x_271_);
v___x_280_ = v_reuseFailAlloc_284_;
goto v_reusejp_279_;
}
v_reusejp_279_:
{
lean_object* v___x_281_; lean_object* v___x_282_; 
v___x_281_ = lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg(v_head_274_);
v___x_282_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_282_, 0, v___x_280_);
lean_ctor_set(v___x_282_, 1, v___x_281_);
v_x_272_ = v___x_282_;
v_x_273_ = v_tail_275_;
goto _start;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_ucc_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1_spec__2(lean_object* v_x_286_, lean_object* v_x_287_, lean_object* v_x_288_){
_start:
{
if (lean_obj_tag(v_x_288_) == 0)
{
lean_dec(v_x_286_);
return v_x_287_;
}
else
{
lean_object* v_head_289_; lean_object* v_tail_290_; lean_object* v___x_292_; uint8_t v_isShared_293_; uint8_t v_isSharedCheck_300_; 
v_head_289_ = lean_ctor_get(v_x_288_, 0);
v_tail_290_ = lean_ctor_get(v_x_288_, 1);
v_isSharedCheck_300_ = !lean_is_exclusive(v_x_288_);
if (v_isSharedCheck_300_ == 0)
{
v___x_292_ = v_x_288_;
v_isShared_293_ = v_isSharedCheck_300_;
goto v_resetjp_291_;
}
else
{
lean_inc(v_tail_290_);
lean_inc(v_head_289_);
lean_dec(v_x_288_);
v___x_292_ = lean_box(0);
v_isShared_293_ = v_isSharedCheck_300_;
goto v_resetjp_291_;
}
v_resetjp_291_:
{
lean_object* v___x_295_; 
lean_inc(v_x_286_);
if (v_isShared_293_ == 0)
{
lean_ctor_set_tag(v___x_292_, 5);
lean_ctor_set(v___x_292_, 1, v_x_286_);
lean_ctor_set(v___x_292_, 0, v_x_287_);
v___x_295_ = v___x_292_;
goto v_reusejp_294_;
}
else
{
lean_object* v_reuseFailAlloc_299_; 
v_reuseFailAlloc_299_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_299_, 0, v_x_287_);
lean_ctor_set(v_reuseFailAlloc_299_, 1, v_x_286_);
v___x_295_ = v_reuseFailAlloc_299_;
goto v_reusejp_294_;
}
v_reusejp_294_:
{
lean_object* v___x_296_; lean_object* v___x_297_; lean_object* v___x_298_; 
v___x_296_ = lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg(v_head_289_);
v___x_297_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_297_, 0, v___x_295_);
lean_ctor_set(v___x_297_, 1, v___x_296_);
v___x_298_ = lp_ucc_List_foldl___at___00List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1_spec__2_spec__3(v_x_286_, v___x_297_, v_tail_290_);
return v___x_298_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_ucc_Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1(lean_object* v_x_301_, lean_object* v_x_302_){
_start:
{
if (lean_obj_tag(v_x_301_) == 0)
{
lean_object* v___x_303_; 
lean_dec(v_x_302_);
v___x_303_ = lean_box(0);
return v___x_303_;
}
else
{
lean_object* v_tail_304_; 
v_tail_304_ = lean_ctor_get(v_x_301_, 1);
if (lean_obj_tag(v_tail_304_) == 0)
{
lean_object* v_head_305_; lean_object* v___x_306_; 
lean_dec(v_x_302_);
v_head_305_ = lean_ctor_get(v_x_301_, 0);
lean_inc(v_head_305_);
lean_dec_ref_known(v_x_301_, 2);
v___x_306_ = lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg(v_head_305_);
return v___x_306_;
}
else
{
lean_object* v_head_307_; lean_object* v___x_308_; lean_object* v___x_309_; 
lean_inc(v_tail_304_);
v_head_307_ = lean_ctor_get(v_x_301_, 0);
lean_inc(v_head_307_);
lean_dec_ref_known(v_x_301_, 2);
v___x_308_ = lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg(v_head_307_);
v___x_309_ = lp_ucc_List_foldl___at___00Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1_spec__2(v_x_302_, v___x_308_, v_tail_304_);
return v___x_309_;
}
}
}
}
static lean_object* _init_lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__5(void){
_start:
{
lean_object* v___x_318_; lean_object* v___x_319_; 
v___x_318_ = ((lean_object*)(lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__2));
v___x_319_ = lean_string_length(v___x_318_);
return v___x_319_;
}
}
static lean_object* _init_lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__6(void){
_start:
{
lean_object* v___x_320_; lean_object* v___x_321_; 
v___x_320_ = lean_obj_once(&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__5, &lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__5_once, _init_lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__5);
v___x_321_ = lean_nat_to_int(v___x_320_);
return v___x_321_;
}
}
LEAN_EXPORT lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg(lean_object* v_a_326_){
_start:
{
if (lean_obj_tag(v_a_326_) == 0)
{
lean_object* v___x_327_; 
v___x_327_ = ((lean_object*)(lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__1));
return v___x_327_;
}
else
{
lean_object* v___x_328_; lean_object* v___x_329_; lean_object* v___x_330_; lean_object* v___x_331_; lean_object* v___x_332_; lean_object* v___x_333_; lean_object* v___x_334_; lean_object* v___x_335_; uint8_t v___x_336_; lean_object* v___x_337_; 
v___x_328_ = ((lean_object*)(lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__3));
v___x_329_ = lp_ucc_Std_Format_joinSep___at___00List_repr___at___00UCC_Core_instReprADR_repr_spec__1_spec__1(v_a_326_, v___x_328_);
v___x_330_ = lean_obj_once(&lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__6, &lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__6_once, _init_lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__6);
v___x_331_ = ((lean_object*)(lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__7));
v___x_332_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_332_, 0, v___x_331_);
lean_ctor_set(v___x_332_, 1, v___x_329_);
v___x_333_ = ((lean_object*)(lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg___closed__8));
v___x_334_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_334_, 0, v___x_332_);
lean_ctor_set(v___x_334_, 1, v___x_333_);
v___x_335_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_335_, 0, v___x_330_);
lean_ctor_set(v___x_335_, 1, v___x_334_);
v___x_336_ = 0;
v___x_337_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_337_, 0, v___x_335_);
lean_ctor_set_uint8(v___x_337_, sizeof(void*)*1, v___x_336_);
return v___x_337_;
}
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__4(void){
_start:
{
lean_object* v___x_347_; lean_object* v___x_348_; 
v___x_347_ = lean_unsigned_to_nat(6u);
v___x_348_ = lean_nat_to_int(v___x_347_);
return v___x_348_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__7(void){
_start:
{
lean_object* v___x_352_; lean_object* v___x_353_; 
v___x_352_ = lean_unsigned_to_nat(9u);
v___x_353_ = lean_nat_to_int(v___x_352_);
return v___x_353_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__10(void){
_start:
{
lean_object* v___x_357_; lean_object* v___x_358_; 
v___x_357_ = lean_unsigned_to_nat(10u);
v___x_358_ = lean_nat_to_int(v___x_357_);
return v___x_358_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__13(void){
_start:
{
lean_object* v___x_362_; lean_object* v___x_363_; 
v___x_362_ = lean_unsigned_to_nat(11u);
v___x_363_ = lean_nat_to_int(v___x_362_);
return v___x_363_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__16(void){
_start:
{
lean_object* v___x_367_; lean_object* v___x_368_; 
v___x_367_ = lean_unsigned_to_nat(12u);
v___x_368_ = lean_nat_to_int(v___x_367_);
return v___x_368_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__19(void){
_start:
{
lean_object* v___x_372_; lean_object* v___x_373_; 
v___x_372_ = lean_unsigned_to_nat(16u);
v___x_373_ = lean_nat_to_int(v___x_372_);
return v___x_373_;
}
}
static lean_object* _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__22(void){
_start:
{
lean_object* v___x_377_; lean_object* v___x_378_; 
v___x_377_ = lean_unsigned_to_nat(14u);
v___x_378_ = lean_nat_to_int(v___x_377_);
return v___x_378_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADR_repr___redArg(lean_object* v_x_382_){
_start:
{
lean_object* v_id_383_; lean_object* v_title_384_; uint8_t v_status_385_; lean_object* v_context_386_; lean_object* v_decision_387_; lean_object* v_consequences_388_; lean_object* v_supersedes_389_; lean_object* v_links_390_; lean_object* v___x_391_; lean_object* v___x_392_; lean_object* v___x_393_; lean_object* v___x_394_; lean_object* v___x_395_; lean_object* v___x_396_; uint8_t v___x_397_; lean_object* v___x_398_; lean_object* v___x_399_; lean_object* v___x_400_; lean_object* v___x_401_; lean_object* v___x_402_; lean_object* v___x_403_; lean_object* v___x_404_; lean_object* v___x_405_; lean_object* v___x_406_; lean_object* v___x_407_; lean_object* v___x_408_; lean_object* v___x_409_; lean_object* v___x_410_; lean_object* v___x_411_; lean_object* v___x_412_; lean_object* v___x_413_; lean_object* v___x_414_; lean_object* v___x_415_; lean_object* v___x_416_; lean_object* v___x_417_; lean_object* v___x_418_; lean_object* v___x_419_; lean_object* v___x_420_; lean_object* v___x_421_; lean_object* v___x_422_; lean_object* v___x_423_; lean_object* v___x_424_; lean_object* v___x_425_; lean_object* v___x_426_; lean_object* v___x_427_; lean_object* v___x_428_; lean_object* v___x_429_; lean_object* v___x_430_; lean_object* v___x_431_; lean_object* v___x_432_; lean_object* v___x_433_; lean_object* v___x_434_; lean_object* v___x_435_; lean_object* v___x_436_; lean_object* v___x_437_; lean_object* v___x_438_; lean_object* v___x_439_; lean_object* v___x_440_; lean_object* v___x_441_; lean_object* v___x_442_; lean_object* v___x_443_; lean_object* v___x_444_; lean_object* v___x_445_; lean_object* v___x_446_; lean_object* v___x_447_; lean_object* v___x_448_; lean_object* v___x_449_; lean_object* v___x_450_; lean_object* v___x_451_; lean_object* v___x_452_; lean_object* v___x_453_; lean_object* v___x_454_; lean_object* v___x_455_; lean_object* v___x_456_; lean_object* v___x_457_; lean_object* v___x_458_; lean_object* v___x_459_; lean_object* v___x_460_; lean_object* v___x_461_; lean_object* v___x_462_; lean_object* v___x_463_; lean_object* v___x_464_; lean_object* v___x_465_; lean_object* v___x_466_; lean_object* v___x_467_; lean_object* v___x_468_; lean_object* v___x_469_; lean_object* v___x_470_; lean_object* v___x_471_; lean_object* v___x_472_; lean_object* v___x_473_; lean_object* v___x_474_; lean_object* v___x_475_; lean_object* v___x_476_; lean_object* v___x_477_; lean_object* v___x_478_; lean_object* v___x_479_; lean_object* v___x_480_; lean_object* v___x_481_; 
v_id_383_ = lean_ctor_get(v_x_382_, 0);
lean_inc_ref(v_id_383_);
v_title_384_ = lean_ctor_get(v_x_382_, 1);
lean_inc_ref(v_title_384_);
v_status_385_ = lean_ctor_get_uint8(v_x_382_, sizeof(void*)*7);
v_context_386_ = lean_ctor_get(v_x_382_, 2);
lean_inc_ref(v_context_386_);
v_decision_387_ = lean_ctor_get(v_x_382_, 3);
lean_inc_ref(v_decision_387_);
v_consequences_388_ = lean_ctor_get(v_x_382_, 4);
lean_inc(v_consequences_388_);
v_supersedes_389_ = lean_ctor_get(v_x_382_, 5);
lean_inc(v_supersedes_389_);
v_links_390_ = lean_ctor_get(v_x_382_, 6);
lean_inc(v_links_390_);
lean_dec_ref(v_x_382_);
v___x_391_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__5));
v___x_392_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__3));
v___x_393_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__4, &lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__4_once, _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__4);
v___x_394_ = l_String_quote(v_id_383_);
v___x_395_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_395_, 0, v___x_394_);
v___x_396_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_396_, 0, v___x_393_);
lean_ctor_set(v___x_396_, 1, v___x_395_);
v___x_397_ = 0;
v___x_398_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_398_, 0, v___x_396_);
lean_ctor_set_uint8(v___x_398_, sizeof(void*)*1, v___x_397_);
v___x_399_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_399_, 0, v___x_392_);
lean_ctor_set(v___x_399_, 1, v___x_398_);
v___x_400_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__9));
v___x_401_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_401_, 0, v___x_399_);
lean_ctor_set(v___x_401_, 1, v___x_400_);
v___x_402_ = lean_box(1);
v___x_403_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_403_, 0, v___x_401_);
lean_ctor_set(v___x_403_, 1, v___x_402_);
v___x_404_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__6));
v___x_405_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_405_, 0, v___x_403_);
lean_ctor_set(v___x_405_, 1, v___x_404_);
v___x_406_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_406_, 0, v___x_405_);
lean_ctor_set(v___x_406_, 1, v___x_391_);
v___x_407_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__7, &lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__7_once, _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__7);
v___x_408_ = l_String_quote(v_title_384_);
v___x_409_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_409_, 0, v___x_408_);
v___x_410_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_410_, 0, v___x_407_);
lean_ctor_set(v___x_410_, 1, v___x_409_);
v___x_411_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_411_, 0, v___x_410_);
lean_ctor_set_uint8(v___x_411_, sizeof(void*)*1, v___x_397_);
v___x_412_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_412_, 0, v___x_406_);
lean_ctor_set(v___x_412_, 1, v___x_411_);
v___x_413_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_413_, 0, v___x_412_);
lean_ctor_set(v___x_413_, 1, v___x_400_);
v___x_414_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_414_, 0, v___x_413_);
lean_ctor_set(v___x_414_, 1, v___x_402_);
v___x_415_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__9));
v___x_416_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_416_, 0, v___x_414_);
lean_ctor_set(v___x_416_, 1, v___x_415_);
v___x_417_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_417_, 0, v___x_416_);
lean_ctor_set(v___x_417_, 1, v___x_391_);
v___x_418_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__10, &lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__10_once, _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__10);
v___x_419_ = lean_unsigned_to_nat(0u);
v___x_420_ = lp_ucc_UCC_Core_instReprADRStatus_repr(v_status_385_, v___x_419_);
v___x_421_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_421_, 0, v___x_418_);
lean_ctor_set(v___x_421_, 1, v___x_420_);
v___x_422_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_422_, 0, v___x_421_);
lean_ctor_set_uint8(v___x_422_, sizeof(void*)*1, v___x_397_);
v___x_423_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_423_, 0, v___x_417_);
lean_ctor_set(v___x_423_, 1, v___x_422_);
v___x_424_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_424_, 0, v___x_423_);
lean_ctor_set(v___x_424_, 1, v___x_400_);
v___x_425_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_425_, 0, v___x_424_);
lean_ctor_set(v___x_425_, 1, v___x_402_);
v___x_426_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__12));
v___x_427_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_427_, 0, v___x_425_);
lean_ctor_set(v___x_427_, 1, v___x_426_);
v___x_428_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_428_, 0, v___x_427_);
lean_ctor_set(v___x_428_, 1, v___x_391_);
v___x_429_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__13, &lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__13_once, _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__13);
v___x_430_ = l_String_quote(v_context_386_);
v___x_431_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_431_, 0, v___x_430_);
v___x_432_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_432_, 0, v___x_429_);
lean_ctor_set(v___x_432_, 1, v___x_431_);
v___x_433_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_433_, 0, v___x_432_);
lean_ctor_set_uint8(v___x_433_, sizeof(void*)*1, v___x_397_);
v___x_434_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_434_, 0, v___x_428_);
lean_ctor_set(v___x_434_, 1, v___x_433_);
v___x_435_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_435_, 0, v___x_434_);
lean_ctor_set(v___x_435_, 1, v___x_400_);
v___x_436_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_436_, 0, v___x_435_);
lean_ctor_set(v___x_436_, 1, v___x_402_);
v___x_437_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__15));
v___x_438_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_438_, 0, v___x_436_);
lean_ctor_set(v___x_438_, 1, v___x_437_);
v___x_439_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_439_, 0, v___x_438_);
lean_ctor_set(v___x_439_, 1, v___x_391_);
v___x_440_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__16, &lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__16_once, _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__16);
v___x_441_ = l_String_quote(v_decision_387_);
v___x_442_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_442_, 0, v___x_441_);
v___x_443_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_443_, 0, v___x_440_);
lean_ctor_set(v___x_443_, 1, v___x_442_);
v___x_444_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_444_, 0, v___x_443_);
lean_ctor_set_uint8(v___x_444_, sizeof(void*)*1, v___x_397_);
v___x_445_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_445_, 0, v___x_439_);
lean_ctor_set(v___x_445_, 1, v___x_444_);
v___x_446_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_446_, 0, v___x_445_);
lean_ctor_set(v___x_446_, 1, v___x_400_);
v___x_447_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_447_, 0, v___x_446_);
lean_ctor_set(v___x_447_, 1, v___x_402_);
v___x_448_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__18));
v___x_449_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_449_, 0, v___x_447_);
lean_ctor_set(v___x_449_, 1, v___x_448_);
v___x_450_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_450_, 0, v___x_449_);
lean_ctor_set(v___x_450_, 1, v___x_391_);
v___x_451_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__19, &lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__19_once, _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__19);
v___x_452_ = l_List_repr_x27___at___00Lean_Syntax_instReprPreresolved_repr_spec__0___redArg(v_consequences_388_);
v___x_453_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_453_, 0, v___x_451_);
lean_ctor_set(v___x_453_, 1, v___x_452_);
v___x_454_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_454_, 0, v___x_453_);
lean_ctor_set_uint8(v___x_454_, sizeof(void*)*1, v___x_397_);
v___x_455_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_455_, 0, v___x_450_);
lean_ctor_set(v___x_455_, 1, v___x_454_);
v___x_456_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_456_, 0, v___x_455_);
lean_ctor_set(v___x_456_, 1, v___x_400_);
v___x_457_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_457_, 0, v___x_456_);
lean_ctor_set(v___x_457_, 1, v___x_402_);
v___x_458_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__21));
v___x_459_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_459_, 0, v___x_457_);
lean_ctor_set(v___x_459_, 1, v___x_458_);
v___x_460_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_460_, 0, v___x_459_);
lean_ctor_set(v___x_460_, 1, v___x_391_);
v___x_461_ = lean_obj_once(&lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__22, &lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__22_once, _init_lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__22);
v___x_462_ = lp_ucc_Option_repr___at___00UCC_Core_instReprADR_repr_spec__0(v_supersedes_389_, v___x_419_);
v___x_463_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_463_, 0, v___x_461_);
lean_ctor_set(v___x_463_, 1, v___x_462_);
v___x_464_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_464_, 0, v___x_463_);
lean_ctor_set_uint8(v___x_464_, sizeof(void*)*1, v___x_397_);
v___x_465_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_465_, 0, v___x_460_);
lean_ctor_set(v___x_465_, 1, v___x_464_);
v___x_466_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_466_, 0, v___x_465_);
lean_ctor_set(v___x_466_, 1, v___x_400_);
v___x_467_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_467_, 0, v___x_466_);
lean_ctor_set(v___x_467_, 1, v___x_402_);
v___x_468_ = ((lean_object*)(lp_ucc_UCC_Core_instReprADR_repr___redArg___closed__24));
v___x_469_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_469_, 0, v___x_467_);
lean_ctor_set(v___x_469_, 1, v___x_468_);
v___x_470_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_470_, 0, v___x_469_);
lean_ctor_set(v___x_470_, 1, v___x_391_);
v___x_471_ = lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg(v_links_390_);
v___x_472_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_472_, 0, v___x_407_);
lean_ctor_set(v___x_472_, 1, v___x_471_);
v___x_473_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_473_, 0, v___x_472_);
lean_ctor_set_uint8(v___x_473_, sizeof(void*)*1, v___x_397_);
v___x_474_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_474_, 0, v___x_470_);
lean_ctor_set(v___x_474_, 1, v___x_473_);
v___x_475_ = lean_obj_once(&lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15, &lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15_once, _init_lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__15);
v___x_476_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__16));
v___x_477_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_477_, 0, v___x_476_);
lean_ctor_set(v___x_477_, 1, v___x_474_);
v___x_478_ = ((lean_object*)(lp_ucc_UCC_Core_instReprArtifactLink_repr___redArg___closed__17));
v___x_479_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_479_, 0, v___x_477_);
lean_ctor_set(v___x_479_, 1, v___x_478_);
v___x_480_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_480_, 0, v___x_475_);
lean_ctor_set(v___x_480_, 1, v___x_479_);
v___x_481_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_481_, 0, v___x_480_);
lean_ctor_set_uint8(v___x_481_, sizeof(void*)*1, v___x_397_);
return v___x_481_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADR_repr(lean_object* v_x_482_, lean_object* v_prec_483_){
_start:
{
lean_object* v___x_484_; 
v___x_484_ = lp_ucc_UCC_Core_instReprADR_repr___redArg(v_x_482_);
return v___x_484_;
}
}
LEAN_EXPORT lean_object* lp_ucc_UCC_Core_instReprADR_repr___boxed(lean_object* v_x_485_, lean_object* v_prec_486_){
_start:
{
lean_object* v_res_487_; 
v_res_487_ = lp_ucc_UCC_Core_instReprADR_repr(v_x_485_, v_prec_486_);
lean_dec(v_prec_486_);
return v_res_487_;
}
}
LEAN_EXPORT lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1(lean_object* v_a_488_, lean_object* v_n_489_){
_start:
{
lean_object* v___x_490_; 
v___x_490_ = lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___redArg(v_a_488_);
return v___x_490_;
}
}
LEAN_EXPORT lean_object* lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1___boxed(lean_object* v_a_491_, lean_object* v_n_492_){
_start:
{
lean_object* v_res_493_; 
v_res_493_ = lp_ucc_List_repr___at___00UCC_Core_instReprADR_repr_spec__1(v_a_491_, v_n_492_);
lean_dec(v_n_492_);
return v_res_493_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
void lean_initialize_runtime_module();
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_ucc_UCC_Core(uint8_t builtin) {
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
