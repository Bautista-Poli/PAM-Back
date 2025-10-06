import express from 'express'
import productsRouter from "./routes/products.route";

const app = express()

app.use(express.json())

app.get("/", (_req, res) => {
  res.status(200).send("El servidor está activo.");
});

// Rutas de productos
app.use("/products", productsRouter);

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: https://github.com/prisma/prisma-examples/blob/latest/orm/express/README.md#using-the-rest-api`),
)
