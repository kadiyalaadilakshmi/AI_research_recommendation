import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import papersRouter from "./papers.js";
import trendingRouter from "./trending.js";
import aiAnalysisRouter from "./ai-analysis.js";
import chatRouter from "./chat.js";
import datasetsRouter from "./datasets.js";
import githubRouter from "./github.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(papersRouter);
router.use(trendingRouter);
router.use(aiAnalysisRouter);
router.use(chatRouter);
router.use(datasetsRouter);
router.use(githubRouter);

export default router;
