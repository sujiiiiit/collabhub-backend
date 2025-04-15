import { Router } from "express";
import { getAllUsers, getUserById ,getUserByUsername} from "../controllers/userController";
import { publicMiddleware } from "../middleware/publicMiddleware";

const router = Router();

router.get("/", getAllUsers); // Make getAllUsers public
router.get("/:id",publicMiddleware, getUserById);
router.get("/username/:username", publicMiddleware, getUserByUsername);
export default router;