const express = require("express");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const { runCode } = require("../controllers/sandboxController");
//
const router = express.Router();
/**
 * @swagger
 * /sandbox/run:
 *   post:
 *     summary: Run submitted code against sample test cases
 *     tags: [Sandbox]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - questionId
 *               - code
 *               - language
 *             properties:
 *               questionId:
 *                 type: string
 *                 description: Coding question ID
 *               code:
 *                 type: string
 *                 description: Source code to execute
 *               language:
 *                 type: string
 *                 enum: [javascript, python]
 *     responses:
 *       200:
 *         description: Code executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 passedTCs:
 *                   type: number
 *                 totalTCs:
 *                   type: number
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       input:
 *                         type: string
 *                       expectedOutput:
 *                         type: string
 *                       actualOutput:
 *                         type: string
 *                       passed:
 *                         type: boolean
 *       400:
 *         description: Unsupported language
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Question not found
 *       500:
 *         description: Internal server error
 */

router.post("/run", authenticate, authorize(["ADMIN", "USER"]), runCode);

module.exports = router;
