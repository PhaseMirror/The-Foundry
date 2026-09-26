use nom::{
    bytes::complete::{tag, take_until},
    sequence::delimited,
    IResult,
};
use std::collections::HashMap;

pub fn expand_rationale(template: &str, variables: &HashMap<String, String>) -> String {
    let mut output = template.to_string();
    
    // Simple iterative replacement for proof of concept production grade
    // In a real production system, we'd use a more robust streaming approach
    for (key, value) in variables {
        let placeholder = format!("{{{{{}}}}}", key);
        output = output.replace(&placeholder, value);
    }
    
    output
}

pub fn parse_variable(input: &str) -> IResult<&str, &str> {
    delimited(tag("{{"), take_until("}}"), tag("}}"))(input)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_variable() {
        assert_eq!(parse_variable("{{system}}"), Ok(("", "system")));
    }

    #[test]
    fn test_expand_rationale() {
        let mut vars = HashMap::new();
        vars.insert("system".into(), "M365".into());
        let res = expand_rationale("Retention for {{system}}.", &vars);
        assert_eq!(res, "Retention for M365.");
    }
}
