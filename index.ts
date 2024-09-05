import express from "express";
import cors from "cors";

// import marcasRoutes from './routes/marcas'
// import carrosRoutes from './routes/carros'
const app = express();
const port = 3004;

app.use(express.json());
app.use(cors());

// app.use("/marcas", marcasRoutes)
// app.use("/carros", carrosRoutes)

app.get("/", (req, res) => {
  res.send("API: Clothes Store");
});

app.listen(port, () => {
  console.log(`Server start in: ${port}`);
});
