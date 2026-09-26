use repo_model::{Model, codegen::render_conformance};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let model = Model::load_from_repo_root()?;
    model.check()?;
    let conformance = render_conformance(&model);
    std::fs::write("CONFORMANCE.md", conformance)?;
    println!("Generated CONFORMANCE.md");
    Ok(())
}