import {Router} from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRoleById,
  deleteRoleById,
} from "../controllers/roleController";

const router = Router();


router.get("/", getAllRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.put("/:id", updateRoleById);
router.delete("/:id", deleteRoleById);

export default router;
