import { describe, test, expect, beforeAll } from "vitest";
import request from "supertest";
import { execSync } from "node:child_process";

// DB de test isolée
process.env.DATABASE_URL = "file:./test.db";

// ⚠️ import CommonJS depuis ESM
import { app } from "../src/app.js";

describe("Tournament API", () => {
  beforeAll(() => {
    execSync("npx prisma migrate reset --force", { stdio: "inherit" });
  });

  test("POST /api/tournaments creates a tournament", async () => {
    const res = await request(app)
      .post("/api/tournaments")
      .send({
        name: "Tournoi Test",
        date: "2026-01-10T18:00:00.000Z",
        description: "desc",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.name).toBe("Tournoi Test");
  });

  test("Add teams + generate round-robin matches count", async () => {
    const t = await request(app).post("/api/tournaments").send({
      name: "RR",
      date: "2026-01-11T18:00:00.000Z",
    });
    expect(t.status).toBe(201);

    const id = t.body.id;

    for (const name of ["A", "B", "C"]) {
      const r = await request(app)
        .post(`/api/tournaments/${id}/teams`)
        .send({ name });
      expect(r.status).toBe(201);
    }

    const gen = await request(app)
      .post(`/api/tournaments/${id}/matches/generate`)
      .send();

    expect(gen.status).toBe(201);
    expect(gen.body.created).toBe(3);

    const detail = await request(app).get(`/api/tournaments/${id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.matches.length).toBe(3);
  });
});
