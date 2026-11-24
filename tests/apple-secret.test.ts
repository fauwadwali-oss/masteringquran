import { describe, expect, it } from "vitest";
import { generateKeyPairSync, createPublicKey, verify } from "node:crypto";
import { appleClientSecret } from "../functions/_lib/apple";

describe("Apple client secret", () => {
    it("is a valid short-lived ES256 token", async () => {
        const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
        const pem = privateKey.export({ type: "pkcs8", format: "pem" }) as string;
        const jwt = await appleClientSecret({ APPLE_TEAM_ID: "T", APPLE_KEY_ID: "K", APPLE_PRIVATE_KEY: pem.replace(/\n/g, "\\n") }, 1_000_000);
        const [h, p, s] = jwt.split(".");
        expect(JSON.parse(Buffer.from(h, "base64url").toString())).toEqual({ alg: "ES256", kid: "K" });
        expect(JSON.parse(Buffer.from(p, "base64url").toString())).toMatchObject({ iss: "T", iat: 1000, exp: 1300, sub: "com.nusratwaliventures.masteringquran" });
        expect(verify("sha256", Buffer.from(`${h}.${p}`), { key: createPublicKey(publicKey.export({ type: "spki", format: "pem" })), dsaEncoding: "ieee-p1363" }, Buffer.from(s, "base64url"))).toBe(true);
    });
});
