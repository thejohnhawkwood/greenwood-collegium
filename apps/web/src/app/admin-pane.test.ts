import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { AuthSessionPublic } from "@greenwood/contracts";
import { ActiveStudentCard, AdminPane } from "./AdminPane.js";
import { givenNameFromCollegian, isActiveClassroomStudent } from "./classroom-data.js";
import { AcademyFrame } from "./academy-frame.js";
import { ApprovalGate } from "./ApprovalGate.js";
import { shouldShowCharacterGate } from "./character-gate.js";

const me: AuthSessionPublic = {
  accountId: "fixture",
  username: "fictional",
  role: "student",
  characterComplete: true,
  characterName: "Hazel the Mouse",
  nameReview: { status: "pending" },
};
describe("teacher and approval presentation", () => {
  it("does not render administration for students", () => {
    expect(renderToStaticMarkup(createElement(AdminPane, { me }))).toBe("");
  });
  it("places named teacher controls in the frame sidebar", () => {
    const html = renderToStaticMarkup(
      createElement(AcademyFrame, {
        children: "Transcript",
        sidebar: createElement(AdminPane, { me: { ...me, role: "owner" } }),
      }),
    );
    expect(html).toContain("has-admin");
    expect(html).toContain('aria-label="Teacher administration"');
    expect(html).toContain("Pause student chat");
    expect(html).toContain("Active");
    expect(html).toContain("Roster");
    expect(html).toContain("Transcript");
  });
  it("treats active students with a Collegian as the Active tab list", () => {
    expect(givenNameFromCollegian("Hazel the Mouse")).toBe("Hazel");
    expect(
      isActiveClassroomStudent({
        accountId: "fixture",
        username: "pip",
        role: "student",
        status: "active",
        createdAt: "2026-09-11T00:00:00.000Z",
        characterId: "char-1",
        characterName: "Hazel the Mouse",
        roomTitle: "Lantern Court",
      }),
    ).toBe(true);
    expect(
      isActiveClassroomStudent({
        accountId: "fixture",
        username: "pip",
        role: "student",
        status: "active",
        createdAt: "2026-09-11T00:00:00.000Z",
      }),
    ).toBe(false);
    const active = renderToStaticMarkup(
      createElement(ActiveStudentCard, {
        busy: false,
        act: async () => undefined,
        account: {
          accountId: "fixture",
          username: "pip",
          role: "student",
          status: "active",
          createdAt: "2026-09-11T00:00:00.000Z",
          characterId: "char-1",
          characterName: "Hazel the Mouse",
          roomTitle: "Lantern Court",
        },
      }),
    );
    expect(active).toContain("Lantern Court");
    expect(active).toContain("Mute");
    expect(active).toContain("Timeout");
    expect(active).toContain("Remove");
  });
  it("shows submitted names and retention information while waiting outside the realm", () => {
    const html = renderToStaticMarkup(
      createElement(ApprovalGate, { me, onRefresh: () => {}, onSignOut: () => {} }),
    );
    expect(html).toContain("Waiting at the Collegium gates");
    expect(html).toContain("Hazel the Mouse");
    expect(html).toContain("six months");
    expect(html).not.toContain('aria-label="Command"');
    expect(
      shouldShowCharacterGate({
        ...me,
        nameReview: { status: "rejected", reason: "Choose again" },
      }),
    ).toBe(true);
    expect(shouldShowCharacterGate({ ...me, nameReview: { status: "approved" } })).toBe(false);
  });
});
