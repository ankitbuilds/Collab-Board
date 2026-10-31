
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("CollabBoard API", () => {
  it("returns a successful response from the root endpoint", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "CollabBoard API is running",
    });
  });

  it("returns the health endpoint response", async () => {
    const response = await request(app).get("/health");

    expect([200, 503]).toContain(response.status);
    expect(response.body.service).toBe("CollabBoard API");
    expect(["ok", "degraded"]).toContain(response.body.status);
    expect(["connected", "disconnected"]).toContain(
      response.body.database
    );
  });

  it("allows localhost and the deployed frontend origin for CORS preflight", async () => {
    const localhostResponse = await request(app)
      .options("/api/auth/register")
      .set("Origin", "http://localhost:5173")
      .set("Access-Control-Request-Method", "POST");

    expect(localhostResponse.status).toBe(204);
    expect(localhostResponse.headers["access-control-allow-origin"]).toBe(
      "http://localhost:5173"
    );

    const prodResponse = await request(app)
      .options("/api/auth/register")
      .set("Origin", "https://collab-board-gold.vercel.app")
      .set("Access-Control-Request-Method", "POST");

    expect(prodResponse.status).toBe(204);
    expect(prodResponse.headers["access-control-allow-origin"]).toBe(
      "https://collab-board-gold.vercel.app"
    );
  });

  it("rejects passwords shorter than 8 characters during registration", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "1234567",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("password must be at least 8 characters");
  });
});
