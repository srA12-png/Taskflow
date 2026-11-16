import bcrypt from "bcryptjs";
import { getDb, runMigrations, closeDb, withTransaction } from "./connection.js";

export const DEMO_EMAIL = "demo@taskflow.app";
export const DEMO_PASSWORD = "Demo@12345";

const DEFAULT_CATEGORIES = [
  { name: "Personal", color: "#6366F1" },
  { name: "Work", color: "#0EA5E9" },
  { name: "Study", color: "#8B5CF6" },
  { name: "Health", color: "#10B981" },
  { name: "Other", color: "#64748B" },
];

function iso(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Demo tasks are dated relative to "now" so Today / Upcoming / Overdue are
 * always demonstrable. Only clearly fake data is used.
 */
function demoTasks(categoryIds) {
  return [
    {
      title: "Finish DSA assignment on graphs",
      description:
        "Complete BFS/DFS problems and write short notes on traversal complexity.",
      priority: "high",
      status: "in_progress",
      category: categoryIds.Study,
      dueAt: iso(DAY * 0 + 6 * 60 * 60 * 1000),
      completedAt: null,
    },
    {
      title: "Push portfolio project to GitHub",
      description: "Write README, add screenshots and pin the repository.",
      priority: "high",
      status: "pending",
      category: categoryIds.Work,
      dueAt: iso(DAY * 2),
      completedAt: null,
    },
    {
      title: "Morning run — 5 km",
      description: null,
      priority: "medium",
      status: "completed",
      category: categoryIds.Health,
      dueAt: iso(-DAY * 1),
      completedAt: iso(-DAY * 1 + 60 * 60 * 1000),
    },
    {
      title: "Revise operating systems unit 3",
      description: "Scheduling algorithms: FCFS, SJF, Round Robin.",
      priority: "medium",
      status: "pending",
      category: categoryIds.Study,
      dueAt: iso(DAY * 4),
      completedAt: null,
    },
    {
      title: "Submit internship application",
      description: "Tailor the resume for the backend role and apply.",
      priority: "high",
      status: "pending",
      category: categoryIds.Work,
      dueAt: iso(-DAY * 2),
      completedAt: null,
    },
    {
      title: "Team stand-up notes",
      description: "Summarise blockers and share in the group chat.",
      priority: "low",
      status: "completed",
      category: categoryIds.Work,
      dueAt: iso(-DAY * 2),
      completedAt: iso(-DAY * 2 + 2 * 60 * 60 * 1000),
    },
    {
      title: "Buy groceries for the week",
      description: "Rice, dal, vegetables, milk, fruit.",
      priority: "low",
      status: "pending",
      category: categoryIds.Personal,
      dueAt: iso(DAY * 1),
      completedAt: null,
    },
    {
      title: "Plan weekend trip",
      description: "Compare two routes and book the train tickets.",
      priority: "low",
      status: "pending",
      category: categoryIds.Personal,
      dueAt: null,
      completedAt: null,
    },
    {
      title: "Mock interview with friend",
      description: "45 minutes of React + Node questions.",
      priority: "medium",
      status: "pending",
      category: categoryIds.Study,
      dueAt: iso(DAY * 6),
      completedAt: null,
    },
    {
      title: "Update resume with TaskFlow",
      description: "Add the project under personal projects with metrics.",
      priority: "medium",
      status: "completed",
      category: categoryIds.Other,
      dueAt: iso(-DAY * 4),
      completedAt: iso(-DAY * 4 + 3 * 60 * 60 * 1000),
    },
    {
      title: "Read 20 pages of Clean Code",
      description: null,
      priority: "low",
      status: "completed",
      category: categoryIds.Study,
      dueAt: iso(-DAY * 3),
      completedAt: iso(-DAY * 3 + 4 * 60 * 60 * 1000),
    },
    {
      title: "Dentist appointment",
      description: "Routine check-up at 5 pm.",
      priority: "medium",
      status: "pending",
      category: categoryIds.Health,
      dueAt: iso(DAY * 3),
      completedAt: null,
    },
  ];
}

export async function seedDemoData({ reset = false } = {}) {
  await runMigrations();
  const db = await getDb();
  const existing = await db.get("SELECT id FROM users WHERE email = ?", [
    DEMO_EMAIL,
  ]);

  if (existing && !reset) {
    return { created: false, email: DEMO_EMAIL, password: DEMO_PASSWORD };
  }

  if (existing && reset) {
    // Deleting the user cascades to categories and tasks.
    await db.run("DELETE FROM users WHERE id = ?", [existing.id]);
  }

  const now = iso();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await withTransaction(async (tx) => {
    const userResult = await tx.run(
      `INSERT INTO users (name, email, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      ["Demo User", DEMO_EMAIL, passwordHash, now, now],
    );
    const userId = userResult.lastID;

    const categoryIds = {};
    for (const category of DEFAULT_CATEGORIES) {
      const result = await tx.run(
        `INSERT INTO categories (user_id, name, color, created_at)
         VALUES (?, ?, ?, ?)`,
        [userId, category.name, category.color, now],
      );
      categoryIds[category.name] = result.lastID;
    }

    for (const task of demoTasks(categoryIds)) {
      await tx.run(
        `INSERT INTO tasks
           (user_id, category_id, title, description, priority, status,
            due_at, completed_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          task.categoryId,
          task.title,
          task.description,
          task.priority,
          task.status,
          task.dueAt,
          task.completedAt,
          now,
          now,
        ],
      );
    }
  });

  return { created: true, email: DEMO_EMAIL, password: DEMO_PASSWORD };
}

// CLI: npm run db:seed [-- --reset]
const isCli = process.argv[1]?.endsWith("seed.js");
if (isCli) {
  const reset = process.argv.includes("--reset");
  try {
    const result = await seedDemoData({ reset });
    if (result.created) {
      console.log("[db] Demo account seeded.");
    } else {
      console.log("[db] Demo account already exists (use --reset to recreate).");
    }
    console.log(`[db] Email:    ${result.email}`);
    console.log(`[db] Password: ${result.password}`);
  } catch (error) {
    console.error("[db] Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await closeDb();
  }
}
