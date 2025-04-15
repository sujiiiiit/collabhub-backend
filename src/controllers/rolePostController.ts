import { Request, Response } from "express";
import { rolePostCollection, userCollection } from "../config/db";
import { ObjectId } from "mongodb";
import { format } from "date-fns";

export const createRolePost = async (req: Request, res: Response) => {
  try {
    const {
      pName,
      repoLink,
      techStack,
      techPublic,
      roles,
      address,
      description,
      duration,
      deadline,
      userId,
    } = req.body;

    // Get the current date and format it as needed
    const createdAt = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"); // ISO format or adjust as needed

    const newRole = {
      pName,
      repoLink,
      techStack,
      techPublic,
      roles,
      address,
      description,
      duration,
      deadline,
      userId,
      createdAt, // Use the formatted date
    };

    const result = await rolePostCollection.insertOne(newRole);

    res.status(201).json({
      message: "Role created successfully",
      roleId: result.insertedId,
    });
  } catch (error) {
    console.error("Error inserting role:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllRolePosts = async (req: Request, res: Response) => {
  try {
    // Get page and filter parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = 30;
    const skip = (page - 1) * limit;

    // Extract filtering parameters from the query
    const { userId, techStack, roles } = req.query;

    // Create a filter object based on parameters
    const filter: any = {};

    if (userId) filter.userId = userId;
    if (techStack) filter.techStack = { $in: (techStack as string).split(",") };
    if (roles) filter.roles = { $in: (roles as string).split(",") };

    // Fetch role posts with pagination and filtering
    const rolePosts = await rolePostCollection
      .find(filter)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Transform the data as required
    const response = rolePosts.map(
      ({ _id, userId, techPublic, techStack, roles, address, createdAt }) => ({
        id: _id,
        userId,
        techPublic,
        ...(techPublic ? { techStack: techStack } : {}),
        roles,
        address,
        createdAt,
      })
    );

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching role posts:", err);
    res.status(500).json({ error: "Failed to fetch role posts" });
  }
};

export const getRolePostById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const rolePost = await rolePostCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!rolePost) {
      return res.status(404).json({ error: "Role post not found" });
    }

    const {
      _id,
      userId,
      repoLink,
      description,
      techPublic,
      techStack,
      roles,
      address,
    } = rolePost;
    const response = {
      id: _id,
      userId,
      repoLink,
      description,
      address, // Include address directly
      roles, // Include roles directly
      ...(techPublic ? { techStack } : {}), // Include techStack only if techPublic is true
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching role post:", err);
    res.status(500).json({ error: "Failed to fetch role post" });
  }
};

export const getRolePostsByUserId = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const rolePosts = await rolePostCollection.find({ userId }).toArray();
    const userDetail = await userCollection.findOne({
      _id: new ObjectId(userId),
    });
    if (!rolePosts.length) {
      return res
        .status(404)
        .json({ error: "No role posts found for this user" });
    }

    const response = rolePosts.map(({ _id, roles, deadline, createdAt }) => ({
      id: _id,
      roles,
      deadline,
      createdAt,
    }));

    res.status(200).json(response);
  } catch (err) {
    console.error("Error fetching role posts by user:", err);
    res.status(500).json({ error: "Failed to fetch role posts by user" });
  }
};

export const updateRolePostById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    pName,
    repoLink,
    techStack,
    techPublic,
    roles,
    address,
    description,
    duration,
    deadline,
  } = req.body;

  try {
    const result = await rolePostCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          pName,
          repoLink,
          techStack,
          techPublic,
          roles,
          address,
          description,
          duration,
          deadline,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Role post not found" });
    }

    res.status(200).json({ message: "Role post updated successfully" });
  } catch (err) {
    console.error("Error updating role post:", err);
    res.status(500).json({ error: "Failed to update role post" });
  }
};
