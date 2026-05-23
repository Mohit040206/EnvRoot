module.exports=function normalizeOutput(output){
    if(typeof output==="object") return JSON.stringify(output)
  return String(output);
}