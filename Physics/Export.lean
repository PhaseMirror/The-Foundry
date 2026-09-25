import Physics.Core
import Physics.Models
import Physics.Engines

/-!
# Physics — Export Generator

Converts verified physics data into human-readable Markdown
and HTML, as required by ADR-0121 for documentation.
-/

namespace Physics.Export

open Physics
open Physics.Models
open Physics.Engines

/-- Convert a Scalar to Markdown. -/
def scalarToMarkdown (s : Scalar) : String :=
  s!"`{s.val}`"

/-- Convert a Vec3 to Markdown. -/
def vec3ToMarkdown (v : Vec3) : String :=
  s!"⟨{v.x}, {v.y}, {v.z}⟩"

/-- Render a physics model theorem as Markdown. -/
def modelToMarkdown (modelName : String) (statement : String) (proofSketch : String) : String :=
  s!"## {modelName}\n\n**Statement:** {statement}\n\n**Proof Sketch:** {proofSketch}\n"

/-- Render key-value pairs as a Markdown table. -/
def kvTableToMarkdown (rows : List (String × String)) : String :=
  let header := "| Key | Value |"
  let separator := "| :--- | :--- |"
  let body := rows.map (fun (k, v) => s!"| {k} | {v} |") |>.foldl (fun a b => a ++ "\n" ++ b) ""
  header ++ "\n" ++ separator ++ "\n" ++ body

/-- Convert a BodyState to Markdown. -/
def bodyStateToMarkdown (bs : BodyState) : String :=
  kvTableToMarkdown [
    ("Position", vec3ToMarkdown bs.pos),
    ("Velocity", vec3ToMarkdown bs.vel),
    ("Mass", scalarToMarkdown bs.mass)
  ]

/-- Convert an NBodyState to Markdown. -/
def nBodyStateToMarkdown (s : NBodyState) : String :=
  let bodiesStr := s.bodies.map bodyStateToMarkdown |>.foldl (fun a b => a ++ "\n\n" ++ b) ""
  kvTableToMarkdown [
    ("Time", toString s.time),
    ("Bodies", toString s.bodies.length),
    ("Body Details", bodiesStr)
  ]

/-- Physics data as HTML. -/
def physicsToHTML (title : String) (content : String) : String :=
  s!"<!DOCTYPE html>\n<html>\n<head><title>{title}</title></head>\n<body>\n<h1>{title}</h1>\n{content}\n</body>\n</html>"

/-- Generate a full physics report as Markdown. -/
def physicsReportToMarkdown (title : String) (models : List (String × String × String)) (bodies : List BodyState) : String :=
  let modelsSection := models.map (fun (n, s, p) => modelToMarkdown n s p) |>.foldl (fun a b => a ++ "\n" ++ b) ""
  let bodiesSection := bodies.map bodyStateToMarkdown |>.foldl (fun a b => a ++ "\n\n" ++ b) ""
  s!"# {title}\n\n## Formal Models\n\n{modelsSection}\n## System State\n\n{bodiesSection}\n"

/-- Export physics data to a directory. -/
def exportPhysicsReport (title : String) (models : List (String × String × String)) (bodies : List BodyState) (targetDir : System.FilePath) : IO Unit := do
  IO.FS.createDirAll targetDir
  let mdContent := physicsReportToMarkdown title models bodies
  IO.FS.writeFile (targetDir / "report.md") mdContent
  let htmlContent := physicsToHTML title mdContent
  IO.FS.writeFile (targetDir / "report.html") htmlContent
  IO.println s!"[Physics Export] Report exported to {targetDir}"

/-- Gravitational force report for two bodies. -/
def gravForceReport (m1 m2 : Scalar) (r1 r2 : Vec3) : String :=
  let (F1, F2) := gravForce m1 m2 r1 r2
  kvTableToMarkdown [
    ("Body 1 Mass", scalarToMarkdown m1),
    ("Body 2 Mass", scalarToMarkdown m2),
    ("Body 1 Position", vec3ToMarkdown r1),
    ("Body 2 Position", vec3ToMarkdown r2),
    ("Distance", toString (Vec3.dist r1 r2)),
    ("Force on Body 1", vec3ToMarkdown F1),
    ("Force on Body 2", vec3ToMarkdown F2),
    ("Newton's Third Law Satisfied", if F1 = Vec3.neg F2 then "true" else "false")
  ]

/-- Kinetic energy report. -/
def kineticEnergyReport (bs : BodyState) : String :=
  kvTableToMarkdown [
    ("Mass", scalarToMarkdown bs.mass),
    ("Velocity", vec3ToMarkdown bs.vel),
    ("Kinetic Energy", toString (kineticEnergy bs))
  ]

end Physics.Export
