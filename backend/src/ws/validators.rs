use regex::Regex;

pub fn validate_display_name(raw: &str) -> Result<String, &'static str> {
    // Trim whitespace
    let name = raw.trim();
    if name.is_empty() {
        return Err("Display name cannot be empty");
    }

    // Length check (you can switch to grapheme count with unicode-segmentation if needed)
    if name.len() > 30 {
        return Err("display_name is too long (max 30 bytes)");
    }

    // Allowed characters: letters, numbers, spaces, underscores, hyphens
    // Adjust the regex if you want to allow emoji or wider Unicode.
    let re = Regex::new(r"^[\p{L}\p{N} _-]+$").unwrap();
    if !re.is_match(&name) {
        return Err("display_name contains invalid characters");
    }

    Ok(name.to_string())
}
