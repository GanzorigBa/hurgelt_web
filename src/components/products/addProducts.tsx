import axiosInstance from "@/lib/axios";
import { Button, Form, Input, InputNumber, Modal, Switch, message } from "antd";
import { useEffect, useState } from "react";

interface ProductFormValues {
  code: string;
  name: string;
  tailbar?: string;
  image?: string;
  price: number;
  delivery_price: number;
  balance: number;
  category?: string;
  isActive: boolean;
}

const AddProductModal = ({ handleCancel, handleOk, open }: any) => {
  const [addProductForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);

  const price = Form.useWatch("price", addProductForm) ?? 0;
  const dprice = Form.useWatch("delivery_price", addProductForm) ?? 0;

  const submitHanlde = async (values: ProductFormValues) => {
    if (!loading) {
      setloading(true);
      if (!values.code.trim() || !values.name.trim()) {
        messageApi.error('Шаардлагатай талбаруудыг бөглөнө үү');
        return;
      }
      const trimmedValues = {
        code: values?.code?.trim(),
        name: values?.name?.trim() ?? "",
        tailbar: values?.tailbar?.trim() ?? "",
        image: values?.image?.trim(),
        price: values?.price ?? 0,
        delivery_price: values?.delivery_price ?? 0,
        balance: values?.balance ?? 0,
        total_price: price + dprice,
        category: values?.category?.trim() ?? "Үндсэн",
        isActive: values?.isActive,
      };

      axiosInstance
        .post("/products/register", {
          body: trimmedValues,
        })
        .then((response) => {
          if (response?.["status"] === 200) {
            addProductForm.resetFields();
            addProductForm.setFieldsValue({
              delivery_price: 5000,
            });
            handleOk();
          } else {
            messageApi.open({
              type: "warning",
              content: response?.data?.message,
            });
          }
        })
        .catch((e: any) => {
          console.log(e);
          messageApi.open({
            type: "error",
            content:
              "Алдаа! " +
              JSON.stringify(e?.response?.data?.message) +
              e?.response?.data?.message?.message,
          });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      addProductForm.setFieldsValue({
        delivery_price: 5000,
        isActive: true,
      });
    }, 2000);
    return () => {};
  }, []);
  return (
    <Modal
      width={500}
      key={"register"}
      confirmLoading={loading}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        addProductForm.resetFields();
        addProductForm.setFieldsValue({
          delivery_price: 5000,
        });
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
    >
      {contextHolder}
      <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
        Бараа бүртгэх
      </p>
      <Form
        labelCol={{ span: 7 }}
        form={addProductForm}
        onFinish={submitHanlde}
      >
        <div className="flex flex-col ">
          <Form.Item
            name={"code"}
            label="Барааны код"
            rules={[
              { required: true, message: "Код оруулна уу" },
              { pattern: /^\S*$/, message: "Хоосон зай ашиглах боломжгүй" }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name={"name"}
            label="Барааны нэр"
            rules={[{ required: true, message: "" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Тайлбар" name={"tailbar"}>
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Үлдэгдэл тоо" name={"balance"}>
            <Input type="number" />
          </Form.Item>
          <Form.Item
            label="Зарах үнэ"
            name={"price"}
            className="w-full"
            rules={[{ required: true, message: "" }]}
          >
            <InputNumber suffix={"₮"} />
          </Form.Item>

          <Form.Item
            label="Хүргэлтийн үнэ"
            name={"delivery_price"}
            rules={[{ required: true, message: "" }]}
          >
            <InputNumber suffix={"₮"} />
          </Form.Item>
          <Form.Item label="Нийт үнэ:">
            <p> {(price + dprice)?.toLocaleString()}₮</p>
          </Form.Item>
          <Form.Item name={"category"} label="Категор">
            <Input />
          </Form.Item>
          <Form.Item label="Идвэхгүй болгох" name={"isActive"}>
            <Switch className="bg-gray-400" />
          </Form.Item>
        </div>
        <Button
          className="w-1/2 px-1"
          onClick={() => {
            addProductForm.resetFields();
            addProductForm.setFieldsValue({
              delivery_price: 5000,
            });
            handleCancel();
          }}
        >
          Болих
        </Button>
        <Button
          loading={loading}
          className="w-1/2 px-1 hover:text-green-900 hover:bg-white bg-green-900  text-white"
          onClick={addProductForm.submit}
          htmlType="submit"
        >
          Хадгалах
        </Button>
      </Form>
    </Modal>
  );
};
export default AddProductModal;
