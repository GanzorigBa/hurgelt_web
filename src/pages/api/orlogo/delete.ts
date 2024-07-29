import dbConnect from "@/lib/dbConnect";
import OrlogoModel from "@/models/orlogo.model";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    origin: "*",
    Headers: ["Authorization", "Content-Type"],
    optionsSuccessStatus: 200,
  });
  try {
    const { id } = req.query;
    await dbConnect();
    await OrlogoModel.deleteOne({ _id: id ?? req.body?.id });
    res.status(200).json({ result: true, message: "Success" });
  } catch (error) {
    res.status(400).json({ message: error });
  }
}
