import dbConnect from "@/lib/dbConnect";
import InvoiceModel from "@/models/invoices.model";
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
    const { id } = req.body;
    console.log(req.body);
    if (!id) {
      return res
        .status(201)
        .json({ result: false, message: "id байхгүй байна!" });
    }
    await dbConnect();
    await InvoiceModel.findByIdAndUpdate(id, {
      isCompleted: true,
    });
    return res.status(200).json({ result: true, message: "Success" });
  } catch (error) {
    return res.status(400).json({ message: error });
  }
}
