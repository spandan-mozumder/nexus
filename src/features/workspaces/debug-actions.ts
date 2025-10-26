"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function debugCurrentUser() {
  try {
    console.log("🔍 Debugging current user session...");

    const session = await auth();

    console.log("Session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      return {
        error: "No session found",
        session: null,
        user: null,
        workspaces: null,
      };
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log("User from DB:", user);

    const workspaces = await db.workspace.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        members: {
          where: {
            userId: session.user.id,
          },
          select: {
            role: true,
          },
        },
      },
    });

    console.log("Workspaces:", workspaces);

    return {
      success: true,
      session: {
        userId: session.user.id,
        userEmail: session.user.email,
      },
      user,
      workspaces: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        role: w.members[0]?.role,
      })),
    };
  } catch (error) {
    console.error("Debug error:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
