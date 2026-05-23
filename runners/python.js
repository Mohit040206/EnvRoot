const { spawn }=require("child_process")
const path=require("path")

exports.run=(code,testCases)=>{
    return new Promise((resolve,reject)=>{

const py = spawn("python", [
  path.join(__dirname, "..", "pythonRunner.py")
]);

        py.stdin.write(
            JSON.stringify({code,testCases})
        );

        py.stdin.end();

        let output="";
        let error="";

        py.stdout.on("data",d=>output+=d.toString());
        py.stderr.on("data",e=>reject(new Error(e.toString())))

        py.on("close",()=>{
            if(error){
                return reject(new Error(error))
            }

            const parsed=JSON.parse(output)

            if(parsed.error){
                return reject(new Error(parsed.output))
            }
            resolve(parsed);
        })
    })
}