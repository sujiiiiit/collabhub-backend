import { Request, Response } from "express";
import { techCollection } from "../config/db";

export const getAllTechStacks = async (req: Request, res: Response) => {
  try {
    // Fetch all roles
    const techStacks = await techCollection.find().toArray();

    // Transform the data if needed
    const response = techStacks.map(({ _id, stackId, name }) => ({
      id: _id,
      stackId,
      name,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching roles:", err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
};