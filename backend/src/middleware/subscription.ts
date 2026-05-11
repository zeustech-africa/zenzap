import { Request, Response, NextFunction } from 'express';
import { hasFeature, getFeatureLimits } from '../models/Subscription';

// Augment Express Request type
declare global {
  namespace Express {
    interface Request {
      limits?: {
        messagesPerMonth: number;
        agents: number;
        contacts: number;
        broadcastsPerMonth: number;
        templates: number;
        flows: number;
      };
    }
  }
}

// Check if user has access to a feature
export function requireFeature(feature: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.query.userId || req.body.userId;
    // In production, fetch user's subscription tier from database
    const userTier = 'free'; // Placeholder - get from DB

    if (!hasFeature(userTier, feature)) {
      return res.status(403).json({
        error: 'Feature not available on your current plan',
        upgradeRequired: true,
        message: `Upgrade to access this feature`
      });
    }

    next();
  };
}

// Get user's feature limits
export function getLimits(req: Request, res: Response, next: NextFunction) {
  const userId = req.query.userId || req.body.userId;
  const userTier = 'free'; // Placeholder - get from DB
  const limits = getFeatureLimits(userTier);

  req.limits = limits;
  next();
}