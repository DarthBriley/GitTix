import mongoose from 'mongoose';
import { Password } from '../services/password';

// Interface to describe properties for creating a new user
interface UserAttrs { email: string; password: string; };
// Interface to describe properties of a User Model
interface UserModel extends mongoose.Model<UserDoc> { build(attrs: UserAttrs): UserDoc; };
// Interface to describe the properties of a User Document
interface UserDoc extends mongoose.Document { email: string; password: string; };

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
    },
    versionKey: false
  }
});
userSchema.pre("save", async function(done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});
userSchema.statics.build = (attrs: UserAttrs) => { return new User(attrs); };
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);
export { User };