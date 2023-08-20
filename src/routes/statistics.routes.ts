import express, { Request, Response } from "express";

const userRouter: express.Router = express.Router();

userRouter.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

export default userRouter;
