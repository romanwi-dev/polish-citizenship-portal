import fs from "fs";
import path from "path";

const TOK = path.join("data", "secrets", "dropbox.json");

function readTokens() { 
  try { 
    return JSON.parse(fs.readFileSync(TOK, "utf8")); 
  } catch { 
    return null; 
  } 
}

function saveTokens(obj) { 
  fs.mkdirSync(path.dirname(TOK), {recursive: true}); 
  fs.writeFileSync(TOK, JSON.stringify(obj, null, 2)); 
}

export { readTokens, saveTokens, TOK };