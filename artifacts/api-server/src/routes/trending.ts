import { Router, type IRouter } from "express";
import { GetTrendingPapersQueryParams } from "@workspace/api-zod";
import { getTrendingPapers } from "../lib/search.js";

const router: IRouter = Router();

const TRENDING_TOPICS = [
  { topic: "Large Language Models", paperCount: 15820, growthRate: 245, description: "Foundation models and transformer-based architectures for NLP tasks" },
  { topic: "Diffusion Models", paperCount: 8940, growthRate: 189, description: "Generative models for image synthesis and data augmentation" },
  { topic: "Vision Transformers", paperCount: 6320, growthRate: 134, description: "Applying transformer architecture to computer vision tasks" },
  { topic: "Federated Learning", paperCount: 4210, growthRate: 98, description: "Distributed machine learning with privacy preservation" },
  { topic: "Neural Architecture Search", paperCount: 3850, growthRate: 76, description: "Automated design of neural network architectures" },
  { topic: "Graph Neural Networks", paperCount: 7120, growthRate: 112, description: "Deep learning on graph-structured data" },
  { topic: "Reinforcement Learning from Human Feedback", paperCount: 2940, growthRate: 310, description: "Aligning AI models with human preferences" },
  { topic: "Medical Imaging AI", paperCount: 5680, growthRate: 88, description: "AI applications in radiology and medical diagnosis" },
  { topic: "Quantum Machine Learning", paperCount: 1820, growthRate: 156, description: "Combining quantum computing with machine learning algorithms" },
  { topic: "Autonomous Driving", paperCount: 9240, growthRate: 67, description: "AI systems for self-driving vehicles and robotics" },
];

const TOP_CONFERENCES = [
  "NeurIPS", "ICML", "ICLR", "CVPR", "ECCV", "ICCV",
  "ACL", "EMNLP", "NAACL", "AAAI", "IJCAI", "KDD", "SIGIR", "WWW",
];

router.get("/papers/trending", async (req, res): Promise<void> => {
  const parsed = GetTrendingPapersQueryParams.safeParse(req.query);
  const field = parsed.success ? parsed.data.field ?? undefined : undefined;

  try {
    const recentPapers = await getTrendingPapers(field);
    const topics = field
      ? TRENDING_TOPICS.filter(t => t.topic.toLowerCase().includes(field.toLowerCase()))
      : TRENDING_TOPICS;

    res.json({
      topics: topics.slice(0, 8),
      recentPapers,
      topConferences: TOP_CONFERENCES,
    });
  } catch (err) {
    req.log.error({ err }, "Get trending papers failed");
    res.json({
      topics: TRENDING_TOPICS.slice(0, 8),
      recentPapers: [],
      topConferences: TOP_CONFERENCES,
    });
  }
});

export default router;
