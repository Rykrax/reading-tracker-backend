import { Router } from "express";
import { bookRoutes } from "./book.routes.js";

const routes: Router = Router();

routes.use("/books/", bookRoutes);

export default routes;
