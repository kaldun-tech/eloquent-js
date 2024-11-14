// Title strings must be encoded because they may contain spaces and other characters that may not appear in a URL.
console.log("/talks/" + encodeURIComponent("How to Idle"));
// → /talks/How%20to%20Idle
