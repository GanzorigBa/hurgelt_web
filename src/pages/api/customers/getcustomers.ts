import dbConnect, { rgx } from "@/lib/dbConnect";
import CustomerModel from "@/models/customers.model";
import type { NextApiRequest, NextApiResponse } from "next";
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

  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    const { offset, limit, sort, search }: any = req.body;
    const searchRgx = rgx(search);
    const where = {
      $or: [
        { phone: { $regex: searchRgx, $options: "i" } },
        { address: { $regex: searchRgx, $options: "i" } },
      ],
    };
    await dbConnect();
    const totalcnt = (await CustomerModel.countDocuments(where)) ?? 0;
    const data = await CustomerModel.find(where)
      .limit(limit ?? 30)
      .skip(offset)
      .sort(sort ?? { created_at: -1 });
    res.status(200).json({ result: true, message: "Success", data, totalcnt });
  } catch (e) {
    console.log("getUsers::ERROR:", e);
    res.status(400).json({ result: false, message: e });
  }
}
