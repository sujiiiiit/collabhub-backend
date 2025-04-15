import { Request, Response } from "express";
import { userCollection } from "../config/db";
import { ObjectId } from "mongodb";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userCollection.find({}).toArray();

    // Transform the data to return only username and userId
    const response = users.map(({ _id, username }) => ({
      userId: _id,
      username,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Validate the ID format
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await userCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { _id, username,applied } = user;
    res.status(200).json({ userId: _id, username,applied });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// In backend/src/controllers/userController.ts
export const getUserByUsername = async (req: Request, res: Response) => {
  try {
    const { username } = req.params;

    const user = await userCollection.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { _id, username: name,email } = user;
    res.status(200).json({ _id, username: name,email });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};