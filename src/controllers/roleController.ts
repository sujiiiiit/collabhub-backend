import { Request, Response } from "express";
import { roleCollection } from "../config/db";
import { ObjectId } from "mongodb";

export const getAllRoles = async (req: Request, res: Response) => {
  try {
    // Fetch all roles
    const roles = await roleCollection.find().toArray();

    // Transform the data if needed
    const response = roles.map(({ _id, roleId, name }) => ({
      id: _id,
      roleId,
      name,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};

// Get a single role by ID
export const getRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const role = await roleCollection.findOne({ _id: new ObjectId(id) });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    const { _id, roleId, name } = role;
    const response = {
      id: _id,
      roleId,
      name,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching role:", err);
    res.status(500).json({ error: "Failed to fetch role" });
  }
};

// Create a new role
export const createRole = async (req: Request, res: Response) => {
  const { roleId, name } = req.body;

  try {
    const newRole = { roleId, name };
    const result = await roleCollection.insertOne(newRole);

    res.status(201).json({ id: result.insertedId, ...newRole });
  } catch (err) {
    console.error("Error creating role:", err);
    res.status(500).json({ error: "Failed to create role" });
  }
};

// Update an existing role by ID
export const updateRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { roleId, name } = req.body;

  try {
    const result = await roleCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { roleId, name } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(200).json({ message: "Role updated successfully" });
  } catch (err) {
    console.error("Error updating role:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
};

// Delete a role by ID
export const deleteRoleById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await roleCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.status(200).json({ message: "Role deleted successfully" });
  } catch (err) {
    console.error("Error deleting role:", err);
    res.status(500).json({ error: "Failed to delete role" });
  }
};
