import { NextFunction, Response, Router, Request } from "express";

import { checkUserAuth } from "../../middleware/auth";

export const meRouter = Router();
const meStateRouter = Router();

// for meStateRouter we using only basic auth, without fetching user data
// the reason is we want to make it as fast as possible
meStateRouter.use((req, res, next) =>
  checkUserAuth(req, res, next, { fetchUserData: false })
);
meStateRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  // if we are in this place, it means that user is authenticated, so we can just send 200
  res.status(200).send();
});

// appending meStateRouter to meRouter
meRouter.use("/state", meStateRouter);

// for meRouter we using full auth, with fetching user data
meRouter.use((req, res, next) => checkUserAuth(req, res, next, { fetchUserData: true }));
meRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.json(req.user);
});
