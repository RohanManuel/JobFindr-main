import { requireAuth } from "@clerk/clerk-sdk-node";

const protect = (req, res, next) => {
  try {
    const auth = requireAuth();
    auth(req, res, () => next());
  } catch (error) {
    res.status(401).json({ message: "Not Authorized" });
  }
};

export default protect;
