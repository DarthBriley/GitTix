import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { User } from '../models/user';
import { Password } from '../services/password';
import { validateRequest, BadRequestError } from '@dbtickets68/common';

const router = express.Router();
var jwt = require('jsonwebtoken');

router.post('/api/users/signin', [ 
  body('email')
  .isEmail()
  .withMessage('The email must be valid'),
  body('password')
  .trim()
  .notEmpty()
  .withMessage('You must provide a password')
],
validateRequest,
async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new BadRequestError('Invaild Credntials');
  }
const passwordsMatch = await Password.compare(existingUser.password, password);
if (!passwordsMatch) {
  throw new BadRequestError('Invaild Credentials');
}
const userJwt = jwt.sign({ id: existingUser.id, email: existingUser.email }, process.env.JWT_KEY);
req.session = { jwt: userJwt};
res.status(200).send(existingUser);
});
export { router as signinRouter };