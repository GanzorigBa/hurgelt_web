import { useData } from "@/helper/context";
import { Button, Form, Input, Modal, Select, Spin, Switch } from "antd";
import { useEffect, useState } from "react";
import SelectProductWidget from "../select_product";

import axiosInstance from "@/lib/axios";
import Image from "next/image";
import { toast } from "react-toastify";
import SelectPadaanUserWidget2 from "../select_userpadaan2";

const AddInvoiceModal = ({ handleCancel, handleOk, open, data }: any) => {
  const [registerform] = Form.useForm();
  const { userContent } = useData();
  const [loading, setloading] = useState(false);
  const invoice_products = Form.useWatch("invoice_products", registerform);
  const type = Form.useWatch("type", registerform);
  const submitHanlde = async (values: any) => {
    if (values?.from_user == values?.to_user && type != "Орлого")
      return toast.warning("Ижил хэрэглэгч сонгосон байна!!!");
    if (!loading) {
      setloading(true);
      axiosInstance
        .post("/invoice/add", {
          body: {
            owner: userContent?._id,
            owner_name: userContent?.username,
            type: values?.type,
            invoice_products: invoice_products,
            invoice_product: invoice_products?.map((e: any) => {
              const item = JSON.parse(e?.product);
              return {
                product: item?._id,
                product_code: item?.code,
                product_name: item?.name,
                price: item?.price,
                sale_price: item?.delivery_price + item?.price,
                too: e?.too,
              };
            }),
            total_price: invoice_products?.reduce((a: number, b: any) => {
              const item = JSON.parse(b?.product);
              return (
                a +
                (Number.parseInt(item?.price ?? "0") +
                  Number.parseInt(item?.delivery_price ?? "0")) *
                  Number.parseInt(b?.too ?? "0")
              );
            }, 0),
            too: invoice_products?.reduce((a: number, b: any) => {
              return a + Number.parseInt(b?.too ?? "0");
            }, 0),
            from_user:
              type == "Орлого"
                ? null
                : values?.from_user
                ? JSON.parse(values?.from_user)?._id
                : null,
            from_username:
              type == "Орлого"
                ? null
                : values?.from_user
                ? JSON.parse(values?.from_user)?.username
                : null,
            to_user: values?.to_user ? JSON.parse(values?.to_user)?._id : null,
            to_username: values?.to_user
              ? JSON.parse(values?.to_user)?.username
              : null,
            isPaid: values?.isPaid,
            isCompleted: values?.isCompleted,
          },
        })
        .then((response: any) => {
          if (response?.["status"] === 200) {
            registerform.resetFields();
            registerform.setFieldsValue({
              type: "Зарлага",
              invoice_products: [{}],
            });
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
    registerform.setFieldsValue({
      type: "Зарлага",
      invoice_products: [{ too: 1 }],
    });
    return () => {};
  }, []);

  return (
    <Modal
      width={800}
      key={"register"}
      confirmLoading={loading}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        registerform.resetFields();
        registerform.setFieldsValue({
          type: "Зарлага",
          invoice_products: [{}],
        });
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
    >
      <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
        Падаан бүртгэх
      </p>
      <Spin spinning={loading}>
        <Form
          labelCol={{ span: 4 }}
          form={registerform}
          onFinish={submitHanlde}
        >
          <div className="flex flex-col ">
            <Form.Item
              label="Төрөл"
              name={"type"}
              rules={[{ required: true, message: "" }]}
            >
              <Select
                style={{ width: 300 }}
                placeholder="Төрлөө сонгох"
                options={[
                  { label: "Зарлага", value: "Зарлага" },
                  { label: "Орлого", value: "Орлого" },
                  { label: "Хөдөлгөөн", value: "Хөдөлгөөн" },
                ]}
              />
            </Form.Item>
            <SelectPadaanUserWidget2
              name={"from_user"}
              label="Хэнээс"
              firstLevel={type == "Зарлага" ? 4 : undefined}
              setFirstValue={(val: any) => {
                registerform.setFieldsValue({
                  from_user: val,
                });
              }}
              level={type == "Зарлага" ? [4] : [3, 4]}
              className={` ${type == "Орлого" ? "hidden" : ""}`}
            />
            <SelectPadaanUserWidget2
              name={"to_user"}
              label="Хэнд"
              firstLevel={
                type == "Орлого" || type == "Хөдөлгөөн" ? 4 : undefined
              }
              // setFirstValue={(val: any) => {
              //   registerform.setFieldsValue({
              //     to_user: val,
              //   });
              // }}
              level={
                type == "Орлого" || type == "Хөдөлгөөн"
                  ? [4]
                  : type == "Зарлага"
                  ? [3]
                  : [3, 4]
              }
              // className={` ${type == "Хөдөлгөөн" ? "hidden" : ""}`}
              rules={[
                {
                  required:
                    type == "Орлого" || type == "Хөдөлгөөн" ? false : true,
                  message: "",
                },
              ]}
            />
            <Form.Item label="Тайлбар" name={"isPaid"}>
              <Input />
            </Form.Item>
            <Form.Item label="Дууссан" name={"isCompleted"}>
              <Switch className="bg-[#c4c4c4]" />
            </Form.Item>
            <p>Барааны жагсаалт</p>
            <div className="flex flex-col w-full mb-5 border p-5">
              <Form.List name="invoice_products">
                {(fields, { add, remove }) => (
                  <>
                    {fields.map(({ key, name, ...restField }, ind: number) => (
                      <div
                        key={key}
                        className="flex justify-between w-full item-center mt-2"
                      >
                        <SelectProductWidget
                          {...restField}
                          ismer={"true"}
                          name={[name, "product"]}
                          className="w-full m-0"
                        />
                        <Form.Item
                          {...restField}
                          name={[name, "too"]}
                          className="m-0"
                          rules={[{ required: true, message: "" }]}
                        >
                          <Input type="number" placeholder="Ширхэг" min={0} />
                        </Form.Item>
                        {name == 0 ? (
                          <Button
                            onClick={() => {
                              add();
                            }}
                            className="h-[32px] w-[35px] text-[25px] flex items-center justify-center text-[#030D45]"
                          >
                            +
                          </Button>
                        ) : (
                          <Image
                            src={"/icons/circle-minus-solid.svg"}
                            alt="remove"
                            width={15}
                            height={15}
                            className="h-[32px] w-[37px] text-[15px] p-3 flex items-center justify-center text-[#030D45]"
                            onClick={() => remove(ind)}
                          />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </Form.List>
            </div>
          </div>

          <Button
            className="w-1/2 px-1"
            onClick={() => {
              registerform.resetFields();
              registerform.setFieldsValue({
                type: "Зарлага",
                invoice_products: [{}],
              });
              handleCancel();
            }}
          >
            Болих
          </Button>
          <Button
            loading={loading}
            disabled={loading}
            className="w-1/2 px-1 hover:text-green-900 hover:bg-white bg-green-900  text-white"
            onClick={registerform.submit}
            htmlType="submit"
          >
            Хадгалах
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
};
export default AddInvoiceModal;
