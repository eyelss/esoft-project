import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
        return;
    }
    
    next();
}; 