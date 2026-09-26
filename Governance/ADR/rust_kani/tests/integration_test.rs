// End-to-end test harness for ADR_Rust_Kani

use adr_rust_kani::{ADR, ADRStatus, export_md, generate_html_index};

#[test]
fn test_example_adr_flow() {
    // Create three realistic ADRs.
    let mut adr1 = ADR::new(
        1,
        "Use Rust for ADR core",
        "Legal governance requires deterministic code.",
        "Adopt Rust",
        vec!["All future ADRs compiled to Rust".into()],
    );
    let mut adr2 = ADR::new(
        2,
        "Integrate Kani verification",
        "We need provable invariants.",
        "Add Kani CI step",
        vec!["No mutable acceptance after acceptance".into()],
    );
    let mut adr3 = ADR::new(
        3,
        "Deprecate old Lean ADR logic",
        "Transition plan.",
        "Mark Lean ADR module as deprecated",
        vec!["Legacy docs archived".into()],
    );

    // Lifecycle actions.
    adr1.accept();
    adr2.accept();
    adr3.deprecate();
    // Supersede old Lean ADR with the new Rust version.
    adr3.supersede(1);

    // Export to Markdown.
    let docs_dir = "docs";
    export_md(&adr1, docs_dir).expect("export adr1");
    export_md(&adr2, docs_dir).expect("export adr2");
    export_md(&adr3, docs_dir).expect("export adr3");

    // Generate HTML index.
    generate_html_index(docs_dir).expect("generate html index");
}
