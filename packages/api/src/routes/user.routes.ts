import { Router } from "express";
import {prisma} from "@repo/db";

const router : Router = Router();

router.get("/", async(req, res) => {
  const user = await prisma.user.findFirst()
  res.status(200).json({user});
});

export default router;