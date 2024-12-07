import serverPath from "@/helper/path";
import { serializeCookie } from "@/lib";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/users.model";
import bcrypt from "bcrypt";
import ffmpeg from "fluent-ffmpeg";
import { Formidable } from "formidable";
import fs from "fs";
import convert from "heic-convert";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { NextApiRequest, NextApiResponse } from "next";
import NextCors from "nextjs-cors";
import path from "path";
import sharp from "sharp";
import { promisify } from "util";

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
//set bodyparser
export const config = {
  api: {
    bodyParser: false,
  },
};
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
  const dirname = serverPath("/public/uploads/");
  let returningFiles: any[] = [];

  await new Promise((resolve, reject) => {
    try {


      const form = new Formidable();
      ffmpeg.setFfprobePath(ffprobePath);
      ffmpeg.setFfmpegPath(ffmpegPath);
      let newImagePath: string;

      form.parse(req, async (err, fields: any, files: any) => {
        if (err) reject({ err });
        if (files && files != undefined && files.file && files.file.length > 0) {
          for (let index = 0; index < files.file.length; index++) {
            const file = files.file[index];
            if (!file?.mimetype?.includes("image")) {
              return;
            }
            var filesizes = file.size;
            const extdd = file?.originalFilename?.slice(
              file?.originalFilename?.lastIndexOf(".") + 1,
              file?.originalFilename?.length
            );
            try {
              if (extdd === "gif") {
                const filname = file.newFilename + ".png";
                await sharp(file.filepath).toFile(
                  path.resolve(dirname, "org", filname)
                );
                await sharp(file.filepath)
                  .rotate()
                  .resize(400, 800, {
                    fit: sharp.fit.inside,
                    withoutEnlargement: true,
                  })
                  .withMetadata()
                  .png()
                  .toFile(path.resolve(dirname, path.basename(filname)));
                try {
                  await fs.unlinkSync(
                    `${dirname}${fields?.oldAvatar[0]?.replace("/uploads/", "")}`
                  );
                  await fs.unlinkSync(
                    `${dirname}${fields?.oldAvatar[0]?.replace(
                      "/uploads/",
                      "org/"
                    )}`
                  );
                  fs.unlinkSync(file.filepath);
                } catch (e) {
                  console.log(e);
                }
                returningFiles.push({
                  fileName: filname,
                  type: "png",
                  size: filesizes,
                  url: `/uploads/${filname}`,
                  org: `/uploads/org/${filname}`,
                });
              } else if (extdd == "heic") {
                try {
                  const filname = file.newFilename + ".jpg";
                  const inputBuffer = await promisify(fs.readFile)(file.filepath);
                  const outputBuffer: ArrayBuffer = await convert({
                    buffer: inputBuffer,
                    format: "JPEG",
                    quality: 1,
                  });
                  await fs.appendFileSync(
                    file.filepath + ".jpg",
                    Buffer.from(outputBuffer)
                  );
                  await sharp(file.filepath).toFile(
                    path.resolve(dirname, "org", filname)
                  );
                  try {
                    await fs.unlinkSync(
                      `${dirname}${fields?.oldAvatar[0]?.replace(
                        "/uploads/",
                        ""
                      )}`
                    );
                    await fs.unlinkSync(
                      `${dirname}${fields?.oldAvatar[0]?.replace(
                        "/uploads/",
                        "org/"
                      )}`
                    );
                    fs.unlinkSync(file.filepath);
                  } catch (e) {
                    console.log(e);
                  }
                  returningFiles.push({
                    fileName: file.filepath + ".jpg",
                    type: "jpg",
                    size: filesizes,
                    url: `/uploads/${file.filepath + ".jpg"}`,
                    org: `/uploads/org/${file.filepath + ".jpg"}`,
                  });
                } catch (eeee) {
                  console.log("heic file error to jpg converted!");
                  const filname = file.newFilename + ".jpg";
                  await sharp(file.filepath).toFile(
                    path.resolve(dirname, "org", filname)
                  );
                  try {
                    fs.unlinkSync(file.filepath);
                  } catch (e) {
                    console.log(e);
                  }
                  returningFiles.push({
                    fileName: file.filepath + ".jpg",
                    type: "jpg",
                    size: filesizes,
                    url: `/uploads/${file.filepath + ".jpg"}`,
                    org: `/uploads/org/${file.filepath + ".jpg"}`,
                  });
                }
              } else {
                const filname = file.newFilename + ".jpg";
                await sharp(file.filepath)
                  .rotate()
                  .withMetadata()
                  .jpeg({ quality: 100 })
                  .toFile(path.resolve(dirname, "org", filname));
                await sharp(file.filepath)
                  .rotate()
                  .resize(400, 800, {
                    fit: sharp.fit.inside,
                    withoutEnlargement: true,
                  })
                  .withMetadata()
                  .toFile(path.resolve(dirname, filname));
                try {
                  console.log("oldAvatar=====", fields?.oldAvatar[0]);
                  await fs.unlinkSync(
                    `${dirname}${fields?.oldAvatar[0]?.replace("/uploads/", "")}`
                  );
                  await fs.unlinkSync(
                    `${dirname}${fields?.oldAvatar[0]?.replace(
                      "/uploads/",
                      "org/"
                    )}`
                  );
                  fs.unlinkSync(file.filepath);
                } catch (e) {
                  console.log(e);
                }
                returningFiles.push({
                  fileName: filname,
                  type: "jpg",
                  size: filesizes,
                  url: `/uploads/${filname}`,
                  org: `/uploads/org/${filname}`,
                });
              }
              newImagePath = returningFiles[0]?.url;
            } catch (e) {
              console.log("ERROR sharp :::::::::::::::::", e);
            }
          }
        }
        console.log(fields);
        const body: any = {
          id: fields?.id[0],
          name: fields?.name[0],
          phone: fields?.phone[0],
        };
        if (newImagePath) body.avatar = newImagePath;
        if (fields?.password) body.password = fields?.password[0];
        if (fields?.email[0] != "null" && fields?.email[0] != "")
          body.email = fields?.email[0];
        else body.email = null;
        if (fields?.phone2[0] != "null" && fields?.phone2[0] != "")
          body.phone2 = fields?.phone2[0];
        else body.phone2 = null;

        await dbConnect();
        if (body.phone) {
          const check = await UserModel.find({
            _id: { $ne: new mongoose.Types.ObjectId(body.id) },
            phone: body.phone,
          });
          if (check.length > 0) {
            console.log(check);
            return res.status(201).json({
              result: false,
              message: "Утасны дугаар давхцаж байна. ",
            });
          }
        }
        if (body.password) {
          const salt = bcrypt.genSaltSync(10);
          body.password = bcrypt.hashSync(body.password, salt);
        } else {
          delete body.password;
        }
        console.log("body===", body);
        let dataUser: any = await UserModel.findByIdAndUpdate(
          { _id: new mongoose.Types.ObjectId(body.id) },
          body,
          { new: true }
        );
        const oko = JSON.parse(JSON.stringify(dataUser));
        delete oko.password;
        delete oko.device_token;
        delete oko.location;
        delete oko.updated_at;
        delete oko.logout_at;
        delete oko.isOperator;
        delete oko.__v;
        let token = jwt.sign(
          {
            user: oko,
          },
          process.env.JWT_SECRET_KEY ??
          "GURU2023TOKENGANZORIGDEV20249FZIGFVRSTAR",
          { expiresIn: "7d" }
        );
        oko.token = token;
        const cookie = serializeCookie("accessToken", token, {
          path: "/",
          maxAge: 24 * 3600,
        });
        return res.status(200).setHeader("Set-Cookie", cookie).json({
          result: true,
          token,
          message: "Амжилттай хуулагдлаа.",
        });
      });
    } catch (error) {
      return res.status(201).json({
        result: false,
        error,
        message: "Амжилтгүй.",
      });
    }
  });
}
