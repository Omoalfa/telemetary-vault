import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export class AuthController {
  static async signup(req: Request, res: Response) {
    try {
      const { email, name } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      let user = await userRepository.findOne({ where: { email } });

      if (user) {
        return res.status(200).json({
          message: "User already exists",
          apiKey: user.api_key,
          user: {
            id: user.id,
            email: user.email,
            name: user.name
          }
        });
      }

      // Generate a simple API key (in production, use something more secure/hashed)
      const apiKey = crypto.randomBytes(32).toString("hex");

      user = new User();
      user.email = email;
      user.name = name;
      user.api_key = apiKey;

      await userRepository.save(user);

      return res.status(201).json({
        message: "User created successfully",
        apiKey: user.api_key,
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
