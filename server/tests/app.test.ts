
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
});
