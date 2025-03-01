import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import methodOverride from "method-override";
import * as database from "./config/database";

import adminRoutes from "./routes/admin/index.route";
import clientRoutes from "./routes/client/index.route";
import { systemConfig } from "./config/config";

dotenv.config();

database.connect();

const app: Express = express();
const port: (number | string) = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(methodOverride("_method"));

app.use(express.static("public"));

app.set("views", "./views");
app.set("view engine", "pug");

// TinyMCE
app.use(
    '/tinymce',
    express.static(path.join(__dirname, 'node_modules', 'tinymce'))
);
// End TinyMCE

// App Local Variables
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// Admin Routes
adminRoutes(app);

// Client Routes
clientRoutes(app);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

