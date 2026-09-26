// Licensed under the Phase Mirror License, Version 1.0
// See the LICENSE file in the project root for more information.

use hmac::{Hmac, Mac};
use sha2::Sha256;
use std::env;

type HmacSha256 = Hmac<Sha256>;

pub fn redact_path(path: &str) -> String {
    let secret = env::var("PM_HMAC_SECRET").unwrap_or_else(|_| "default_pm_secret_for_free_tier".to_string());
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).expect("HMAC can take key of any size");
    mac.update(path.as_bytes());
    let result = mac.finalize();
    let hex_digest = hex::encode(result.into_bytes());
    format!("hmac-sha256:{}", hex_digest)
}
