import { Request, Response, Router } from "express";
import { UserModel } from "../models/UserModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", async (req: Request, res: Response): Promise<any> => {
  const { email, password, name } = req.body;

  // Walidacja e-maila za pomocą regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Nieprawidłowy format e-maila", status:"error" });
  }

  // Walidacja hasła za pomocą regex
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "Hasło musi zawierać przynajmniej 8 znaków, dużą literę, cyfrę i znak specjalny",
      status:"error"
    });
  }

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email już zarejestrowany", status:"error" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      email,
      password: hashedPassword,
      name,
    });

    await newUser.save();

    res.json({ message: "Użytkownik zarejestrowany pomyślnie", status:"success" });
  } catch (error) {
    res.status(500).json({
      message: "Błąd serwera",
      status:"error",
      error,
    });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  try {
    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Użytkownik nie istnieje",status:"error" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Nieprawidłowe hasło",status:"error" });

    const token = jwt.sign(
      { _id: user._id, email: user.email, name:user.name },
      config.jwtSecret as string,
      { expiresIn: "1h" }
    );

    res.json({ message: "Pomyślnie zalogowano", token, status:"success" });
  } catch (error) {
    res.status(500).json({ message: "Błąd serwera", status:"error" });
  }
});

router.get("/protected", authMiddleware, (req: Request, res: Response): any => {
    return res.json({message:"test protected", status:"success"})
});

export default router;
