import { Router, type IRouter } from "express";
import adminRouter from "./admin";
import healthRouter from "./health";
import publishingRouter from "./publishing";
import { requireAdmin } from "../middlewares/adminAuth";

const router: IRouter = Router();

router.use(healthRouter);
adminRouter.use("/publishing", publishingRouter);
router.use("/admin", requireAdmin, adminRouter);

export default router;
