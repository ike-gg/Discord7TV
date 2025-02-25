import { Router } from "express";

import finishTask from "./finishTask";

const tasksRouter = Router();

tasksRouter.post("/:taskid", finishTask);

export default tasksRouter;
