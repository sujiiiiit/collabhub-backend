import { Router } from "express";
import { getAllTechStacks } from "../controllers/techStackController";

const techStackRouter = Router();

techStackRouter.get("/", getAllTechStacks);

export default techStackRouter;
