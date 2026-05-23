const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  deleteMyAccount,
} = require("../controllers/userController");

const { authenticate } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Logged-in user profile management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get logged-in user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64f1c2a9a1c3a4b5c6d7e8f9
 *                     userName:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@email.com
 *                     profile:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                           example: John
 *                         lastName:
 *                           type: string
 *                           example: Doe
 *                         bio:
 *                           type: string
 *                           example: Full stack developer
 *                         avatar:
 *                           type: object
 *                           nullable: true
 *                           properties:
 *                             url:
 *                               type: string
 *                               example: https://res.cloudinary.com/demo/image/upload/avatar.jpg
 *                             publicId:
 *                               type: string
 *                               example: avatars/abc123
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 */
router.get("/me", authenticate, getMyProfile);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update logged-in user's profile and/or avatar (partial update)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: johndoe@email.com
 *               profile[firstName]:
 *                 type: string
 *                 example: John
 *               profile[lastName]:
 *                 type: string
 *                 example: Doe
 *               profile[bio]:
 *                 type: string
 *                 example: Full stack developer
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file for avatar upload
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profile:
 *                       type: object
 *                       properties:
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         bio:
 *                           type: string
 *                         avatar:
 *                           type: object
 *                           properties:
 *                             url:
 *                               type: string
 *                             publicId:
 *                               type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: No valid fields provided OR duplicate email/username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No valid fields provided for update
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 */
router.patch("/me", authenticate, upload.single("avatar"), updateMyProfile);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete logged-in user's account (also deletes avatar from Cloudinary)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Account deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Server error
 */
router.delete("/me", authenticate, deleteMyAccount);

module.exports = router;
