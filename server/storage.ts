import { type User, type InsertUser, type ConnectedRepo } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getConnectedRepos(): Promise<ConnectedRepo[]>;
  addConnectedRepo(repo: ConnectedRepo): Promise<ConnectedRepo>;
  removeConnectedRepo(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private repos: Map<string, ConnectedRepo>;

  constructor() {
    this.users = new Map();
    this.repos = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getConnectedRepos(): Promise<ConnectedRepo[]> {
    return Array.from(this.repos.values());
  }

  async addConnectedRepo(repo: ConnectedRepo): Promise<ConnectedRepo> {
    this.repos.set(repo.id, repo);
    return repo;
  }

  async removeConnectedRepo(id: string): Promise<boolean> {
    return this.repos.delete(id);
  }
}

export const storage = new MemStorage();
