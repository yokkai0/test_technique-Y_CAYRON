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

const teamSchema = z.object({
  name: z.string().min(1),
});

const scoreSchema = z.object({
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
});

// creation tournoi
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

// Liste des tournois
app.get("/api/tournaments", async (req, res, next) => {
    try {
      const list = await prisma.tournament.findMany({ orderBy: { date: "asc" } });
      res.json(list);
    } catch (e) {
      next(e);
    }
});

// détails des tournois
app.get("/api/tournaments/:id", async (req, res, next) => {
    try {
      const t = await prisma.tournament.findUnique({
        where: { id: req.params.id },
        include: {
          teams: { include: { team: true } },
          matches: {
            include: { homeTeam: true, awayTeam: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });
  
      if (!t) return res.status(404).json({ message: "Tournament not found" });
  
      res.json(t);
    } catch (e) {
      next(e);
    }
});

// Ajouter team dans tournoi
app.post("/api/tournaments/:id/teams", async (req, res, next) => {
    try {
      const { name } = teamSchema.parse(req.body);
      const tournamentId = req.params.id;
  
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });
      if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  
      const team = await prisma.team.create({
        data: { name: name.trim() },
      });
  
      await prisma.tournamentTeam.create({
        data: { tournamentId, teamId: team.id },
      });
  
      res.status(201).json(team);
    } catch (e) {
      if (e?.code === "P2002") {
        return res.status(409).json({ message: "Team already linked" });
      }
      next(e);
    }
});

// Créatin de matchs
// Generate matches round-robin (each pair once)
app.post("/api/tournaments/:id/matches/generate", async (req, res, next) => {
    try {
      const tournamentId = req.params.id;
  
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          teams: { include: { team: true } },
          matches: true,
        },
      });
  
      if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  
      if (tournament.matches.length > 0) {
        return res.status(409).json({ message: "Matches already generated" });
      }
  
      const teams = tournament.teams.map((tt) => tt.team);
      if (teams.length < 2) {
        return res.status(400).json({ message: "Need at least 2 teams" });
      }
  
      const matchesData = [];
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          matchesData.push({
            tournamentId,
            homeTeamId: teams[i].id,
            awayTeamId: teams[j].id,
          });
        }
      }
  
      const created = await prisma.match.createMany({ data: matchesData });
      return res.status(201).json({ created: created.count });
    } catch (e) {
      next(e);
    }
});

// Update score d'un match
app.patch("/api/matches/:matchId/score", async (req, res, next) => {
    try {
      const body = scoreSchema.parse(req.body);
  
      const match = await prisma.match.update({
        where: { id: req.params.matchId },
        data: { homeScore: body.homeScore, awayScore: body.awayScore },
        include: { homeTeam: true, awayTeam: true },
      });
  
      res.json(match);
    } catch (e) {
      next(e);
    }
});
  
// GET scores d'un tournoi { win, draw, loss }
app.get("/api/tournaments/:id/standings", async (req, res, next) => {
    try {
      const tournamentId = req.params.id;
  
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
          teams: { include: { team: true } },
          matches: true,
        },
      });
      if (!tournament) return res.status(404).json({ message: "Tournament not found" });
  
      const teamIds = tournament.teams.map((tt) => tt.teamId);
  
      // init table
      const table = {};
      for (const teamId of teamIds) {
        table[teamId] = {
          teamId,
          teamName: tournament.teams.find((tt) => tt.teamId === teamId)?.team?.name || "",
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDiff: 0,
          points: 0,
        };
      }
  
      for (const m of tournament.matches) {
        if (m.homeScore == null || m.awayScore == null) continue;
  
        const home = table[m.homeTeamId];
        const away = table[m.awayTeamId];
        if (!home || !away) continue;
  
        home.played++;
        away.played++;
  
        home.goalsFor += m.homeScore;
        home.goalsAgainst += m.awayScore;
  
        away.goalsFor += m.awayScore;
        away.goalsAgainst += m.homeScore;
  
        if (m.homeScore > m.awayScore) {
          home.wins++; home.points += 3;
          away.losses++;
        } else if (m.homeScore < m.awayScore) {
          away.wins++; away.points += 3;
          home.losses++;
        } else {
          home.draws++; home.points += 1;
          away.draws++; away.points += 1;
        }
      }
  
      const rows = Object.values(table).map((r) => ({
        ...r,
        goalDiff: r.goalsFor - r.goalsAgainst,
      }));
  
      rows.sort((a, b) =>
        b.points - a.points ||
        b.goalDiff - a.goalDiff ||
        b.goalsFor - a.goalsFor ||
        a.teamName.localeCompare(b.teamName)
      );
  
      const out = rows.map((r, idx) => ({ rank: idx + 1, ...r }));
      res.json(out);
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

module.exports = { app };
