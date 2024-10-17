import dbConnect from "@/lib/dbConnect";
import { sendNotificationfirebaseLevel } from "@/lib/firebase_func";
import OrderModel from "@/models/orders.model";
import ProductModel from "@/models/products.model";
import UserBalancesModel from "@/models/usersbalance.model";
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
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  try {
    let {
      id,
      type,
      paymentType,
      tailbar,
      payment_date,
      newList,
      oldList,
      order_product,
    } = req.body;
    console.log("orderupdate:::::", req.body);
    await dbConnect();
    if (id) {
      const oldDataOrder = await OrderModel.findById(id, {
        select: { isCompleted: 1 },
      });
      if (oldDataOrder?.isCompleted && oldDataOrder?.isCompleted == true) {
        res.status(200).json({ result: true, message: "Амжилттай хадгалсан." });
        return;
      }
      let body: any = {
        isPaid: payment_date,
        payment_type: type ? paymentType : null,
        completedDate: new Date(),
        isCompleted: true,
        completeTailbar: tailbar,
        status: type ? "Хүргэгдсэн" : "Цуцлагдсан",
      };
      if (payment_date && payment_date == true) {
        body.payment_date = new Date();
      }
      const order = await OrderModel.findByIdAndUpdate(id, body, {
        new: true,
      }).populate([
        {
          path: "order_product",
          populate: {
            path: "product",
            model: ProductModel,
          },
        },
      ]);
      if (
        type != null &&
        type == true &&
        order.status == "Хүргэгдсэн" &&
        order.isToolson != true
      ) {
        // console.log("userbalance hasna:::", type);
        if (order && order?.order_product) {
          for (let index = 0; index < order?.order_product.length; index++) {
            try {
              const element = order?.order_product[index];
              const newdd = await UserBalancesModel.findOneAndUpdate(
                {
                  owner: order?.jolooch,
                  username: order?.jolooch_username,
                  product: element.product,
                  product_code: element.product_code,
                },
                {
                  owner: order?.jolooch,
                  username: order?.jolooch_username,
                  product: element.product,
                  product_code: element.product_code,
                  product_name: element.product_name,
                  $inc: {
                    hurgegdsen: element?.too ?? 0,
                  },
                },
                { upsert: true, new: true }
              );
            } catch (e) {
              console.log(
                "[ERROR][orderupdate] UserBalancesModel.findOneAndUpdate :::: ",
                e
              );
            }
          }
          await OrderModel.findByIdAndUpdate(id, { isToolson: true });
        }
      } else {
        sendNotificationfirebaseLevel({
          level: [0, 1],
          title: `${order.jolooch_username} -жолооч  (${order?.order_number})дугаартай захиалгыг цуцлав.`,
          body: `Захиалагчын утас: ${
            order?.customer_phone
          }, Бараа: ${order.order_product
            .map((item: any) => {
              return `(${item.product_name}-${item.too}ш)`;
            })
            .join(", ")} `,
          isNotif: "isNotif",
          datafile: {},
        });
      }
      res.status(200).json({ result: true, message: "Амжилттай хадгалсан." });
    }
    res.status(200).json({ result: false, message: "id not found" });
  } catch (error) {
    res.status(400).json({ result: false, message: error });
  }
}
