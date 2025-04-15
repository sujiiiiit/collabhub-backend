import { Request, Response } from "express";

export const getUser = (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.json({ message: "Logout successful" });
  });
};

export const fetchUserRepos = async (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const accessToken = (req.user as any).accessToken;
  console.log("accessToken", accessToken);

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const repos = await response.json();
    res.json(repos);
  } catch (err) {
    console.error("Error fetching repos:", err);
    res.status(500).json({ message: "Failed to fetch repositories" });
  }
};


export const getAccessToken = (req: Request, res: Response) => {
  if (req.isAuthenticated() && req.user) {
    const accessToken = (req.user as any).accessToken;
    res.json({ accessToken });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
};
