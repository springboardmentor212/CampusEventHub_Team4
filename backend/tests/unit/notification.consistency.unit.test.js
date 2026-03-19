import { jest, describe, test, expect, beforeEach } from "@jest/globals";
import { notifyUser } from "../../utils/notificationService.js";
import { Notification } from "../../models/Notification.js";

describe("Notification consistency", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("maps legacy EVENT_ALERT to EVENT_UPDATE", async () => {
    const createSpy = jest.spyOn(Notification, "create").mockResolvedValue({});

    await notifyUser({
      recipientId: "u1",
      type: "EVENT_ALERT",
      title: "Legacy",
      message: "legacy type",
      link: "/student/dashboard",
    });

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "EVENT_UPDATE",
      })
    );
  });

  test("falls back invalid types to ACCOUNT_UPDATE", async () => {
    const createSpy = jest.spyOn(Notification, "create").mockResolvedValue({});

    await notifyUser({
      recipientId: "u1",
      type: "NOT_A_REAL_TYPE",
      title: "Invalid",
      message: "invalid type",
      link: "/student/dashboard",
    });

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "ACCOUNT_UPDATE",
      })
    );
  });
});
