// const Questions = require("../model/Questions");
// const vm = require("vm");
// const { spawn } = require("child_process");

// exports.runCode = async (req, res) => {
//   try {
//     const { questionId, code, language } = req.body;

//     const question = await Questions.findById(questionId);
//     if (!question) {
//       return res.status(404).json({
//         success: false,
//         message: "Question not found",
//       });
//     }

//     // =========================
//     // 🔧 COMMON NORMALIZERS
//     // =========================

//     // 🔧 FIX 1: Normalize INPUT safely
//     const normalizeInput = (input) => {
//       // ❌ OLD ISSUE: input could be number/string/object
//       // ✅ FIX: Always return an ARRAY
//       if (Array.isArray(input)) return input;

//       if (typeof input === "string") {
//         try {
//           const parsed = JSON.parse(input);
//           return Array.isArray(parsed) ? parsed : [parsed];
//         } catch {
//           return [input];
//         }
//       }

//       return [input];
//     };

//     // 🔧 FIX 2: Normalize OUTPUT before comparison
//     const normalizeOutput = (v) => {
//       // ❌ OLD ISSUE: "6" !== 6
//       // ✅ FIX: Compare normalized values
//       if (typeof v === "object") return JSON.stringify(v);
//       return String(v);
//     };

//     // =========================
//     // 🔹 JAVASCRIPT RUNNER
//     // =========================
//     if (language === "javascript") {
//       const results = [];
//       let passedTCs = 0;

//       for (const tc of question.testCases) {
//         try {
//           // =========================
//           // 🔧 FIX 3: SAFE INPUT HANDLING
//           // =========================
//           const inputArray = normalizeInput(tc.input);

//           const context = {
//             input: inputArray,
//             result: null,
//           };

//           vm.createContext(context);

//           const wrappedCode = `
//             ${code}
//             // ❌ OLD ISSUE: solution(...input) where input was NOT iterable
//             // ✅ FIX: input is GUARANTEED to be array
//             result = solution(...input);
//           `;

//           new vm.Script(wrappedCode).runInContext(context, {
//             timeout: 1000,
//           });

//           // =========================
//           // 🔧 FIX 4: SAFE OUTPUT COMPARISON
//           // =========================
//           const passed =
//             normalizeOutput(context.result) === normalizeOutput(tc.output);

//           if (passed) passedTCs++;

//           results.push({
//             input: tc.input,
//             expectedOutput: tc.output,
//             actualOutput: context.result,
//             passed,
//           });
//         } catch (err) {
//           // ❌ OLD ISSUE: spread / parse errors surfaced here
//           // ✅ FIX: clear error reporting
//           results.push({
//             input: tc.input,
//             error: err.message,
//             passed: false,
//           });
//         }
//       }

//       return res.json({
//         success: true,
//         data: {
//           passedTCs,
//           totalTCs: question.testCases.length,
//           results,
//         },
//       });
//     }

//     // =========================
//     // 🔹 PYTHON (UNCHANGED)
//     // =========================
//     if (language === "python") {
//       const py = spawn("python", ["pythonRunner.py"]);

//       py.stdin.write(
//         JSON.stringify({
//           code,
//           testCases: question.testCases,
//         }),
//       );
//       py.stdin.end();

//       let output = "";

//       py.stdout.on("data", (data) => {
//         output += data.toString();
//       });

//       py.stderr.on("data", (err) => {
//         console.error("Python error:", err.toString());
//       });

//       py.on("close", () => {
//   const parsed = JSON.parse(output);

//   if (parsed.error) {
//     return res.status(400).json({
//       success: false,
//       error: parsed.error,
//     });
//   }

//   return res.json({
//     success: true,
//     data: parsed,
//   });
// });


//       return;
//     }

//     return res.status(400).json({
//       success: false,
//       message: "Unsupported language",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


const Questions=require("../model/Questions")
const runners=require("../runners");

exports.runCode=async(req,res)=>{
  try{
    const{questionId,code,language}=req.body;

    const question=await Questions.findById(questionId);

    if(!question){
      return res.status(404).json({
        success:false,
        message:"Question not found"
      })
    }
    const runner=runners[language]
    if(!runner){
      return res.status(400).json({
        success:false,
        message:"Unsupported language"
      })
    }

    const result=await runner.run(code,question.testCases);

    return res.status(200).json({
      success:true,
      data:result
    })
  }catch(err){
    return res.status(500).json({
      success:false,
      message:err.message
    })
  }
}