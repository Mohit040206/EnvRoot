module.exports=function normalizeInput(input){
    if(Array.isArray(input)) return input;

    if(typeof input==="string"){
        try{
            const parsed=JSON.parse(input);
            return Array.isArray(parsed)?parsed:[parsed]
        }catch(err){
            return [input]
        }
    }
}