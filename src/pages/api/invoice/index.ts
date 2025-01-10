import dbConnect, { rgx, rgxStart } from "@/lib/dbConnect";
import InvoiceModel from "@/models/invoices.model";
import UserModel from "@/models/users.model";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";

interface SearchParams {
  offset?: number;
  limit?: number;
  sort?: string;
  search?: string;
  start?: string;
  end?: string;
  codeSearch?: string;
  type?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await NextCors(req, res, {
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    origin: "*",
    headers: ["Authorization", "Content-Type"], // Fixed lowercase 'headers'
    optionsSuccessStatus: 200,
  });

  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  try {
    const {
      offset,
      limit,
      sort,
      search,
      start,
      end,
      codeSearch,
      type
    }: SearchParams = req.body;

    const searchRgx = rgx(search || '');
    const codeSearchRgx = rgxStart(codeSearch || '');

    // Build base query
    const baseQuery: any = {};

    // Add search conditions if search parameter exists
    if (search) {
      baseQuery.$or = [
        { invoice_number: { $regex: searchRgx, $options: "i" } },
        { from_username: { $regex: searchRgx, $options: "i" } },
        { to_username: { $regex: searchRgx, $options: "i" } },
      ];
    }

    // Add code search conditions if codeSearch parameter exists
    if (codeSearch) {
      baseQuery['invoice_product'] = {
        $elemMatch: {
          $or: [
            { product_name: { $regex: codeSearchRgx, $options: "i" } },
            { product_code: { $regex: codeSearchRgx, $options: "i" } },
          ]
        }
      };
    }

    // Add date range if both start and end exist
    if (start && end) {
      baseQuery.created_at = {
        $gte: dayjs(start).startOf('day').toDate(),
        $lt: dayjs(end).endOf('day').toDate(),
      };
    }

    // Add type filter if exists
    if (type && type.length > 0) {
      baseQuery.type = type;
    }

    await dbConnect();
    const totalcnt = await InvoiceModel.countDocuments(baseQuery);
    const data = await InvoiceModel.find(baseQuery)
      .populate([
        {
          path: "owner",
          model: UserModel,
        },
        {
          path: "from_user",
          model: UserModel,
        },
        {
          path: "to_user",
          model: UserModel,
        },
      ])
      .limit(limit ?? 30)
      .skip(offset ?? 0)
      .sort(sort ?? { created_at: -1 });
    res.status(200).json({ result: true, message: "Success", data, totalcnt });
  } catch (e) {
    console.log("getinvoice::ERROR:", e);
    res.status(400).json({ message: e });
  }
}
