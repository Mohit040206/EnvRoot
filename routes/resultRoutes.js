const express=require("express")
const { authenticate, authorize } = require("../middleware/authMiddleware")
const { downloadResultPdf }=require("../controllers/resultController")

const router=express.Router()

/**
 * @swagger
 * /results/{attemptId}/pdf:
 *   get:
 *     summary: Download test result as PDF
 *     tags: [Results]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Test attempt ID
 *     responses:
 *       200:
 *         description: Result PDF downloaded successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Test not submitted yet
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Result not found
 *       500:
 *         description: Internal server error
 */

router.get("/:attemptId/pdf",authenticate,authorize(["USER"]),downloadResultPdf)

module.exports=router