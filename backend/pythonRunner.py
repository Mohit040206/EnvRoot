
import sys
import json

def run():
    data = json.loads(sys.stdin.read())
    code = data["code"]
    test_cases = data["testCases"]

    results = []
    passed = 0
    local_env = {}

    try:
        exec(code, local_env)

        if "Solution" not in local_env:
            raise Exception("Class Solution not found")

        sol = local_env["Solution"]()

        for tc in test_cases:
            input_data = tc["input"]     
            expected = tc["output"]

            actual = sol.solution(*input_data)

            is_pass = actual == expected
            if is_pass:
                passed += 1

            results.append({
                "input": input_data,
                "expectedOutput": expected,
                "actualOutput": actual,
                "passed": is_pass
            })

        print(json.dumps({
            "passedTCs": passed,
            "totalTCs": len(test_cases),
            "results": results
        }))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }))

if __name__ == "__main__":
    run()
