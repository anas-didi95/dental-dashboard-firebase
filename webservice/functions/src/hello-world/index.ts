import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello Firebase");
});

app.get("/:name", (req, res) => {
  res.send(`Hello ${req.params.name}`);
});

export default app;
