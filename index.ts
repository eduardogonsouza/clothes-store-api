import express from "express";
import cors from "cors";

import clothesRouter from "./routes/clothes";
import brandsRouter from "./routes/brands";
import usersRouter from "./routes/users";
import ratingsRouter from "./routes/ratings";
import commentsRouter from "./routes/comments";

const app = express();
const port = 3004;

app.use(express.json());
app.use(cors());

app.use("/users", usersRouter);
app.use("/brands", brandsRouter);
app.use("/clothes", clothesRouter);
app.use("/ratings", ratingsRouter);
app.use("/comments", commentsRouter);

app.get("/", (req_, res) => {
  res.send("API: Clothes Store");
});

app.listen(port, () => {
  console.log(`Server start in: ${port}`);
});
