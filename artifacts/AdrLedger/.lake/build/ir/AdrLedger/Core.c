// Lean compiler output
// Module: AdrLedger.Core
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
uint8_t lean_string_dec_eq(lean_object*, lean_object*);
uint8_t lean_nat_dec_eq(lean_object*, lean_object*);
lean_object* l_String_quote(lean_object*);
lean_object* l_Repr_addAppParen(lean_object*, lean_object*);
uint8_t lean_nat_dec_le(lean_object*, lean_object*);
lean_object* lean_nat_to_int(lean_object*);
uint8_t lean_nat_dec_le(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorIdx(uint8_t);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorIdx___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorElim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorElim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorElim(lean_object*, lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorElim___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_adr005_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_adr005_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_adr005_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_adr005_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_Wire_ofNat(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ofNat___boxed(lean_object*);
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_instDecidableEqWire(uint8_t, uint8_t);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instDecidableEqWire___boxed(lean_object*, lean_object*);
static const lean_string_object lp_AdrLedger_AdrLedger_instReprWire_repr___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 22, .m_capacity = 22, .m_length = 21, .m_data = "AdrLedger.Wire.adr005"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr___closed__0 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__0_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprWire_repr___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__0_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr___closed__1 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__1_value;
static const lean_string_object lp_AdrLedger_AdrLedger_instReprWire_repr___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 28, .m_capacity = 28, .m_length = 27, .m_data = "AdrLedger.Wire.unboundDraft"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr___closed__2 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__2_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprWire_repr___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__2_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr___closed__3 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__3_value;
static lean_once_cell_t lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4;
static lean_once_cell_t lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once = LEAN_ONCE_CELL_INITIALIZER;
static lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5;
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr(uint8_t, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_AdrLedger_AdrLedger_instReprWire___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_AdrLedger_AdrLedger_instReprWire_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_AdrLedger_AdrLedger_instReprWire___closed__0 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprWire___closed__0_value;
LEAN_EXPORT const lean_object* lp_AdrLedger_AdrLedger_instReprWire = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprWire___closed__0_value;
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_hideAccepts(uint8_t);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_hideAccepts___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorIdx(uint8_t);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorIdx___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorElim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorElim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorElim(lean_object*, lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorElim___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_proposed_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_proposed_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_proposed_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_proposed_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_accepted_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_accepted_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_accepted_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_accepted_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_deprecated_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_deprecated_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_deprecated_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_deprecated_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_superseded_elim___redArg(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_superseded_elim___redArg___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_superseded_elim(lean_object*, uint8_t, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_superseded_elim___boxed(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_Status_ofNat(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ofNat___boxed(lean_object*);
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_instDecidableEqStatus(uint8_t, uint8_t);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instDecidableEqStatus___boxed(lean_object*, lean_object*);
static const lean_string_object lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 26, .m_capacity = 26, .m_length = 25, .m_data = "AdrLedger.Status.proposed"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__0 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__0_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__0_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__1 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__1_value;
static const lean_string_object lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 26, .m_capacity = 26, .m_length = 25, .m_data = "AdrLedger.Status.accepted"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__2 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__2_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__2_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__3 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__3_value;
static const lean_string_object lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 28, .m_capacity = 28, .m_length = 27, .m_data = "AdrLedger.Status.deprecated"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__4 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__4_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__4_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__5 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__5_value;
static const lean_string_object lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 28, .m_capacity = 28, .m_length = 27, .m_data = "AdrLedger.Status.superseded"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__6 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__6_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__7_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__6_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__7 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__7_value;
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr(uint8_t, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_AdrLedger_AdrLedger_instReprStatus___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_AdrLedger_AdrLedger_instReprStatus_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_AdrLedger_AdrLedger_instReprStatus___closed__0 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus___closed__0_value;
LEAN_EXPORT const lean_object* lp_AdrLedger_AdrLedger_instReprStatus = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprStatus___closed__0_value;
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorIdx(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorIdx___boxed(lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorElim(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorElim___boxed(lean_object*, lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_publish_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_publish_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_accept_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_accept_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_deprecate_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_deprecate_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_supersede_elim___redArg(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_supersede_elim(lean_object*, lean_object*, lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_instDecidableEqEvent_decEq(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instDecidableEqEvent_decEq___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_instDecidableEqEvent(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instDecidableEqEvent___boxed(lean_object*, lean_object*);
static const lean_string_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 24, .m_capacity = 24, .m_length = 23, .m_data = "AdrLedger.Event.publish"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__0 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__0_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__0_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__1 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__1_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__1_value),((lean_object*)(((size_t)(1) << 1) | 1))}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__2 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__2_value;
static const lean_string_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 23, .m_capacity = 23, .m_length = 22, .m_data = "AdrLedger.Event.accept"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__3 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__3_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__4_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__3_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__4 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__4_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__5_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__4_value),((lean_object*)(((size_t)(1) << 1) | 1))}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__5 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__5_value;
static const lean_string_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__6_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 26, .m_capacity = 26, .m_length = 25, .m_data = "AdrLedger.Event.deprecate"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__6 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__6_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__7_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__6_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__7 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__7_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__8_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__7_value),((lean_object*)(((size_t)(1) << 1) | 1))}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__8 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__8_value;
static const lean_string_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__9_value = {.m_header = {.m_rc = 0, .m_cs_sz = 0, .m_other = 0, .m_tag = 249}, .m_size = 26, .m_capacity = 26, .m_length = 25, .m_data = "AdrLedger.Event.supersede"};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__9 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__9_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__10_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 3}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__9_value)}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__10 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__10_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__11_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*2 + 0, .m_other = 2, .m_tag = 5}, .m_objs = {((lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__10_value),((lean_object*)(((size_t)(1) << 1) | 1))}};
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__11 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__11_value;
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___boxed(lean_object*, lean_object*);
static const lean_closure_object lp_AdrLedger_AdrLedger_instReprEvent___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_closure_object) + sizeof(void*)*0, .m_other = 0, .m_tag = 245}, .m_fun = (void*)lp_AdrLedger_AdrLedger_instReprEvent_repr___boxed, .m_arity = 2, .m_num_fixed = 0, .m_objs = {} };
static const lean_object* lp_AdrLedger_AdrLedger_instReprEvent___closed__0 = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent___closed__0_value;
LEAN_EXPORT const lean_object* lp_AdrLedger_AdrLedger_instReprEvent = (const lean_object*)&lp_AdrLedger_AdrLedger_instReprEvent___closed__0_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_getStatus___closed__0_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 1}, .m_objs = {((lean_object*)(((size_t)(0) << 1) | 1))}};
static const lean_object* lp_AdrLedger_AdrLedger_getStatus___closed__0 = (const lean_object*)&lp_AdrLedger_AdrLedger_getStatus___closed__0_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_getStatus___closed__1_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 1}, .m_objs = {((lean_object*)(((size_t)(1) << 1) | 1))}};
static const lean_object* lp_AdrLedger_AdrLedger_getStatus___closed__1 = (const lean_object*)&lp_AdrLedger_AdrLedger_getStatus___closed__1_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_getStatus___closed__2_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 1}, .m_objs = {((lean_object*)(((size_t)(2) << 1) | 1))}};
static const lean_object* lp_AdrLedger_AdrLedger_getStatus___closed__2 = (const lean_object*)&lp_AdrLedger_AdrLedger_getStatus___closed__2_value;
static const lean_ctor_object lp_AdrLedger_AdrLedger_getStatus___closed__3_value = {.m_header = {.m_rc = 0, .m_cs_sz = sizeof(lean_ctor_object) + sizeof(void*)*1 + 0, .m_other = 1, .m_tag = 1}, .m_objs = {((lean_object*)(((size_t)(3) << 1) | 1))}};
static const lean_object* lp_AdrLedger_AdrLedger_getStatus___closed__3 = (const lean_object*)&lp_AdrLedger_AdrLedger_getStatus___closed__3_value;
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_getStatus(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_getStatus___boxed(lean_object*, lean_object*);
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_isKnown(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_isKnown___boxed(lean_object*, lean_object*);
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorIdx(uint8_t v_x_1_){
_start:
{
if (v_x_1_ == 0)
{
lean_object* v___x_2_; 
v___x_2_ = lean_unsigned_to_nat(0u);
return v___x_2_;
}
else
{
lean_object* v___x_3_; 
v___x_3_ = lean_unsigned_to_nat(1u);
return v___x_3_;
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorIdx___boxed(lean_object* v_x_4_){
_start:
{
uint8_t v_x_boxed_5_; lean_object* v_res_6_; 
v_x_boxed_5_ = lean_unbox(v_x_4_);
v_res_6_ = lp_AdrLedger_AdrLedger_Wire_ctorIdx(v_x_boxed_5_);
return v_res_6_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorElim___redArg(lean_object* v_k_7_){
_start:
{
lean_inc(v_k_7_);
return v_k_7_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorElim___redArg___boxed(lean_object* v_k_8_){
_start:
{
lean_object* v_res_9_; 
v_res_9_ = lp_AdrLedger_AdrLedger_Wire_ctorElim___redArg(v_k_8_);
lean_dec(v_k_8_);
return v_res_9_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorElim(lean_object* v_motive_10_, lean_object* v_ctorIdx_11_, uint8_t v_t_12_, lean_object* v_h_13_, lean_object* v_k_14_){
_start:
{
lean_inc(v_k_14_);
return v_k_14_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ctorElim___boxed(lean_object* v_motive_15_, lean_object* v_ctorIdx_16_, lean_object* v_t_17_, lean_object* v_h_18_, lean_object* v_k_19_){
_start:
{
uint8_t v_t_boxed_20_; lean_object* v_res_21_; 
v_t_boxed_20_ = lean_unbox(v_t_17_);
v_res_21_ = lp_AdrLedger_AdrLedger_Wire_ctorElim(v_motive_15_, v_ctorIdx_16_, v_t_boxed_20_, v_h_18_, v_k_19_);
lean_dec(v_k_19_);
lean_dec(v_ctorIdx_16_);
return v_res_21_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_adr005_elim___redArg(lean_object* v_adr005_22_){
_start:
{
lean_inc(v_adr005_22_);
return v_adr005_22_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_adr005_elim___redArg___boxed(lean_object* v_adr005_23_){
_start:
{
lean_object* v_res_24_; 
v_res_24_ = lp_AdrLedger_AdrLedger_Wire_adr005_elim___redArg(v_adr005_23_);
lean_dec(v_adr005_23_);
return v_res_24_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_adr005_elim(lean_object* v_motive_25_, uint8_t v_t_26_, lean_object* v_h_27_, lean_object* v_adr005_28_){
_start:
{
lean_inc(v_adr005_28_);
return v_adr005_28_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_adr005_elim___boxed(lean_object* v_motive_29_, lean_object* v_t_30_, lean_object* v_h_31_, lean_object* v_adr005_32_){
_start:
{
uint8_t v_t_boxed_33_; lean_object* v_res_34_; 
v_t_boxed_33_ = lean_unbox(v_t_30_);
v_res_34_ = lp_AdrLedger_AdrLedger_Wire_adr005_elim(v_motive_29_, v_t_boxed_33_, v_h_31_, v_adr005_32_);
lean_dec(v_adr005_32_);
return v_res_34_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim___redArg(lean_object* v_unboundDraft_35_){
_start:
{
lean_inc(v_unboundDraft_35_);
return v_unboundDraft_35_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim___redArg___boxed(lean_object* v_unboundDraft_36_){
_start:
{
lean_object* v_res_37_; 
v_res_37_ = lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim___redArg(v_unboundDraft_36_);
lean_dec(v_unboundDraft_36_);
return v_res_37_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim(lean_object* v_motive_38_, uint8_t v_t_39_, lean_object* v_h_40_, lean_object* v_unboundDraft_41_){
_start:
{
lean_inc(v_unboundDraft_41_);
return v_unboundDraft_41_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim___boxed(lean_object* v_motive_42_, lean_object* v_t_43_, lean_object* v_h_44_, lean_object* v_unboundDraft_45_){
_start:
{
uint8_t v_t_boxed_46_; lean_object* v_res_47_; 
v_t_boxed_46_ = lean_unbox(v_t_43_);
v_res_47_ = lp_AdrLedger_AdrLedger_Wire_unboundDraft_elim(v_motive_42_, v_t_boxed_46_, v_h_44_, v_unboundDraft_45_);
lean_dec(v_unboundDraft_45_);
return v_res_47_;
}
}
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_Wire_ofNat(lean_object* v_n_48_){
_start:
{
lean_object* v___x_49_; uint8_t v___x_50_; 
v___x_49_ = lean_unsigned_to_nat(0u);
v___x_50_ = lean_nat_dec_le(v_n_48_, v___x_49_);
if (v___x_50_ == 0)
{
uint8_t v___x_51_; 
v___x_51_ = 1;
return v___x_51_;
}
else
{
uint8_t v___x_52_; 
v___x_52_ = 0;
return v___x_52_;
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Wire_ofNat___boxed(lean_object* v_n_53_){
_start:
{
uint8_t v_res_54_; lean_object* v_r_55_; 
v_res_54_ = lp_AdrLedger_AdrLedger_Wire_ofNat(v_n_53_);
lean_dec(v_n_53_);
v_r_55_ = lean_box(v_res_54_);
return v_r_55_;
}
}
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_instDecidableEqWire(uint8_t v_x_56_, uint8_t v_y_57_){
_start:
{
lean_object* v___x_58_; lean_object* v___x_59_; uint8_t v___x_60_; 
v___x_58_ = lp_AdrLedger_AdrLedger_Wire_ctorIdx(v_x_56_);
v___x_59_ = lp_AdrLedger_AdrLedger_Wire_ctorIdx(v_y_57_);
v___x_60_ = lean_nat_dec_eq(v___x_58_, v___x_59_);
lean_dec(v___x_59_);
lean_dec(v___x_58_);
return v___x_60_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instDecidableEqWire___boxed(lean_object* v_x_61_, lean_object* v_y_62_){
_start:
{
uint8_t v_x_13__boxed_63_; uint8_t v_y_14__boxed_64_; uint8_t v_res_65_; lean_object* v_r_66_; 
v_x_13__boxed_63_ = lean_unbox(v_x_61_);
v_y_14__boxed_64_ = lean_unbox(v_y_62_);
v_res_65_ = lp_AdrLedger_AdrLedger_instDecidableEqWire(v_x_13__boxed_63_, v_y_14__boxed_64_);
v_r_66_ = lean_box(v_res_65_);
return v_r_66_;
}
}
static lean_object* _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4(void){
_start:
{
lean_object* v___x_73_; lean_object* v___x_74_; 
v___x_73_ = lean_unsigned_to_nat(2u);
v___x_74_ = lean_nat_to_int(v___x_73_);
return v___x_74_;
}
}
static lean_object* _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5(void){
_start:
{
lean_object* v___x_75_; lean_object* v___x_76_; 
v___x_75_ = lean_unsigned_to_nat(1u);
v___x_76_ = lean_nat_to_int(v___x_75_);
return v___x_76_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr(uint8_t v_x_77_, lean_object* v_prec_78_){
_start:
{
lean_object* v___y_80_; lean_object* v___y_87_; 
if (v_x_77_ == 0)
{
lean_object* v___x_93_; uint8_t v___x_94_; 
v___x_93_ = lean_unsigned_to_nat(1024u);
v___x_94_ = lean_nat_dec_le(v___x_93_, v_prec_78_);
if (v___x_94_ == 0)
{
lean_object* v___x_95_; 
v___x_95_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_80_ = v___x_95_;
goto v___jp_79_;
}
else
{
lean_object* v___x_96_; 
v___x_96_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_80_ = v___x_96_;
goto v___jp_79_;
}
}
else
{
lean_object* v___x_97_; uint8_t v___x_98_; 
v___x_97_ = lean_unsigned_to_nat(1024u);
v___x_98_ = lean_nat_dec_le(v___x_97_, v_prec_78_);
if (v___x_98_ == 0)
{
lean_object* v___x_99_; 
v___x_99_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_87_ = v___x_99_;
goto v___jp_86_;
}
else
{
lean_object* v___x_100_; 
v___x_100_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_87_ = v___x_100_;
goto v___jp_86_;
}
}
v___jp_79_:
{
lean_object* v___x_81_; lean_object* v___x_82_; uint8_t v___x_83_; lean_object* v___x_84_; lean_object* v___x_85_; 
v___x_81_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprWire_repr___closed__1));
lean_inc(v___y_80_);
v___x_82_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_82_, 0, v___y_80_);
lean_ctor_set(v___x_82_, 1, v___x_81_);
v___x_83_ = 0;
v___x_84_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_84_, 0, v___x_82_);
lean_ctor_set_uint8(v___x_84_, sizeof(void*)*1, v___x_83_);
v___x_85_ = l_Repr_addAppParen(v___x_84_, v_prec_78_);
return v___x_85_;
}
v___jp_86_:
{
lean_object* v___x_88_; lean_object* v___x_89_; uint8_t v___x_90_; lean_object* v___x_91_; lean_object* v___x_92_; 
v___x_88_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprWire_repr___closed__3));
lean_inc(v___y_87_);
v___x_89_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_89_, 0, v___y_87_);
lean_ctor_set(v___x_89_, 1, v___x_88_);
v___x_90_ = 0;
v___x_91_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_91_, 0, v___x_89_);
lean_ctor_set_uint8(v___x_91_, sizeof(void*)*1, v___x_90_);
v___x_92_ = l_Repr_addAppParen(v___x_91_, v_prec_78_);
return v___x_92_;
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprWire_repr___boxed(lean_object* v_x_101_, lean_object* v_prec_102_){
_start:
{
uint8_t v_x_121__boxed_103_; lean_object* v_res_104_; 
v_x_121__boxed_103_ = lean_unbox(v_x_101_);
v_res_104_ = lp_AdrLedger_AdrLedger_instReprWire_repr(v_x_121__boxed_103_, v_prec_102_);
lean_dec(v_prec_102_);
return v_res_104_;
}
}
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_hideAccepts(uint8_t v_x_107_){
_start:
{
if (v_x_107_ == 0)
{
uint8_t v___x_108_; 
v___x_108_ = 1;
return v___x_108_;
}
else
{
uint8_t v___x_109_; 
v___x_109_ = 0;
return v___x_109_;
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_hideAccepts___boxed(lean_object* v_x_110_){
_start:
{
uint8_t v_x_18__boxed_111_; uint8_t v_res_112_; lean_object* v_r_113_; 
v_x_18__boxed_111_ = lean_unbox(v_x_110_);
v_res_112_ = lp_AdrLedger_AdrLedger_hideAccepts(v_x_18__boxed_111_);
v_r_113_ = lean_box(v_res_112_);
return v_r_113_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorIdx(uint8_t v_x_114_){
_start:
{
switch(v_x_114_)
{
case 0:
{
lean_object* v___x_115_; 
v___x_115_ = lean_unsigned_to_nat(0u);
return v___x_115_;
}
case 1:
{
lean_object* v___x_116_; 
v___x_116_ = lean_unsigned_to_nat(1u);
return v___x_116_;
}
case 2:
{
lean_object* v___x_117_; 
v___x_117_ = lean_unsigned_to_nat(2u);
return v___x_117_;
}
default: 
{
lean_object* v___x_118_; 
v___x_118_ = lean_unsigned_to_nat(3u);
return v___x_118_;
}
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorIdx___boxed(lean_object* v_x_119_){
_start:
{
uint8_t v_x_boxed_120_; lean_object* v_res_121_; 
v_x_boxed_120_ = lean_unbox(v_x_119_);
v_res_121_ = lp_AdrLedger_AdrLedger_Status_ctorIdx(v_x_boxed_120_);
return v_res_121_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorElim___redArg(lean_object* v_k_122_){
_start:
{
lean_inc(v_k_122_);
return v_k_122_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorElim___redArg___boxed(lean_object* v_k_123_){
_start:
{
lean_object* v_res_124_; 
v_res_124_ = lp_AdrLedger_AdrLedger_Status_ctorElim___redArg(v_k_123_);
lean_dec(v_k_123_);
return v_res_124_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorElim(lean_object* v_motive_125_, lean_object* v_ctorIdx_126_, uint8_t v_t_127_, lean_object* v_h_128_, lean_object* v_k_129_){
_start:
{
lean_inc(v_k_129_);
return v_k_129_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ctorElim___boxed(lean_object* v_motive_130_, lean_object* v_ctorIdx_131_, lean_object* v_t_132_, lean_object* v_h_133_, lean_object* v_k_134_){
_start:
{
uint8_t v_t_boxed_135_; lean_object* v_res_136_; 
v_t_boxed_135_ = lean_unbox(v_t_132_);
v_res_136_ = lp_AdrLedger_AdrLedger_Status_ctorElim(v_motive_130_, v_ctorIdx_131_, v_t_boxed_135_, v_h_133_, v_k_134_);
lean_dec(v_k_134_);
lean_dec(v_ctorIdx_131_);
return v_res_136_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_proposed_elim___redArg(lean_object* v_proposed_137_){
_start:
{
lean_inc(v_proposed_137_);
return v_proposed_137_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_proposed_elim___redArg___boxed(lean_object* v_proposed_138_){
_start:
{
lean_object* v_res_139_; 
v_res_139_ = lp_AdrLedger_AdrLedger_Status_proposed_elim___redArg(v_proposed_138_);
lean_dec(v_proposed_138_);
return v_res_139_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_proposed_elim(lean_object* v_motive_140_, uint8_t v_t_141_, lean_object* v_h_142_, lean_object* v_proposed_143_){
_start:
{
lean_inc(v_proposed_143_);
return v_proposed_143_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_proposed_elim___boxed(lean_object* v_motive_144_, lean_object* v_t_145_, lean_object* v_h_146_, lean_object* v_proposed_147_){
_start:
{
uint8_t v_t_boxed_148_; lean_object* v_res_149_; 
v_t_boxed_148_ = lean_unbox(v_t_145_);
v_res_149_ = lp_AdrLedger_AdrLedger_Status_proposed_elim(v_motive_144_, v_t_boxed_148_, v_h_146_, v_proposed_147_);
lean_dec(v_proposed_147_);
return v_res_149_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_accepted_elim___redArg(lean_object* v_accepted_150_){
_start:
{
lean_inc(v_accepted_150_);
return v_accepted_150_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_accepted_elim___redArg___boxed(lean_object* v_accepted_151_){
_start:
{
lean_object* v_res_152_; 
v_res_152_ = lp_AdrLedger_AdrLedger_Status_accepted_elim___redArg(v_accepted_151_);
lean_dec(v_accepted_151_);
return v_res_152_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_accepted_elim(lean_object* v_motive_153_, uint8_t v_t_154_, lean_object* v_h_155_, lean_object* v_accepted_156_){
_start:
{
lean_inc(v_accepted_156_);
return v_accepted_156_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_accepted_elim___boxed(lean_object* v_motive_157_, lean_object* v_t_158_, lean_object* v_h_159_, lean_object* v_accepted_160_){
_start:
{
uint8_t v_t_boxed_161_; lean_object* v_res_162_; 
v_t_boxed_161_ = lean_unbox(v_t_158_);
v_res_162_ = lp_AdrLedger_AdrLedger_Status_accepted_elim(v_motive_157_, v_t_boxed_161_, v_h_159_, v_accepted_160_);
lean_dec(v_accepted_160_);
return v_res_162_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_deprecated_elim___redArg(lean_object* v_deprecated_163_){
_start:
{
lean_inc(v_deprecated_163_);
return v_deprecated_163_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_deprecated_elim___redArg___boxed(lean_object* v_deprecated_164_){
_start:
{
lean_object* v_res_165_; 
v_res_165_ = lp_AdrLedger_AdrLedger_Status_deprecated_elim___redArg(v_deprecated_164_);
lean_dec(v_deprecated_164_);
return v_res_165_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_deprecated_elim(lean_object* v_motive_166_, uint8_t v_t_167_, lean_object* v_h_168_, lean_object* v_deprecated_169_){
_start:
{
lean_inc(v_deprecated_169_);
return v_deprecated_169_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_deprecated_elim___boxed(lean_object* v_motive_170_, lean_object* v_t_171_, lean_object* v_h_172_, lean_object* v_deprecated_173_){
_start:
{
uint8_t v_t_boxed_174_; lean_object* v_res_175_; 
v_t_boxed_174_ = lean_unbox(v_t_171_);
v_res_175_ = lp_AdrLedger_AdrLedger_Status_deprecated_elim(v_motive_170_, v_t_boxed_174_, v_h_172_, v_deprecated_173_);
lean_dec(v_deprecated_173_);
return v_res_175_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_superseded_elim___redArg(lean_object* v_superseded_176_){
_start:
{
lean_inc(v_superseded_176_);
return v_superseded_176_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_superseded_elim___redArg___boxed(lean_object* v_superseded_177_){
_start:
{
lean_object* v_res_178_; 
v_res_178_ = lp_AdrLedger_AdrLedger_Status_superseded_elim___redArg(v_superseded_177_);
lean_dec(v_superseded_177_);
return v_res_178_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_superseded_elim(lean_object* v_motive_179_, uint8_t v_t_180_, lean_object* v_h_181_, lean_object* v_superseded_182_){
_start:
{
lean_inc(v_superseded_182_);
return v_superseded_182_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_superseded_elim___boxed(lean_object* v_motive_183_, lean_object* v_t_184_, lean_object* v_h_185_, lean_object* v_superseded_186_){
_start:
{
uint8_t v_t_boxed_187_; lean_object* v_res_188_; 
v_t_boxed_187_ = lean_unbox(v_t_184_);
v_res_188_ = lp_AdrLedger_AdrLedger_Status_superseded_elim(v_motive_183_, v_t_boxed_187_, v_h_185_, v_superseded_186_);
lean_dec(v_superseded_186_);
return v_res_188_;
}
}
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_Status_ofNat(lean_object* v_n_189_){
_start:
{
lean_object* v___x_190_; uint8_t v___x_191_; 
v___x_190_ = lean_unsigned_to_nat(1u);
v___x_191_ = lean_nat_dec_le(v_n_189_, v___x_190_);
if (v___x_191_ == 0)
{
lean_object* v___x_192_; uint8_t v___x_193_; 
v___x_192_ = lean_unsigned_to_nat(2u);
v___x_193_ = lean_nat_dec_le(v_n_189_, v___x_192_);
if (v___x_193_ == 0)
{
uint8_t v___x_194_; 
v___x_194_ = 3;
return v___x_194_;
}
else
{
uint8_t v___x_195_; 
v___x_195_ = 2;
return v___x_195_;
}
}
else
{
lean_object* v___x_196_; uint8_t v___x_197_; 
v___x_196_ = lean_unsigned_to_nat(0u);
v___x_197_ = lean_nat_dec_le(v_n_189_, v___x_196_);
if (v___x_197_ == 0)
{
uint8_t v___x_198_; 
v___x_198_ = 1;
return v___x_198_;
}
else
{
uint8_t v___x_199_; 
v___x_199_ = 0;
return v___x_199_;
}
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Status_ofNat___boxed(lean_object* v_n_200_){
_start:
{
uint8_t v_res_201_; lean_object* v_r_202_; 
v_res_201_ = lp_AdrLedger_AdrLedger_Status_ofNat(v_n_200_);
lean_dec(v_n_200_);
v_r_202_ = lean_box(v_res_201_);
return v_r_202_;
}
}
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_instDecidableEqStatus(uint8_t v_x_203_, uint8_t v_y_204_){
_start:
{
lean_object* v___x_205_; lean_object* v___x_206_; uint8_t v___x_207_; 
v___x_205_ = lp_AdrLedger_AdrLedger_Status_ctorIdx(v_x_203_);
v___x_206_ = lp_AdrLedger_AdrLedger_Status_ctorIdx(v_y_204_);
v___x_207_ = lean_nat_dec_eq(v___x_205_, v___x_206_);
lean_dec(v___x_206_);
lean_dec(v___x_205_);
return v___x_207_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instDecidableEqStatus___boxed(lean_object* v_x_208_, lean_object* v_y_209_){
_start:
{
uint8_t v_x_13__boxed_210_; uint8_t v_y_14__boxed_211_; uint8_t v_res_212_; lean_object* v_r_213_; 
v_x_13__boxed_210_ = lean_unbox(v_x_208_);
v_y_14__boxed_211_ = lean_unbox(v_y_209_);
v_res_212_ = lp_AdrLedger_AdrLedger_instDecidableEqStatus(v_x_13__boxed_210_, v_y_14__boxed_211_);
v_r_213_ = lean_box(v_res_212_);
return v_r_213_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr(uint8_t v_x_226_, lean_object* v_prec_227_){
_start:
{
lean_object* v___y_229_; lean_object* v___y_236_; lean_object* v___y_243_; lean_object* v___y_250_; 
switch(v_x_226_)
{
case 0:
{
lean_object* v___x_256_; uint8_t v___x_257_; 
v___x_256_ = lean_unsigned_to_nat(1024u);
v___x_257_ = lean_nat_dec_le(v___x_256_, v_prec_227_);
if (v___x_257_ == 0)
{
lean_object* v___x_258_; 
v___x_258_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_229_ = v___x_258_;
goto v___jp_228_;
}
else
{
lean_object* v___x_259_; 
v___x_259_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_229_ = v___x_259_;
goto v___jp_228_;
}
}
case 1:
{
lean_object* v___x_260_; uint8_t v___x_261_; 
v___x_260_ = lean_unsigned_to_nat(1024u);
v___x_261_ = lean_nat_dec_le(v___x_260_, v_prec_227_);
if (v___x_261_ == 0)
{
lean_object* v___x_262_; 
v___x_262_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_236_ = v___x_262_;
goto v___jp_235_;
}
else
{
lean_object* v___x_263_; 
v___x_263_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_236_ = v___x_263_;
goto v___jp_235_;
}
}
case 2:
{
lean_object* v___x_264_; uint8_t v___x_265_; 
v___x_264_ = lean_unsigned_to_nat(1024u);
v___x_265_ = lean_nat_dec_le(v___x_264_, v_prec_227_);
if (v___x_265_ == 0)
{
lean_object* v___x_266_; 
v___x_266_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_243_ = v___x_266_;
goto v___jp_242_;
}
else
{
lean_object* v___x_267_; 
v___x_267_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_243_ = v___x_267_;
goto v___jp_242_;
}
}
default: 
{
lean_object* v___x_268_; uint8_t v___x_269_; 
v___x_268_ = lean_unsigned_to_nat(1024u);
v___x_269_ = lean_nat_dec_le(v___x_268_, v_prec_227_);
if (v___x_269_ == 0)
{
lean_object* v___x_270_; 
v___x_270_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_250_ = v___x_270_;
goto v___jp_249_;
}
else
{
lean_object* v___x_271_; 
v___x_271_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_250_ = v___x_271_;
goto v___jp_249_;
}
}
}
v___jp_228_:
{
lean_object* v___x_230_; lean_object* v___x_231_; uint8_t v___x_232_; lean_object* v___x_233_; lean_object* v___x_234_; 
v___x_230_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__1));
lean_inc(v___y_229_);
v___x_231_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_231_, 0, v___y_229_);
lean_ctor_set(v___x_231_, 1, v___x_230_);
v___x_232_ = 0;
v___x_233_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_233_, 0, v___x_231_);
lean_ctor_set_uint8(v___x_233_, sizeof(void*)*1, v___x_232_);
v___x_234_ = l_Repr_addAppParen(v___x_233_, v_prec_227_);
return v___x_234_;
}
v___jp_235_:
{
lean_object* v___x_237_; lean_object* v___x_238_; uint8_t v___x_239_; lean_object* v___x_240_; lean_object* v___x_241_; 
v___x_237_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__3));
lean_inc(v___y_236_);
v___x_238_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_238_, 0, v___y_236_);
lean_ctor_set(v___x_238_, 1, v___x_237_);
v___x_239_ = 0;
v___x_240_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_240_, 0, v___x_238_);
lean_ctor_set_uint8(v___x_240_, sizeof(void*)*1, v___x_239_);
v___x_241_ = l_Repr_addAppParen(v___x_240_, v_prec_227_);
return v___x_241_;
}
v___jp_242_:
{
lean_object* v___x_244_; lean_object* v___x_245_; uint8_t v___x_246_; lean_object* v___x_247_; lean_object* v___x_248_; 
v___x_244_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__5));
lean_inc(v___y_243_);
v___x_245_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_245_, 0, v___y_243_);
lean_ctor_set(v___x_245_, 1, v___x_244_);
v___x_246_ = 0;
v___x_247_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_247_, 0, v___x_245_);
lean_ctor_set_uint8(v___x_247_, sizeof(void*)*1, v___x_246_);
v___x_248_ = l_Repr_addAppParen(v___x_247_, v_prec_227_);
return v___x_248_;
}
v___jp_249_:
{
lean_object* v___x_251_; lean_object* v___x_252_; uint8_t v___x_253_; lean_object* v___x_254_; lean_object* v___x_255_; 
v___x_251_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprStatus_repr___closed__7));
lean_inc(v___y_250_);
v___x_252_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_252_, 0, v___y_250_);
lean_ctor_set(v___x_252_, 1, v___x_251_);
v___x_253_ = 0;
v___x_254_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_254_, 0, v___x_252_);
lean_ctor_set_uint8(v___x_254_, sizeof(void*)*1, v___x_253_);
v___x_255_ = l_Repr_addAppParen(v___x_254_, v_prec_227_);
return v___x_255_;
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprStatus_repr___boxed(lean_object* v_x_272_, lean_object* v_prec_273_){
_start:
{
uint8_t v_x_229__boxed_274_; lean_object* v_res_275_; 
v_x_229__boxed_274_ = lean_unbox(v_x_272_);
v_res_275_ = lp_AdrLedger_AdrLedger_instReprStatus_repr(v_x_229__boxed_274_, v_prec_273_);
lean_dec(v_prec_273_);
return v_res_275_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorIdx(lean_object* v_x_278_){
_start:
{
switch(lean_obj_tag(v_x_278_))
{
case 0:
{
lean_object* v___x_279_; 
v___x_279_ = lean_unsigned_to_nat(0u);
return v___x_279_;
}
case 1:
{
lean_object* v___x_280_; 
v___x_280_ = lean_unsigned_to_nat(1u);
return v___x_280_;
}
case 2:
{
lean_object* v___x_281_; 
v___x_281_ = lean_unsigned_to_nat(2u);
return v___x_281_;
}
default: 
{
lean_object* v___x_282_; 
v___x_282_ = lean_unsigned_to_nat(3u);
return v___x_282_;
}
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorIdx___boxed(lean_object* v_x_283_){
_start:
{
lean_object* v_res_284_; 
v_res_284_ = lp_AdrLedger_AdrLedger_Event_ctorIdx(v_x_283_);
lean_dec_ref(v_x_283_);
return v_res_284_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(lean_object* v_t_285_, lean_object* v_k_286_){
_start:
{
if (lean_obj_tag(v_t_285_) == 3)
{
lean_object* v_old__id_287_; lean_object* v_new__id_288_; lean_object* v___x_289_; 
v_old__id_287_ = lean_ctor_get(v_t_285_, 0);
lean_inc_ref(v_old__id_287_);
v_new__id_288_ = lean_ctor_get(v_t_285_, 1);
lean_inc_ref(v_new__id_288_);
lean_dec_ref_known(v_t_285_, 2);
v___x_289_ = lean_apply_2(v_k_286_, v_old__id_287_, v_new__id_288_);
return v___x_289_;
}
else
{
lean_object* v_id_290_; lean_object* v___x_291_; 
v_id_290_ = lean_ctor_get(v_t_285_, 0);
lean_inc_ref(v_id_290_);
lean_dec_ref(v_t_285_);
v___x_291_ = lean_apply_1(v_k_286_, v_id_290_);
return v___x_291_;
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorElim(lean_object* v_motive_292_, lean_object* v_ctorIdx_293_, lean_object* v_t_294_, lean_object* v_h_295_, lean_object* v_k_296_){
_start:
{
lean_object* v___x_297_; 
v___x_297_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_294_, v_k_296_);
return v___x_297_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_ctorElim___boxed(lean_object* v_motive_298_, lean_object* v_ctorIdx_299_, lean_object* v_t_300_, lean_object* v_h_301_, lean_object* v_k_302_){
_start:
{
lean_object* v_res_303_; 
v_res_303_ = lp_AdrLedger_AdrLedger_Event_ctorElim(v_motive_298_, v_ctorIdx_299_, v_t_300_, v_h_301_, v_k_302_);
lean_dec(v_ctorIdx_299_);
return v_res_303_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_publish_elim___redArg(lean_object* v_t_304_, lean_object* v_publish_305_){
_start:
{
lean_object* v___x_306_; 
v___x_306_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_304_, v_publish_305_);
return v___x_306_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_publish_elim(lean_object* v_motive_307_, lean_object* v_t_308_, lean_object* v_h_309_, lean_object* v_publish_310_){
_start:
{
lean_object* v___x_311_; 
v___x_311_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_308_, v_publish_310_);
return v___x_311_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_accept_elim___redArg(lean_object* v_t_312_, lean_object* v_accept_313_){
_start:
{
lean_object* v___x_314_; 
v___x_314_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_312_, v_accept_313_);
return v___x_314_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_accept_elim(lean_object* v_motive_315_, lean_object* v_t_316_, lean_object* v_h_317_, lean_object* v_accept_318_){
_start:
{
lean_object* v___x_319_; 
v___x_319_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_316_, v_accept_318_);
return v___x_319_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_deprecate_elim___redArg(lean_object* v_t_320_, lean_object* v_deprecate_321_){
_start:
{
lean_object* v___x_322_; 
v___x_322_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_320_, v_deprecate_321_);
return v___x_322_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_deprecate_elim(lean_object* v_motive_323_, lean_object* v_t_324_, lean_object* v_h_325_, lean_object* v_deprecate_326_){
_start:
{
lean_object* v___x_327_; 
v___x_327_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_324_, v_deprecate_326_);
return v___x_327_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_supersede_elim___redArg(lean_object* v_t_328_, lean_object* v_supersede_329_){
_start:
{
lean_object* v___x_330_; 
v___x_330_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_328_, v_supersede_329_);
return v___x_330_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_Event_supersede_elim(lean_object* v_motive_331_, lean_object* v_t_332_, lean_object* v_h_333_, lean_object* v_supersede_334_){
_start:
{
lean_object* v___x_335_; 
v___x_335_ = lp_AdrLedger_AdrLedger_Event_ctorElim___redArg(v_t_332_, v_supersede_334_);
return v___x_335_;
}
}
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_instDecidableEqEvent_decEq(lean_object* v_x_336_, lean_object* v_x_337_){
_start:
{
switch(lean_obj_tag(v_x_336_))
{
case 0:
{
if (lean_obj_tag(v_x_337_) == 0)
{
lean_object* v_id_338_; lean_object* v_id_339_; uint8_t v___x_340_; 
v_id_338_ = lean_ctor_get(v_x_336_, 0);
v_id_339_ = lean_ctor_get(v_x_337_, 0);
v___x_340_ = lean_string_dec_eq(v_id_338_, v_id_339_);
return v___x_340_;
}
else
{
uint8_t v___x_341_; 
v___x_341_ = 0;
return v___x_341_;
}
}
case 1:
{
if (lean_obj_tag(v_x_337_) == 1)
{
lean_object* v_id_342_; lean_object* v_id_343_; uint8_t v___x_344_; 
v_id_342_ = lean_ctor_get(v_x_336_, 0);
v_id_343_ = lean_ctor_get(v_x_337_, 0);
v___x_344_ = lean_string_dec_eq(v_id_342_, v_id_343_);
return v___x_344_;
}
else
{
uint8_t v___x_345_; 
v___x_345_ = 0;
return v___x_345_;
}
}
case 2:
{
if (lean_obj_tag(v_x_337_) == 2)
{
lean_object* v_id_346_; lean_object* v_id_347_; uint8_t v___x_348_; 
v_id_346_ = lean_ctor_get(v_x_336_, 0);
v_id_347_ = lean_ctor_get(v_x_337_, 0);
v___x_348_ = lean_string_dec_eq(v_id_346_, v_id_347_);
return v___x_348_;
}
else
{
uint8_t v___x_349_; 
v___x_349_ = 0;
return v___x_349_;
}
}
default: 
{
if (lean_obj_tag(v_x_337_) == 3)
{
lean_object* v_old__id_350_; lean_object* v_new__id_351_; lean_object* v_old__id_352_; lean_object* v_new__id_353_; uint8_t v___x_354_; 
v_old__id_350_ = lean_ctor_get(v_x_336_, 0);
v_new__id_351_ = lean_ctor_get(v_x_336_, 1);
v_old__id_352_ = lean_ctor_get(v_x_337_, 0);
v_new__id_353_ = lean_ctor_get(v_x_337_, 1);
v___x_354_ = lean_string_dec_eq(v_old__id_350_, v_old__id_352_);
if (v___x_354_ == 0)
{
return v___x_354_;
}
else
{
uint8_t v___x_355_; 
v___x_355_ = lean_string_dec_eq(v_new__id_351_, v_new__id_353_);
return v___x_355_;
}
}
else
{
uint8_t v___x_356_; 
v___x_356_ = 0;
return v___x_356_;
}
}
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instDecidableEqEvent_decEq___boxed(lean_object* v_x_357_, lean_object* v_x_358_){
_start:
{
uint8_t v_res_359_; lean_object* v_r_360_; 
v_res_359_ = lp_AdrLedger_AdrLedger_instDecidableEqEvent_decEq(v_x_357_, v_x_358_);
lean_dec_ref(v_x_358_);
lean_dec_ref(v_x_357_);
v_r_360_ = lean_box(v_res_359_);
return v_r_360_;
}
}
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_instDecidableEqEvent(lean_object* v_x_361_, lean_object* v_x_362_){
_start:
{
uint8_t v___x_363_; 
v___x_363_ = lp_AdrLedger_AdrLedger_instDecidableEqEvent_decEq(v_x_361_, v_x_362_);
return v___x_363_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instDecidableEqEvent___boxed(lean_object* v_x_364_, lean_object* v_x_365_){
_start:
{
uint8_t v_res_366_; lean_object* v_r_367_; 
v_res_366_ = lp_AdrLedger_AdrLedger_instDecidableEqEvent(v_x_364_, v_x_365_);
lean_dec_ref(v_x_365_);
lean_dec_ref(v_x_364_);
v_r_367_ = lean_box(v_res_366_);
return v_r_367_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr(lean_object* v_x_392_, lean_object* v_prec_393_){
_start:
{
switch(lean_obj_tag(v_x_392_))
{
case 0:
{
lean_object* v_id_394_; lean_object* v___x_396_; uint8_t v_isShared_397_; uint8_t v_isSharedCheck_414_; 
v_id_394_ = lean_ctor_get(v_x_392_, 0);
v_isSharedCheck_414_ = !lean_is_exclusive(v_x_392_);
if (v_isSharedCheck_414_ == 0)
{
v___x_396_ = v_x_392_;
v_isShared_397_ = v_isSharedCheck_414_;
goto v_resetjp_395_;
}
else
{
lean_inc(v_id_394_);
lean_dec(v_x_392_);
v___x_396_ = lean_box(0);
v_isShared_397_ = v_isSharedCheck_414_;
goto v_resetjp_395_;
}
v_resetjp_395_:
{
lean_object* v___y_399_; lean_object* v___x_410_; uint8_t v___x_411_; 
v___x_410_ = lean_unsigned_to_nat(1024u);
v___x_411_ = lean_nat_dec_le(v___x_410_, v_prec_393_);
if (v___x_411_ == 0)
{
lean_object* v___x_412_; 
v___x_412_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_399_ = v___x_412_;
goto v___jp_398_;
}
else
{
lean_object* v___x_413_; 
v___x_413_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_399_ = v___x_413_;
goto v___jp_398_;
}
v___jp_398_:
{
lean_object* v___x_400_; lean_object* v___x_401_; lean_object* v___x_403_; 
v___x_400_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__2));
v___x_401_ = l_String_quote(v_id_394_);
if (v_isShared_397_ == 0)
{
lean_ctor_set_tag(v___x_396_, 3);
lean_ctor_set(v___x_396_, 0, v___x_401_);
v___x_403_ = v___x_396_;
goto v_reusejp_402_;
}
else
{
lean_object* v_reuseFailAlloc_409_; 
v_reuseFailAlloc_409_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v_reuseFailAlloc_409_, 0, v___x_401_);
v___x_403_ = v_reuseFailAlloc_409_;
goto v_reusejp_402_;
}
v_reusejp_402_:
{
lean_object* v___x_404_; lean_object* v___x_405_; uint8_t v___x_406_; lean_object* v___x_407_; lean_object* v___x_408_; 
v___x_404_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_404_, 0, v___x_400_);
lean_ctor_set(v___x_404_, 1, v___x_403_);
lean_inc(v___y_399_);
v___x_405_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_405_, 0, v___y_399_);
lean_ctor_set(v___x_405_, 1, v___x_404_);
v___x_406_ = 0;
v___x_407_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_407_, 0, v___x_405_);
lean_ctor_set_uint8(v___x_407_, sizeof(void*)*1, v___x_406_);
v___x_408_ = l_Repr_addAppParen(v___x_407_, v_prec_393_);
return v___x_408_;
}
}
}
}
case 1:
{
lean_object* v_id_415_; lean_object* v___x_417_; uint8_t v_isShared_418_; uint8_t v_isSharedCheck_435_; 
v_id_415_ = lean_ctor_get(v_x_392_, 0);
v_isSharedCheck_435_ = !lean_is_exclusive(v_x_392_);
if (v_isSharedCheck_435_ == 0)
{
v___x_417_ = v_x_392_;
v_isShared_418_ = v_isSharedCheck_435_;
goto v_resetjp_416_;
}
else
{
lean_inc(v_id_415_);
lean_dec(v_x_392_);
v___x_417_ = lean_box(0);
v_isShared_418_ = v_isSharedCheck_435_;
goto v_resetjp_416_;
}
v_resetjp_416_:
{
lean_object* v___y_420_; lean_object* v___x_431_; uint8_t v___x_432_; 
v___x_431_ = lean_unsigned_to_nat(1024u);
v___x_432_ = lean_nat_dec_le(v___x_431_, v_prec_393_);
if (v___x_432_ == 0)
{
lean_object* v___x_433_; 
v___x_433_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_420_ = v___x_433_;
goto v___jp_419_;
}
else
{
lean_object* v___x_434_; 
v___x_434_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_420_ = v___x_434_;
goto v___jp_419_;
}
v___jp_419_:
{
lean_object* v___x_421_; lean_object* v___x_422_; lean_object* v___x_424_; 
v___x_421_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__5));
v___x_422_ = l_String_quote(v_id_415_);
if (v_isShared_418_ == 0)
{
lean_ctor_set_tag(v___x_417_, 3);
lean_ctor_set(v___x_417_, 0, v___x_422_);
v___x_424_ = v___x_417_;
goto v_reusejp_423_;
}
else
{
lean_object* v_reuseFailAlloc_430_; 
v_reuseFailAlloc_430_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v_reuseFailAlloc_430_, 0, v___x_422_);
v___x_424_ = v_reuseFailAlloc_430_;
goto v_reusejp_423_;
}
v_reusejp_423_:
{
lean_object* v___x_425_; lean_object* v___x_426_; uint8_t v___x_427_; lean_object* v___x_428_; lean_object* v___x_429_; 
v___x_425_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_425_, 0, v___x_421_);
lean_ctor_set(v___x_425_, 1, v___x_424_);
lean_inc(v___y_420_);
v___x_426_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_426_, 0, v___y_420_);
lean_ctor_set(v___x_426_, 1, v___x_425_);
v___x_427_ = 0;
v___x_428_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_428_, 0, v___x_426_);
lean_ctor_set_uint8(v___x_428_, sizeof(void*)*1, v___x_427_);
v___x_429_ = l_Repr_addAppParen(v___x_428_, v_prec_393_);
return v___x_429_;
}
}
}
}
case 2:
{
lean_object* v_id_436_; lean_object* v___x_438_; uint8_t v_isShared_439_; uint8_t v_isSharedCheck_456_; 
v_id_436_ = lean_ctor_get(v_x_392_, 0);
v_isSharedCheck_456_ = !lean_is_exclusive(v_x_392_);
if (v_isSharedCheck_456_ == 0)
{
v___x_438_ = v_x_392_;
v_isShared_439_ = v_isSharedCheck_456_;
goto v_resetjp_437_;
}
else
{
lean_inc(v_id_436_);
lean_dec(v_x_392_);
v___x_438_ = lean_box(0);
v_isShared_439_ = v_isSharedCheck_456_;
goto v_resetjp_437_;
}
v_resetjp_437_:
{
lean_object* v___y_441_; lean_object* v___x_452_; uint8_t v___x_453_; 
v___x_452_ = lean_unsigned_to_nat(1024u);
v___x_453_ = lean_nat_dec_le(v___x_452_, v_prec_393_);
if (v___x_453_ == 0)
{
lean_object* v___x_454_; 
v___x_454_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_441_ = v___x_454_;
goto v___jp_440_;
}
else
{
lean_object* v___x_455_; 
v___x_455_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_441_ = v___x_455_;
goto v___jp_440_;
}
v___jp_440_:
{
lean_object* v___x_442_; lean_object* v___x_443_; lean_object* v___x_445_; 
v___x_442_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__8));
v___x_443_ = l_String_quote(v_id_436_);
if (v_isShared_439_ == 0)
{
lean_ctor_set_tag(v___x_438_, 3);
lean_ctor_set(v___x_438_, 0, v___x_443_);
v___x_445_ = v___x_438_;
goto v_reusejp_444_;
}
else
{
lean_object* v_reuseFailAlloc_451_; 
v_reuseFailAlloc_451_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v_reuseFailAlloc_451_, 0, v___x_443_);
v___x_445_ = v_reuseFailAlloc_451_;
goto v_reusejp_444_;
}
v_reusejp_444_:
{
lean_object* v___x_446_; lean_object* v___x_447_; uint8_t v___x_448_; lean_object* v___x_449_; lean_object* v___x_450_; 
v___x_446_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_446_, 0, v___x_442_);
lean_ctor_set(v___x_446_, 1, v___x_445_);
lean_inc(v___y_441_);
v___x_447_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_447_, 0, v___y_441_);
lean_ctor_set(v___x_447_, 1, v___x_446_);
v___x_448_ = 0;
v___x_449_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_449_, 0, v___x_447_);
lean_ctor_set_uint8(v___x_449_, sizeof(void*)*1, v___x_448_);
v___x_450_ = l_Repr_addAppParen(v___x_449_, v_prec_393_);
return v___x_450_;
}
}
}
}
default: 
{
lean_object* v_old__id_457_; lean_object* v_new__id_458_; lean_object* v___x_460_; uint8_t v_isShared_461_; uint8_t v_isSharedCheck_483_; 
v_old__id_457_ = lean_ctor_get(v_x_392_, 0);
v_new__id_458_ = lean_ctor_get(v_x_392_, 1);
v_isSharedCheck_483_ = !lean_is_exclusive(v_x_392_);
if (v_isSharedCheck_483_ == 0)
{
v___x_460_ = v_x_392_;
v_isShared_461_ = v_isSharedCheck_483_;
goto v_resetjp_459_;
}
else
{
lean_inc(v_new__id_458_);
lean_inc(v_old__id_457_);
lean_dec(v_x_392_);
v___x_460_ = lean_box(0);
v_isShared_461_ = v_isSharedCheck_483_;
goto v_resetjp_459_;
}
v_resetjp_459_:
{
lean_object* v___y_463_; lean_object* v___x_479_; uint8_t v___x_480_; 
v___x_479_ = lean_unsigned_to_nat(1024u);
v___x_480_ = lean_nat_dec_le(v___x_479_, v_prec_393_);
if (v___x_480_ == 0)
{
lean_object* v___x_481_; 
v___x_481_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__4);
v___y_463_ = v___x_481_;
goto v___jp_462_;
}
else
{
lean_object* v___x_482_; 
v___x_482_ = lean_obj_once(&lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5, &lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5_once, _init_lp_AdrLedger_AdrLedger_instReprWire_repr___closed__5);
v___y_463_ = v___x_482_;
goto v___jp_462_;
}
v___jp_462_:
{
lean_object* v___x_464_; lean_object* v___x_465_; lean_object* v___x_466_; lean_object* v___x_467_; lean_object* v___x_469_; 
v___x_464_ = lean_box(1);
v___x_465_ = ((lean_object*)(lp_AdrLedger_AdrLedger_instReprEvent_repr___closed__11));
v___x_466_ = l_String_quote(v_old__id_457_);
v___x_467_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_467_, 0, v___x_466_);
if (v_isShared_461_ == 0)
{
lean_ctor_set_tag(v___x_460_, 5);
lean_ctor_set(v___x_460_, 1, v___x_467_);
lean_ctor_set(v___x_460_, 0, v___x_465_);
v___x_469_ = v___x_460_;
goto v_reusejp_468_;
}
else
{
lean_object* v_reuseFailAlloc_478_; 
v_reuseFailAlloc_478_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v_reuseFailAlloc_478_, 0, v___x_465_);
lean_ctor_set(v_reuseFailAlloc_478_, 1, v___x_467_);
v___x_469_ = v_reuseFailAlloc_478_;
goto v_reusejp_468_;
}
v_reusejp_468_:
{
lean_object* v___x_470_; lean_object* v___x_471_; lean_object* v___x_472_; lean_object* v___x_473_; lean_object* v___x_474_; uint8_t v___x_475_; lean_object* v___x_476_; lean_object* v___x_477_; 
v___x_470_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_470_, 0, v___x_469_);
lean_ctor_set(v___x_470_, 1, v___x_464_);
v___x_471_ = l_String_quote(v_new__id_458_);
v___x_472_ = lean_alloc_ctor(3, 1, 0);
lean_ctor_set(v___x_472_, 0, v___x_471_);
v___x_473_ = lean_alloc_ctor(5, 2, 0);
lean_ctor_set(v___x_473_, 0, v___x_470_);
lean_ctor_set(v___x_473_, 1, v___x_472_);
lean_inc(v___y_463_);
v___x_474_ = lean_alloc_ctor(4, 2, 0);
lean_ctor_set(v___x_474_, 0, v___y_463_);
lean_ctor_set(v___x_474_, 1, v___x_473_);
v___x_475_ = 0;
v___x_476_ = lean_alloc_ctor(6, 1, 1);
lean_ctor_set(v___x_476_, 0, v___x_474_);
lean_ctor_set_uint8(v___x_476_, sizeof(void*)*1, v___x_475_);
v___x_477_ = l_Repr_addAppParen(v___x_476_, v_prec_393_);
return v___x_477_;
}
}
}
}
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_instReprEvent_repr___boxed(lean_object* v_x_484_, lean_object* v_prec_485_){
_start:
{
lean_object* v_res_486_; 
v_res_486_ = lp_AdrLedger_AdrLedger_instReprEvent_repr(v_x_484_, v_prec_485_);
lean_dec(v_prec_485_);
return v_res_486_;
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_getStatus(lean_object* v_id_501_, lean_object* v_x_502_){
_start:
{
if (lean_obj_tag(v_x_502_) == 0)
{
lean_object* v___x_503_; 
v___x_503_ = lean_box(0);
return v___x_503_;
}
else
{
lean_object* v_head_504_; 
v_head_504_ = lean_ctor_get(v_x_502_, 0);
switch(lean_obj_tag(v_head_504_))
{
case 0:
{
lean_object* v_tail_505_; lean_object* v_id_506_; uint8_t v___x_507_; 
v_tail_505_ = lean_ctor_get(v_x_502_, 1);
v_id_506_ = lean_ctor_get(v_head_504_, 0);
v___x_507_ = lean_string_dec_eq(v_id_506_, v_id_501_);
if (v___x_507_ == 0)
{
v_x_502_ = v_tail_505_;
goto _start;
}
else
{
lean_object* v___x_509_; 
v___x_509_ = ((lean_object*)(lp_AdrLedger_AdrLedger_getStatus___closed__0));
return v___x_509_;
}
}
case 1:
{
lean_object* v_tail_510_; lean_object* v_id_511_; uint8_t v___x_512_; 
v_tail_510_ = lean_ctor_get(v_x_502_, 1);
v_id_511_ = lean_ctor_get(v_head_504_, 0);
v___x_512_ = lean_string_dec_eq(v_id_511_, v_id_501_);
if (v___x_512_ == 0)
{
v_x_502_ = v_tail_510_;
goto _start;
}
else
{
lean_object* v___x_514_; 
v___x_514_ = ((lean_object*)(lp_AdrLedger_AdrLedger_getStatus___closed__1));
return v___x_514_;
}
}
case 2:
{
lean_object* v_tail_515_; lean_object* v_id_516_; uint8_t v___x_517_; 
v_tail_515_ = lean_ctor_get(v_x_502_, 1);
v_id_516_ = lean_ctor_get(v_head_504_, 0);
v___x_517_ = lean_string_dec_eq(v_id_516_, v_id_501_);
if (v___x_517_ == 0)
{
v_x_502_ = v_tail_515_;
goto _start;
}
else
{
lean_object* v___x_519_; 
v___x_519_ = ((lean_object*)(lp_AdrLedger_AdrLedger_getStatus___closed__2));
return v___x_519_;
}
}
default: 
{
lean_object* v_tail_520_; lean_object* v_old__id_521_; uint8_t v___x_522_; 
v_tail_520_ = lean_ctor_get(v_x_502_, 1);
v_old__id_521_ = lean_ctor_get(v_head_504_, 0);
v___x_522_ = lean_string_dec_eq(v_old__id_521_, v_id_501_);
if (v___x_522_ == 0)
{
v_x_502_ = v_tail_520_;
goto _start;
}
else
{
lean_object* v___x_524_; 
v___x_524_ = ((lean_object*)(lp_AdrLedger_AdrLedger_getStatus___closed__3));
return v___x_524_;
}
}
}
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_getStatus___boxed(lean_object* v_id_525_, lean_object* v_x_526_){
_start:
{
lean_object* v_res_527_; 
v_res_527_ = lp_AdrLedger_AdrLedger_getStatus(v_id_525_, v_x_526_);
lean_dec(v_x_526_);
lean_dec_ref(v_id_525_);
return v_res_527_;
}
}
LEAN_EXPORT uint8_t lp_AdrLedger_AdrLedger_isKnown(lean_object* v_id_528_, lean_object* v_h_529_){
_start:
{
lean_object* v___x_530_; 
v___x_530_ = lp_AdrLedger_AdrLedger_getStatus(v_id_528_, v_h_529_);
if (lean_obj_tag(v___x_530_) == 0)
{
uint8_t v___x_531_; 
v___x_531_ = 0;
return v___x_531_;
}
else
{
uint8_t v___x_532_; 
lean_dec_ref_known(v___x_530_, 1);
v___x_532_ = 1;
return v___x_532_;
}
}
}
LEAN_EXPORT lean_object* lp_AdrLedger_AdrLedger_isKnown___boxed(lean_object* v_id_533_, lean_object* v_h_534_){
_start:
{
uint8_t v_res_535_; lean_object* v_r_536_; 
v_res_535_ = lp_AdrLedger_AdrLedger_isKnown(v_id_533_, v_h_534_);
lean_dec(v_h_534_);
lean_dec_ref(v_id_533_);
v_r_536_ = lean_box(v_res_535_);
return v_r_536_;
}
}
lean_object* initialize_Init(uint8_t builtin);
lean_object* initialize_Init(uint8_t builtin);
void lean_initialize_runtime_module();
static bool _G_initialized = false;
LEAN_EXPORT lean_object* initialize_AdrLedger_AdrLedger_Core(uint8_t builtin) {
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
