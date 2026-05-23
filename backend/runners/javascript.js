const vm=require("vm");
const normalizeInput=require("../utils/normalizeInput")
const normalizeOutput=require("../utils/normalizeOutput")

exports.run=async(code,testCases)=>{
    const result=[];
    let passedTCs=0;

    for(const tc of testCases){
        try{
            const inputArray=normalizeInput(tc.input)

            const context={
                input:inputArray,
                result:null,
            }
            vm.createContext(context);

            const wrappedCode=`
            ${code}
            result=solution(...input)
            `;

            new vm.Script(wrappedCode).runInContext(context,{
                timeout:1000,
            })

            const passed=
            normalizeOutput(context.result)===normalizeOutput(tc.output);

            if(passed) passedTCs++;

            result.push({
                input:tc.input,
                expectedOutput:tc.output,
                actualOutput:context.result,
                passed,
            })
        }catch(err){
            return res.status(500).json({
                success:false,
                message:err.message
            })
        }
    }
    return {
        passedTCs,
        totalTCs:testCases.length,
        result,
    }
}