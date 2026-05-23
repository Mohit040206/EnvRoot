const vm = require("vm");

/**
 * Runs code against test cases
 * RETURNS: { passedTCs, totalTCs }
 */
exports.evaluateCoding = async ({ code, language, testCases }) => {
  let passedTCs = 0;

  for (const tc of testCases) {
    if (language === "javascript") {
      const context = {
        input: Array.isArray(tc.input) ? tc.input : [tc.input],
        result: null,
      };

      vm.createContext(context);

      const wrappedCode = `
        ${code}
        result = solution(...input);
      `;

      new vm.Script(wrappedCode).runInContext(context, {
        timeout: 1000,
      });

      const passed =
        JSON.stringify(context.result) === JSON.stringify(tc.output);

      if (passed) passedTCs++;
    }

    // (later: python support)
  }

  return {
    passedTCs,
    totalTCs: testCases.length,
  };
};
