import { useData } from "@/helper/context";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Spin,
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import SelectProductWidget from "../select_product";

import axiosInstance from "@/lib/axios";
import { IOrder } from "@/types/next";
import dayjs from "dayjs";
import Image from "next/image";
import { toast } from "react-toastify";
import SelectJoloochWidget from "../select_jolooch";
let index = 0;

const EditOrderModal = ({
  handleCancel,
  handleOk,
  open,
  data,
}: {
  handleCancel: Function;
  handleOk: Function;
  open: boolean;
  data: IOrder;
}) => {
  const [registerform] = Form.useForm();
  const [isDone, setIsdone] = useState<boolean>(false);
  const { userContent } = useData();
  const [loading, setloading] = useState(false);
  const [tailbar, settailbar] = useState("");

  const [userId, setuserId] = useState<any>();
  const order_products = Form.useWatch("order_products", registerform);
  const [totalTulber, settotalTulber] = useState<number>(0);
  const duureg = Form.useWatch("duureg", registerform);
  const dateFormat = "YYYY/MM/DD";

  const jolooch = Form.useWatch("jolooch", registerform);

  useEffect(() => {
    if (
      data &&
      !data?.joloochDate &&
      !data?.jolooch_username &&
      !data?.jolooch &&
      jolooch &&
      jolooch != "null" &&
      jolooch != undefined
    ) {
      console.log("jolooch====", jolooch);
      const datem = new Date();
      setJoloochDate(datem);
      registerform.setFieldsValue({
        joloochDate: dayjs(datem).format("MM/DD HH:mm:ss"),
      });
    }
  }, [jolooch, data]);

  const [joloochDate, setJoloochDate] = useState<Date | undefined>();

  const [joloochList, setZoneJolooch] = useState<any[]>([]);

  useEffect(() => {
    const templist = sessionStorage.getItem("deliveryzoneJoloochList");
    if (templist) {
      setZoneJolooch(JSON.parse(templist));
    }
  }, []);

  useEffect(() => {
    if (order_products?.length > 0) {
      const temp = order_products?.reduce((a: number, b: any) => {
        const prod = b?.product ? JSON.parse(b?.product) : {};
        return (
          a + ((prod?.price ?? 0) + (prod?.delivery_price ?? 0)) * (b?.too ?? 1)
        );
      }, 0);
      settotalTulber(temp);
    }
  }, [order_products]);

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      console.log(values);

      const joloodhtemp = values?.jolooch?.value
        ? JSON.parse(values?.jolooch?.value)
        : values?.jolooch
        ? JSON.parse(values?.jolooch)
        : null;
      axiosInstance
        .post("/orders/update", {
          body: {
            order_id: data?._id,
            _id: userId?._id,
            order_number: data?.order_number,
            customer: userId,
            customer_phone:
              userId && userId.length == 1 && userId[0].length > 10
                ? userId?.phone
                : userId,
            duureg: values?.duureg,
            name: values?.name,
            address: values?.address,
            joloochDate: joloochDate,
            other: values?.other,
            payment_type: values?.payment_type,
            isPaid: values?.is_paid,
            nemelt: values?.nemelt,
            order_product: order_products?.map((items: any) => {
              const prod = items?.product ? JSON.parse(items?.product) : {};
              return {
                product: prod._id,
                product_code: prod.code,
                product_name: prod.name,
                delivery_price: prod.delivery_price,
                sale_price: prod.price,
                too: items.too,
              };
            }),
            total_price: totalTulber,
            total_sale_price: order_products?.reduce((a: number, b: any) => {
              const prod = b?.product ? JSON.parse(b?.product) : {};
              return a + prod?.price * b?.too;
            }, 0),
            delivery_total_price: order_products?.reduce(
              (a: number, b: any) => {
                const prod = b?.product ? JSON.parse(b?.product) : {};
                return a + prod?.delivery_price * b?.too;
              },
              0
            ),
            too: order_products?.reduce((a: number, b: any) => a + b?.too, 0),
            jolooch_user: joloodhtemp?._id,
            jolooch_username: joloodhtemp?.username,
            zone: joloodhtemp?.zone,
            huleejawahudur: dayjs(values?.hurgelt_date, dateFormat).toDate(),
            huleejawahtsag: values?.hurgelt_tsag,
          },
        })
        .then((response: any) => {
          if (response?.["status"] === 200) {
            registerform.resetFields();
            setJoloochDate(undefined);
            handleOk();
          } else {
            toast.warning(response?.data?.message);
          }
        })
        .catch((e: any) => {
          console.log(e);
          const toastId = Math.floor(new Date().getTime() / 5000);
          toast.error(`${e?.toString()}`, { toastId });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  const restoreOrder = () => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/orders/orderrestore", {
          id: data?._id,
        })
        .then((response: any) => {
          if (response?.["status"] === 200) {
            registerform.resetFields();
            setJoloochDate(undefined);
            handleOk();
          } else {
            toast.warning(response?.data?.message);
          }
        })
        .catch((e: any) => {
          console.log(e);
          const toastId = Math.floor(new Date().getTime() / 5000);
          toast.error(`${e?.toString()}`, { toastId });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };
  const cancelOrder = () => {
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/orders/ordercancel", {
          id: data?._id,
          tailbar: tailbar,
        })
        .then((response: any) => {
          if (response?.["status"] === 200) {
            registerform.resetFields();
            setJoloochDate(undefined);
            handleOk();
          } else {
            toast.warning(response?.data?.message);
          }
        })
        .catch((e: any) => {
          console.log(e);
          const toastId = Math.floor(new Date().getTime() / 5000);
          toast.error(`${e?.toString()}`, { toastId });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  useEffect(() => {
    if (data) {
      // console.log(data);
      if (data?.isCompleted != null) setIsdone(data?.isCompleted);
      const cust = data?.customer;
      setuserId(cust);
      registerform.setFieldsValue({
        customer_phone: JSON.stringify(cust),
        phone2: cust?.phone,
        address: data?.address,
        hurgelt_date: dayjs(data?.huleejawahudur),
        hurgelt_tsag: data?.huleejawahtsag,
        nemelt: data?.nemelt,
        is_paid: data?.isPaid,
        joloochDate: data?.joloochDate
          ? dayjs(data?.joloochDate).format("YYYY/MM/DD HH:mm:ss")
          : null,
        payment_type: data?.payment_type,
        status: data?.status,
        jolooch: joloochList.findLast((a) =>
          a?.value?.includes(data?.jolooch?._id)
        )
          ? joloochList.findLast((a) => a?.value?.includes(data?.jolooch?._id))
          : JSON.stringify(data?.jolooch),
        duureg: data?.duureg,
        order_products: data?.order_product
          ? data?.order_product.map((item: any) => {
              return {
                too: item?.too,
                product: JSON.stringify(
                  {
                    _id: item?.product?._id,
                    code: item?.product?.code,
                    name: item?.product?.name,
                    price: item?.product?.price,
                    delivery_price: item?.product?.delivery_price,
                  }
                  ),
              };
            })
          : [],
      });
    }
    return () => {};
  }, [data]);

  return (
    <Modal
      width={550}
      key={"register"}
      confirmLoading={loading}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        registerform.resetFields();
        setloading(false);
        handleCancel();
        setJoloochDate(undefined);
      }}
      centered
      open={open}
      footer={[]}
    >
      <div className="flex justify-between">
        {[0, 1, 2].includes(userContent?.level) &&
        data?.isCompleted &&
        data?.status == "Цуцлагдсан" ? (
          <Button
            className="w-[70px] px-1 max-w-[70px]  hover:text-green-600 hover:bg-white bg-green-800  text-white"
            onClick={() => {
              userContent;
              restoreOrder();
            }}
          >
            Сэргээх
          </Button>
        ) : (
          <></>
        )}
        <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
          Захиалга засах №{data?.order_number}
        </p>
        <div></div>
      </div>
      <Spin spinning={loading}>
        <Form
          disabled={isDone}
          // layout={"horizontal"}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          form={registerform}
          onFinish={submitHanlde}
        >
          <div className="flex flex-col w-full">
            <div className="flex-col justify-start w-full p-4 border">
              <Form.Item className="mb-3" name={"phone2"} label="Утас">
                <Input disabled />
              </Form.Item>
              <div className="flex flex-col w-full mb-5 border p-5">
                <Form.List name="order_products">
                  {(fields, { add, remove }) => (
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center">
                        <p>Барааны жагсаалт</p>
                        <Button
                          onClick={() => {
                            add({ too: 1 });
                          }}
                          className="h-[31px] w-[31px] text-[20px] py-0 leading-none  flex items-center justify-center text-[#030D45]"
                        >
                          +
                        </Button>
                      </div>
                      {fields.map(
                        ({ key, name, ...restField }, ind: number) => (
                          <div
                            key={key}
                            className="flex item-center mt-2 gap-2"
                          >
                            <SelectProductWidget
                              wrapperCol={{ span: 24 }}
                              className="m-0 w-full"
                              {...restField}
                              ismer={"true"}
                              name={[name, "product"]}
                              rules={[{ required: true, message: "" }]}
                            />
                            <Form.Item
                              {...restField}
                              name={[name, "too"]}
                              className="m-0"
                              rules={[{ required: true, message: "" }]}
                            >
                              <Input
                                type="number"
                                placeholder="Ширхэг"
                                min={0}
                              />
                            </Form.Item>
                            {data?.isCompleted ? (
                              <></>
                            ) : (
                              <Image
                                src={"/icons/circle-minus-solid.svg"}
                                alt="remove"
                                width={15}
                                height={15}
                                className="h-[31px] w-[37px] text-[20px] flex items-center justify-center text-[#030D45]"
                                onClick={() => remove(ind)}
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </Form.List>
              </div>

              <Form.Item
                className="mb-3"
                label="Хаягын дэлгэрэнгүй"
                name={"address"}
              >
                <Input.TextArea
                  placeholder="Шаргал байшин, Зүүн талын орцоор орно,2-р орц, Орцны код 1234"
                  rows={3}
                />
              </Form.Item>
              <Form.Item
                className="mb-3"
                label="Дүүрэг"
                name={"duureg"}
                // rules={[{ required: true, message: "" }]}
              >
                <Select
                  style={{ maxWidth: 280 }}
                  placeholder="Дүүрэг сонгох"
                  options={[
                    { label: "Баянзүрх", value: "Баянзүрх" },
                    { label: "Сүхбаатар", value: "Сүхбаатар" },
                    { label: "Чингэлтэй", value: "Чингэлтэй" },
                    { label: "Хан-Уул", value: "Хан-Уул" },
                    { label: "Сонгинохайрхан", value: "Сонгинохайрхан" },
                    { label: "Баянгол", value: "Баянгол" },
                    { label: "Налайх", value: "Налайх" },
                    { label: "Багахангай", value: "Багахангай" },
                    { label: "Багануур", value: "Багануур" },
                    { label: "Орон нутаг", value: "Орон нутаг" },
                  ]}
                />
              </Form.Item>
              <SelectJoloochWidget
                duureg={duureg}
                className="mb-1"
                name={"jolooch"}
                label="Хүргэлт жолооч"
              />
              <Form.Item label="Шилжүүлсэн огноо" name={"joloochDate"}>
                <Input readOnly />
              </Form.Item>

              <Form.Item
                className="mb-3"
                name={"hurgelt_date"}
                label="Хүргэлт хийх өдөр"
              >
                <DatePicker format={dateFormat} />
              </Form.Item>
              <Form.Item
                className="mb-3"
                name={"hurgelt_tsag"}
                label="Хүргэлт хийх цаг"
              >
                <Input className="w-[150px]" />
              </Form.Item>

              {data?.from_user ? (
                <Form.Item label="Хэнээс:" className="mb-3">
                  <div className="">{data?.from_username}</div>
                  <div className="">
                    {dayjs(data?.from_date).format("YYYY/MM/DD HH:mm")}
                  </div>
                </Form.Item>
              ) : (
                <div className="mb-0"></div>
              )}

              <Form.Item
                name={"nemelt"}
                className="mb-3"
                label="Хүргэлтийн нэмэлт"
              >
                <Input.TextArea rows={3} placeholder="" />
              </Form.Item>
              <Form.Item
                name={"payment_type"}
                className="mb-2"
                label="Төлбөрийн хэлбэр"
              >
                <Select
                  options={[
                    { label: "", value: "" },
                    { label: "Дансаар", value: "Дансаар" },
                    { label: "Бэлэн", value: "Бэлэн" },
                  ]}
                />
              </Form.Item>
              <Form.Item
                name={"is_paid"}
                label="Төлбөр хийгдсэн"
                className=" m-0"
              >
                <Switch className="bg-gray-300" />
              </Form.Item>
              <Form.Item name={"status"} label="Төлөв" className="m-0">
                <Select
                  className="bg-blue-200 rounded-lg"
                  options={[
                    { label: "Ноорог", value: "Ноорог" },
                    { label: "Бүртгэсэн", value: "Бүртгэсэн" },
                    { label: "Цуцлагдсан", value: "Цуцлагдсан" },
                    { value: "Хүргэлтэнд", label: "Хүргэлтэнд" },
                    { value: "Буцаасан", label: "Буцаасан" },
                    { label: "Хүргэгдсэн", value: "Хүргэгдсэн" },
                  ]}
                />
              </Form.Item>
              <Form.Item label=" Нийт төлбөр" className="mb-0">
                <span className="text-[20px] font-bold">
                  {totalTulber?.toLocaleString()}₮
                </span>
              </Form.Item>
            </div>
            <div>
              {([0, 1, 2].includes(userContent?.level) && !data?.isCompleted) ||
              ([0, 1].includes(userContent?.level) &&
                data?.isCompleted &&
                data?.status == "Хүргэгдсэн") ? (
                <div className="flex gap-2">
                  <Button
                    disabled={
                      !(
                        ([0, 1].includes(userContent?.level) &&
                          data?.isCompleted &&
                          data?.status == "Хүргэгдсэн") ||
                        [0, 1, 2].includes(userContent?.level)
                      )
                    }
                    className="w-[150px] px-1 max-w-[150px]  hover:text-red-900 hover:bg-white bg-red-900  text-white"
                    onClick={() => {
                      cancelOrder();
                    }}
                  >
                    Цуцлах
                  </Button>
                  <div className="w-[200px] border flex items-center px-5">
                    <input
                      className="w-full focus:outline-none  outline-none"
                      type="text"
                      value={tailbar}
                      placeholder="Цуцлах шалгаанаа бичнэ үү."
                      onChange={(event) => {
                        settailbar(event.target.value ?? "");
                      }}
                    />
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>

          <div className="flex justify-between w-full">
            <div className="flex justify-end gap-2">
              <Button
                className=" px-1 w-[150px] max-w-[150px]"
                onClick={() => {
                  registerform.resetFields();
                  setJoloochDate(undefined);
                  handleCancel();
                }}
              >
                Болих
              </Button>
              <Button
                loading={loading}
                className=" px-1 w-[150px] max-w-[150px] hover:text-green-900 hover:bg-white bg-green-900  text-white"
                onClick={registerform.submit}
                htmlType="submit"
              >
                Хадгалах
              </Button>
            </div>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};
export default EditOrderModal;
