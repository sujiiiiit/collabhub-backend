import { Request, Response } from "express";
import { applicationCollection, userCollection,rolePostCollection } from "../config/db"; // Assuming applicationCollection is initialized
import { format } from "date-fns";
import { ObjectId } from "mongodb";

// Route to submit an application
export const submitApplication = async (req: Request, res: Response) => {
  try {
    const { message, username, rolePostId,role,createdBy } = req.body;
    const createdAt = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"); // Timestamp

    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Resume file is required" });
    }

    const newApplication = {
      username: username,
      createdBy,
      rolePostId: String(rolePostId),
      message,
      role,
      resume: {
        data: req.file.buffer, // Convert binary file to base64 string
        contentType: req.file.mimetype, // Store the MIME type of the file
        filename: req.file.originalname, // Store the original filename
      },
      appliedOn: createdAt,
      status: "Pending",
    };

    const result = await applicationCollection.insertOne(newApplication);

    const updateUserApplicationCount = async () => {
      const user = await userCollection.findOne({ username });

      if (user) {
        const applicationCount = (user.applicationCount || 0) + 1;
        const applied = user.applied
          ? [...user.applied, result.insertedId]
          : [result.insertedId];

        await userCollection.updateOne(
          { username },
          { $set: { applicationCount, applied } }
        );

        return applied; // Return the updated 'applied' array
      }
      return [];
    };

    res.status(201).json({
      message: "Application submitted successfully",
      applicationId: result.insertedId,
      applied: await updateUserApplicationCount(),
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



export const getApplicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await applicationCollection.findOne({ _id: new ObjectId(id) });


    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const { _id, username, rolePostId, message,appliedOn,status,role } = application;
    const response = {
      id: _id,
      username,
      rolePostId,
      message,
      appliedOn,
      status,
      role,

    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};

export const getResume = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const application = await applicationCollection.findOne({ _id: new ObjectId(id) });


    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const { _id, resume } = application;
    const response = {
      id: _id,
      resume,

    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};


export const hasUserAppliedForRole = async (req: Request, res: Response) => {
  try {
    const { username, rolePostId } = req.params;

    const application = await applicationCollection.findOne({
      username: username,
      rolePostId: rolePostId,
    });
    if (application) {
      return res.status(200).json({ applied: true });
    } else {
      return res.status(200).json({ applied: false });
    }

    res.status(200).json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    res.status(500).json({ message: "Failed to fetch application" });
  }
};

export const getApplicationsByRolePostId = async (req: Request, res: Response) => {
  try {
    const { rolePostId } = req.params;

    const applications = await applicationCollection.find({ rolePostId: { $regex: `^${rolePostId}` } }).toArray();

    if (!applications.length) {
      return res.status(404).json({ message: "No applications found for this role post" });
    }

    const response = applications.map(application => ({
      id: application._id,
      username: application.username,
      rolePostId: application.rolePostId,
      message: application.message,
      appliedOn: application.appliedOn,
      status: application.status,
      role: application.role,
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

export const getApplicationsByRolePostIdandUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const applications = await applicationCollection.find({
      createdBy: userId
    }).toArray();

    if (!applications.length) {
      return res.status(404).json({ message: "No applications found for this role post and user" });
    }

    const response = applications.map(application => ({
      id: application._id,
      username: application.username,
      rolePostId: application.rolePostId,
      message: application.message,
      appliedOn: application.appliedOn,
      status: application.status,
      role: application.role,
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};


export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const result = await applicationCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.status(200).json({ message: "Application status updated successfully" });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ message: "Failed to update application status" });
  }
};



