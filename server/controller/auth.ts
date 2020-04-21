import {Request, Response} from "express";
import {config} from "dotenv"
import * as jwt from "jsonwebtoken";

config()

const login = async (req: Request, res: Response) => {
//Check if username and password are set
  let {password} = req.body;
  if (!(password)) {
    res.status(400).send();
  }

  //Check if encrypted password match
  if (process.env.ADMIN_PASSWORD !== password) {
    res.status(401).send();
    return;
  }

  //Sing JWT, valid for 1 hour
  const token = jwt.sign(
    {userId: 'admin'},
    process.env.SECRET_KEY || "",
    {expiresIn: "7d"}
  );

  //Send the jwt in the response
  res.send({token});
};

const logout = (req: Request, res: Response) => {

};

export default {
  login,
  logout
}
