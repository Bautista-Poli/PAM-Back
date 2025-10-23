import express from 'express'
import matchRouter from "./routes/match.route";
import playerRouter from './routes/player.route';
import clubRouter from './routes/club.route'
import userRouter from './routes/user.route'

const app = express()

app.use(express.json())

app.get("/", (_req, res) => {
  res.status(200).send("El servidor está activo.");
});

// Rutas de productos
app.use("/matches", matchRouter);
app.use("/players", playerRouter);

app.use("/clubs", clubRouter);
app.use("/user", userRouter);

//app.use("/table", matchRowRouter);

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)
