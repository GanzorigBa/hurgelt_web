import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebaseLevel } from "@/lib/firebase_func";
import OrderModel from "@/models/orders.model";
import ProductModel from "@/models/products.model";
import UserBalancesModel from "@/models/usersbalance.model";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await NextCors(req, res, {
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
      origin: "*",
      Headers: ["Authorization", "Content-Type"],
      optionsSuccessStatus: 200,
    });
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Only POST requests allowed" });
    }
    const { id, type, paymentType, tailbar, payment_date } = req.body;
    if (!id) {
      return res.status(400).json({ result: false, message: "ID is required" });
    }
    await dbConnect();
    const oldDataOrder = await OrderModel.findById(id, {
      isCompleted: 1,
    }).session(session);
    if (oldDataOrder?.isCompleted) {
      await session.abortTransaction();
      return res
        .status(200)
        .json({ result: true, message: "Амжилттай хадгалсан." });
    }
    const updateBody = {
      isPaid: payment_date,
      payment_type: type ? paymentType : null,
      completedDate: new Date(),
      isCompleted: true,
      completeTailbar: tailbar,
      status: type ? "Хүргэгдсэн" : "Цуцлагдсан",
      ...(payment_date && { payment_date: new Date() }),
    };
    const order = await OrderModel.findByIdAndUpdate(id, updateBody, {
      new: true,
      session,
    }).populate([
      {
        path: "order_product",
        populate: {
          path: "product",
          model: ProductModel,
        },
      },
    ]);
    if (type && order.status === "Хүргэгдсэн" && !order.isToolson) {
      await updateDriverBalance(order, session);
      await OrderModel.findByIdAndUpdate(id, { isToolson: true }, { session });
    } else {
      await sendOrderCancelNotification(order);
    }
    await session.commitTransaction();
    return res
      .status(200)
      .json({ result: true, message: "Амжилттай хадгалсан." });
  } catch (error) {
    await session.abortTransaction();
    console.error("[ERROR][orderupdate]:", error);
    return res.status(400).json({
      result: false,
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  } finally {
    session.endSession();
  }
}
async function updateDriverBalance(
  order: any,
  session: mongoose.ClientSession
) {
  for (const element of order?.order_product) {
    try {
      await UserBalancesModel.findOneAndUpdate(
        {
          owner: order?.jolooch,
          product: element.product,
        },
        {
          owner: order?.jolooch,
          username: order?.jolooch_username,
          product: element.product,
          product_code: element.product_code,
          product_name: element.product_name,
          $inc: { hurgegdsen: element?.too ?? 0 },
        },
        { upsert: true, new: true, session }
      );
    } catch (error) {
      console.error("[ERROR][updateDriverBalance]:", error);
      throw error;
    }
  }
}
async function sendOrderCancelNotification(order: any) {
  const productList = order.order_product
    .map((item: any) => `(${item.product_name}-${item.too}ш)`)
    .join(", ");
  await sendNotificationfirebaseLevel({
    level: [0, 1],
    title: `${order.jolooch_username} -жолооч  (${order?.order_number})дугаартай захиалгыг цуцлав.`,
    body: `Захиалагчын утас: ${order?.customer_phone}, Бараа: ${productList}`,
    isNotif: "isNotif",
    datafile: {},
  });
}
