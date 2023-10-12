import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@dbtickets68/common';

const router = express.Router();
var jwt = require('jsonwebtoken');

router.post('/api/users/signup', [
  body('email')
    .isEmail()
    .withMessage('Email must be provided and valid'),
  body('password')
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Password must be between 6 and 20 chars')
  ], 
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }
    const user = User.build({ email, password });
    await user.save();
    if (!process.env.JWT_KEY) { 
      throw new Error('Missing JWT_KEY from env variables'); 
    }
    const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY);
    req.session = { jwt: userJwt };
    res.status(201).send(user);
  }
);

export { router as signupRouter };  