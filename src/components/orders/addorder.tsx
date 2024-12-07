import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { Button, DatePicker, Form, Input, Modal, Spin } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { DraggableData, DraggableEvent } from "react-draggable";
import Draggable from "react-draggable";
import { toast } from "react-toastify";
import SelectJoloochWidget from "../select_jolooch";
import SelectProductWidget from "../select_product";

const AddOrderModal = ({ handleCancel, handleOk, getDataReset, open }: any) => {
  const [registerform] = Form.useForm();
  const { userContent } = useData();
  const [loading, setloading] = useState(false);
  const [userId, setuserId] = useState<any>();
  const order_products = Form.useWatch("order_products", registerform);
  const customer_phone = Form.useWatch("customer_phone", registerform);
  const [totalTulber, settotalTulber] = useState<number>(0);
  const [resetNew, setResetNew] = useState(false);
  const [isToday, setisToday] = useState<boolean>(false);

  const [disabled, setDisabled] = useState(true);
  const [bounds, setBounds] = useState({
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  });
  const draggleRef = useRef<HTMLDivElement>(null);

  const onStart = (_event: DraggableEvent, uiData: DraggableData) => {
    const { clientWidth, clientHeight } = window.document.documentElement;
    const targetRect = draggleRef.current?.getBoundingClientRect();
    if (!targetRect) {
      return;
    }
    setBounds({
      left: -targetRect.left + uiData.x,
      right: clientWidth - (targetRect.right - uiData.x),
      top: -targetRect.top + uiData.y,
      bottom: clientHeight - (targetRect.bottom - uiData.y),
    });
  };

  const duureg = Form.useWatch("duureg", registerform);
  const dateFormat = "YYYY/MM/DD";
  const [phone, setphone] = useState("");
  useEffect(() => {
    if (order_products?.length > 0) {
      const temp = order_products?.reduce((a: number, b: any) => {
        const prod = b?.product ? JSON.parse(b?.product) : {};
        return (
          a + ((prod?.price ?? 0) + (prod?.delivery_price ?? 0)) * (Number(b?.too) ?? 1)
        );
      }, 0);
      settotalTulber(temp);
    }
  }, [order_products]);

  useEffect(() => {
    if (customer_phone && customer_phone.length > 1) {
      console.log(customer_phone);
      if (
        customer_phone &&
        customer_phone[0].length > 8 &&
        (customer_phone as [])
      ) {
        const cust = JSON?.parse(customer_phone[0]);
        todayOrderCheck(cust?.phone);
        setuserId(cust);
        registerform.setFieldsValue({
          duureg: cust?.duureg,
          address: cust?.address,
        });
      } else {
        todayOrderCheck(customer_phone);
        // todayOrderCheck(customer_phone[0]);
      }
    } else {
      setisToday(false);
      setuserId(null);
      registerform.resetFields(["duureg", "name", "address"]);
    }
    return () => {};
  }, [customer_phone]);

  const todayOrderCheck = async (value: string) => {
    if (value?.trim()?.length == 8) {
      console.log("todayOrderCheck", value?.trim());
      setphone(value?.trim());
      axiosInstance
        .post("/orders/checktodaycustomer", {
          phone: value?.trim(),
        })
        .then((response: any) => {
          if (response?.["status"] === 200) {
            setisToday(response?.data?.result);
            console.log(response?.data?.data);
            setuserTodayOrder(response?.data?.data);
            registerform.setFieldsValue({
              duureg: response?.data?.data?.duureg,
              address: response?.data?.data?.address,
            });
          }
        })
        .catch((e: any) => {
          console.log(e);
        });
    }
  };

  const submitHanlde = async (values: any) => {
    if (!loading) {
      setloading(true);
      console.log(values);

      axiosInstance
        .post("/orders/add", {
          body: {
            _id: userId?._id,
            owner: userContent?._id,
            owner_name: userContent?.username,
            customer: userId,
            customer_phone:
              customer_phone &&
              customer_phone.length == 1 &&
              customer_phone[0].length > 10
                ? userId?.phone
                : customer_phone?.trim(),
            duureg: values?.duureg,
            address: values?.address,
            nemelt: values?.nemelt,
            payment_type: values?.payment_type,
            isPaid: values?.is_paid,
            order_product: order_products?.map((items: any) => {
              const prod = items?.product ? JSON.parse(items?.product) : {};
              return {
                product: prod._id,
                product_code: prod.code,
                product_name: prod.name,
                delivery_price: prod.delivery_price,
                sale_price: prod.price,
                too: Number(items.too),
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
            too: order_products?.reduce((a: number, b: any) => a + Number(b?.too), 0),
            jolooch_user: values?.jolooch
              ? JSON.parse(values?.jolooch)?._id
              : null,
            jolooch_username: values?.jolooch
              ? JSON.parse(values?.jolooch)?.username
              : null,
            zone: values?.jolooch ? JSON.parse(values?.jolooch)?.zone : null,
            huleejawahudur: dayjs(values?.hurgelt_date, dateFormat).toDate(),
            huleejawahtsag: values?.hurgelt_tsag,
          },
        })
        .then((response: any) => {
          if (response?.["status"] === 200) {
            reset();
            if (resetNew) {
              setResetNew(false);
              getDataReset();
            } else {
              handleOk();
            }
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

  const [userTodayOrder, setuserTodayOrder] = useState<any>();

  const reset = () => {
    registerform.resetFields();
    settotalTulber(0);
    registerform.setFieldsValue({
      hurgelt_date: dayjs(dateCheck()),
    });
  };

  const dateCheck = () => {
    const nowDate = new Date();
    return new Date(nowDate.setHours(15, 30, 0, 1)) > new Date()
      ? new Date()
      : new Date(nowDate.setDate(nowDate.getDate() + 1));
  };

  useEffect(() => {
    reset();
    return () => {};
  }, []);

  return (
    <Modal
      width={520}
      key={"register"}
      confirmLoading={loading}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        reset();
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
      modalRender={(modal) => (
        <Draggable
          disabled={disabled}
          bounds={bounds}
          nodeRef={draggleRef}
          onStart={(event, uiData) => onStart(event, uiData)}
        >
          <div ref={draggleRef}>{modal}</div>
        </Draggable>
      )}
      title={
        <div
          style={{
            width: "100%",
            cursor: "move",
          }}
          onMouseOver={() => {
            if (disabled) {
              setDisabled(false);
            }
          }}
          onMouseOut={() => {
            setDisabled(true);
          }}
          onFocus={() => {}}
          onBlur={() => {}}
          // end
        >
          Захиалга бүртгэх
        </div>
      }
    >
      <Spin spinning={loading}>
        <Form
          // layout={"horizontal"}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ fontSize: 12 }}
          form={registerform}
          onFinish={submitHanlde}
        >
          <div className="flex flex-col w-full">
            <div className="flex-col justify-start w-full p-4 border">
              <Form.Item
                name={"customer_phone"}
                label="Утас"
                className="mb-1"
                wrapperCol={{ span: 24 }}
                rules={[
                  { required: true, message: "" },
                  { len: 8, message: "Утасны дугаар заавал 8 оронтой байна!" },
                ]}
              >
                <Input
                  type="number"
                  autoFocus={true}
                  maxLength={8}
                  minLength={8}
                />
              </Form.Item>

              {/* <SelectCustomerWidget
                name={"customer_phone"}
                label="Утас"
                className="mb-1"
                wrapperCol={{ span: 24 }}
                rules={[{ required: true, message: "" }]}
              /> */}
              {isToday ? (
                <Link
                  className="text-red-600 w-full flex justify-end mb-1 flex-col items-end"
                  href={`/customers/${phone}`}
                  target="_blank"
                >
                  <p>24цагын захиалга харах.</p>
                  {userTodayOrder?.order_product?.map(
                    (itemd: any, index: number) => {
                      return (
                        <div key={index}>
                          {itemd?.product_name} ({itemd?.too})
                        </div>
                      );
                    }
                  )}
                </Link>
              ) : (
                <></>
              )}

              <div className="flex flex-col w-full mb-1 p-1">
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
                            className="flex item-center mt-2 gap-1 w-full justify-center"
                          >
                            <SelectProductWidget
                              wrapperCol={{ span: 24 }}
                              className="m-0 w-full"
                              {...restField}
                              ismer={"true"}
                              name={[name, "product"]}
                              // rules={[{ required: true, message: "" }]}
                            />
                            <Form.Item
                              {...restField}
                              name={[name, "too"]}
                              className="m-0"
                              // rules={[{ required: true, message: "" }]}
                            >
                              <Input
                                type="number"
                                defaultValue={1}
                                placeholder="Ширхэг"
                                min={0}
                              />
                            </Form.Item>
                            <Image
                              src={"/icons/circle-minus-solid.svg"}
                              alt="remove"
                              width={15}
                              height={15}
                              className="cursor-pointer mt-2 h-[20px] w-[20px] mr-1 flex items-center justify-center text-[#030D45]"
                              onClick={() => remove(ind)}
                            />
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

              <SelectJoloochWidget
                name={"jolooch"}
                className="mb-3"
                label="Хүргэлт жолооч"
              />

              <Form.Item
                className="mb-3"
                name={"hurgelt_date"}
                label="Хүргэлт хийх өдөр"
              >
                <DatePicker format={dateFormat} />
              </Form.Item>
              <Form.Item label=" Нийт төлбөр" className="mb-0">
                <span className="text-[20px] font-bold">
                  {totalTulber?.toLocaleString()}₮
                </span>
              </Form.Item>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              loading={loading}
              className="w-1/2 px-1 max-w-[150px] hover:text-green-900 hover:bg-white bg-blue-500  text-white"
              onClick={() => {
                setResetNew(true);
                registerform.submit();
              }}
              htmlType="submit"
            >
              Хадгалаад & Шинэ
            </Button>

            <Button
              className="w-1/2 px-1 max-w-[150px]"
              onClick={() => {
                reset();
                handleCancel();
              }}
            >
              Болих
            </Button>
            <Button
              loading={loading}
              className="w-1/2 px-1 max-w-[150px] hover:text-green-900 hover:bg-white bg-green-900  text-white"
              onClick={registerform.submit}
              htmlType="submit"
            >
              Хадгалах
            </Button>
          </div>
        </Form>
      </Spin>
    </Modal>
  );
};
export default AddOrderModal;
