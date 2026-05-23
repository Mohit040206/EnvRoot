const express=require("express")
const { authenticate, authorize } = require("../middleware/authMiddleware")
const { adminOverview,adminTestAnalytics,adminUserAnalytics } = require("../controllers/analyticsController")

const router=express.Router()


/**
 * @swagger
 * /analytics/admin/overview:
 *   get:
 *     summary: Get admin dashboard overview statistics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin overview analytics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: number
 *                 totalTests:
 *                   type: number
 *                 totalAttempts:
 *                   type: number
 *                 submittedAttempts:
 *                   type: number
 *                 averageScore:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */

router.get("/admin/overview",authenticate,authorize(["ADMIN"]),adminOverview)

/**
 * @swagger
 * /analytics/admin/tests:
 *   get:
 *     summary: Get analytics for each active test
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Test analytics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       testId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       totalAttempts:
 *                         type: number
 *                       averageScore:
 *                         type: number
 *                       passRate:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */

router.get("/admin/tests", authenticate, authorize(["ADMIN"]), adminTestAnalytics);

/**
 * @swagger
 * /analytics/admin/users:
 *   get:
 *     summary: Get analytics for each user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User analytics fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       totalAttempts:
 *                         type: number
 *                       averageScore:
 *                         type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.get(
  "/admin/users",
  authenticate,
  authorize(["ADMIN"]),
  adminUserAnalytics
);

router.get("/admin/users", authenticate, authorize(["ADMIN"]), adminUserAnalytics);


module.exports=router