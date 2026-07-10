import express from "express";
import { saveCallHistory, getCallHistory, deleteCallHistory } from "../controllers/call.controller.js";
import isAuth from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/history", isAuth, saveCallHistory);
router.get("/history", isAuth, getCallHistory);
router.delete("/history/:id", isAuth, deleteCallHistory);

export default router;
