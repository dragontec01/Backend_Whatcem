import { Router, Request, Response, IRouter } from "express";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router: IRouter = Router();

/**
 * @route   GET /api/test
 * @desc    Public test route
 * @access  Public
 */
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Test route is working!",
    timestamp: new Date().toISOString(),
  });
});

/**
 * @route   GET /api/test/ping
 * @desc    Simple ping endpoint
 * @access  Public
 */
router.get("/ping", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "pong",
  });
});

/**
 * @route   POST /api/test/echo
 * @desc    Echo back the request body
 * @access  Public
 */
router.post("/echo", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Echo response",
    data: req.body,
  });
});

/**
 * @route   GET /api/test/protected
 * @desc    Protected test route (requires authentication)
 * @access  Private
 */
router.get("/protected", authenticate, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    success: true,
    message: "You have access to this protected route!",
    user: req.user,
  });
});

/**
 * @route   GET /api/test/error
 * @desc    Test error handling
 * @access  Public
 */
router.get("/error", (_req: Request, _res: Response) => {
  throw new Error("This is a test error");
});

export default router;
