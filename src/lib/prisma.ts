import { PrismaClient } from "../generated/client";

// Global type helper
const globalForPrisma = global as unknown as { prisma: any };

// Check if we should route database operations to the remote PHP database server
const useRemote = process.env.NODE_ENV === "production" || process.env.USE_REMOTE_DB === "true";

class MockPrismaModel {
  constructor(private modelName: string) {}

  private async fetchRemote(action: string, args: any = {}) {
    const remoteUrl = "https://database.primpla.com/api.php";
    const dbToken = process.env.DB_ACCESS_TOKEN || "primpla-sera-2026";
    const isReadAction = ["findMany", "findUnique", "findFirst", "count", "aggregate", "groupBy"].includes(action);
    try {
      const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Database-Token": dbToken,
        },
        body: JSON.stringify({
          token: dbToken,
          model: this.modelName,
          action,
          args,
        }),
      };

      if (isReadAction) {
        (fetchOptions as any).next = { revalidate: 5 }; // 5-sec revalidation to reduce server CPU load
      } else {
        fetchOptions.cache = "no-store";
      }

      const response = await fetch(remoteUrl, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data && data.error) {
        throw new Error(data.error);
      }
      return data;
    } catch (e: any) {
      console.error(`Remote database query failure [${this.modelName}.${action}]:`, e);
      throw e;
    }
  }

  async findMany(args?: any) {
    return this.fetchRemote("findMany", args);
  }

  async findUnique(args?: any) {
    return this.fetchRemote("findUnique", args);
  }

  async findFirst(args?: any) {
    return this.fetchRemote("findFirst", args);
  }

  async count(args?: any) {
    return this.fetchRemote("count", args);
  }

  async create(args?: any) {
    return this.fetchRemote("create", args);
  }

  async update(args?: any) {
    return this.fetchRemote("update", args);
  }

  async updateMany(args?: any) {
    return this.fetchRemote("updateMany", args);
  }

  async delete(args?: any) {
    return this.fetchRemote("delete", args);
  }

  async deleteMany(args?: any) {
    return this.fetchRemote("deleteMany", args);
  }

  async groupBy(args?: any) {
    return this.fetchRemote("groupBy", args);
  }

  async aggregate(args?: any) {
    return this.fetchRemote("aggregate", args);
  }

  async upsert(args?: any) {
    return this.fetchRemote("upsert", args);
  }
}

class MockPrismaClient {
  article = new MockPrismaModel("Article");
  category = new MockPrismaModel("Category");
  tag = new MockPrismaModel("Tag");
  user = new MockPrismaModel("User");
  viewEvent = new MockPrismaModel("ViewEvent");
  reviewComment = new MockPrismaModel("ReviewComment");

  // Raw queries (ignored or mock success)
  async $executeRawUnsafe(sql: string, ...values: any[]) {
    return 1;
  }

  // Transactions (evaluated sequentially)
  async $transaction(promises: any[]) {
    const results = [];
    for (const p of promises) {
      results.push(await p);
    }
    return results;
  }
}

// Export active client instance
export const prisma = globalForPrisma.prisma || (useRemote ? new MockPrismaClient() : new PrismaClient({ log: ["query"] }));

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
