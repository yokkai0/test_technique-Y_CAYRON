const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { PrismaClient } = require("@prisma/client");
const { z } = require("zod");

const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000"] }));
app.use(express.json());

// Health
app.get("/api/health", (_, res) => res.json({ ok: true }));

// Validators
const tournamentSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  description: z.string().optional(),
});

// Create tournament
app.post("/api/tournaments", async (req, res, next) => {
  try {
    const body = tournamentSchema.parse(req.body);
    const created = await prisma.tournament.create({
      data: {
        name: body.name,
        date: new Date(body.date),
        description: body.description,
      },
    });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

// List tournaments
app.get("/api/tournaments", async (req, res, next) => {
  try {
    const list = await prisma.tournament.findMany({ orderBy: { date: "asc" } });
    res.json(list);
  } catch (e) {
    next(e);
  }
});

// Error handler
app.use((err, req, res, next) => {
  if (err?.name === "ZodError") {
    return res.status(400).json({ message: "Validation error", errors: err.errors });
  }
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
