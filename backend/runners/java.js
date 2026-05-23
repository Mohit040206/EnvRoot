const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const normalizeOutput=require("../utils/normalizeOutput")

exports.run = (code, testCases) => {
  return new Promise((resolve, reject) => {
    const workDir = path.join(__dirname, "..", "tmp", "java");
    fs.mkdirSync(workDir, { recursive: true });

    const javaFile = path.join(workDir, "Solution.java");

    const wrappedCode = `
class Solution {

${code}

public static void main(String[] args) throws Exception {
    java.io.BufferedReader br =
        new java.io.BufferedReader(new java.io.InputStreamReader(System.in));

    String input = br.readLine();
    String cleaned = input.replace("[", "").replace("]", "");
    String[] parts = cleaned.split(",");

    int[] arr = new int[parts.length];
    for (int i = 0; i < parts.length; i++) {
        arr[i] = Integer.parseInt(parts[i].trim());
    }

    Object result = solution(arr);
    System.out.println(result);
}
}
`;

    fs.writeFileSync(javaFile, wrappedCode);

    let compileError = "";
    const compile = spawn("javac", [javaFile]);

    compile.stderr.on("data", e => compileError += e.toString());

    compile.on("close", status => {
      if (status !== 0) {
        return reject(new Error(compileError));
      }

      const results = [];
      let passedTCs = 0;

      (async () => {
        for (const tc of testCases) {
          const run = spawn("java", ["-cp", workDir, "Solution"]);

          let output = "";
          let error = "";

          run.stdout.on("data", d => output += d.toString());
          run.stderr.on("data", e => error += e.toString());

          run.stdin.write(JSON.stringify(tc.input[0]));
          run.stdin.end();

          await new Promise(res => run.on("close", res));

          let actual = output.trim();

if (actual.startsWith("[") && actual.endsWith("]")) {
  actual = actual
    .slice(1, -1)
    .split(",")
    .map(v => v.trim())
    .filter(v => v !== "")
    .map(Number);
}

         const passed =
  normalizeOutput(actual) === normalizeOutput(tc.output);

          if (passed) passedTCs++;

          results.push({
            input: tc.input,
            expectedOutput: tc.output,
            actualOutput: actual,
            passed
          });
        }

        resolve({
          passedTCs,
          totalTCs: testCases.length,
          results
        });
      })();
    });
  });
};
