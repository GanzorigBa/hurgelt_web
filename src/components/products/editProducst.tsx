import axiosInstance from "@/lib/axios";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Spin,
  Switch,
  message,
} from "antd";
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

const EditProductModal = ({ handleCancel, handleOk, open, data }: any) => {
  const [editForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setloading] = useState(false);

  useEffect(() => {
    editForm.setFieldsValue({
      code: data?.code?.trim(),
      name: data?.name?.trim(),
      tailbar: data?.tailbar?.trim(),
      image: data?.image?.trim(),
      price: data?.price,
      delivery_price: data?.delivery_price,
      balance: data?.balance,
      category: data?.category?.trim() ?? "Үндсэн",
      isActive: data?.isActive,
    });
  }, [data]);

  const price = Form.useWatch("price", editForm) ?? 0;
  const dprice = Form.useWatch("delivery_price", editForm) ?? 0;

  const submitHanlde = async (values: ProductFormValues) => {
    if (!loading) {
      setloading(true);

      if (!values.code?.trim() || !values.name?.trim()) {
        messageApi.error('Шаардлагатай талбаруудыг бөглөнө үү');
        return;
      }

      const trimmedValues = {
        id: data?._id,
        code: values.code?.trim(),
        name: values.name?.trim(),
        tailbar: values.tailbar?.trim() ?? "",
        image: values.image?.trim(),
        price: values.price ?? 0,
        delivery_price: values.delivery_price ?? 0,
        balance: values.balance ?? 0,
        total_price: price + dprice,
        category: values.category?.trim() ?? "Үндсэн",
        isActive: values.isActive,
      };

      axiosInstance
        .post("/products/update", {
          body: trimmedValues,
        })
        .then((response) => {
          if (response?.["status"] === 200) {
            editForm.resetFields();
            handleOk();
          } else {
            messageApi.open({
              type: "warning",
              content: response?.data?.message,
            });
          }
        })
        .catch((e: any) => {
          console.error("[ERROR][editProduct]:", e);
          messageApi.open({
            type: "error",
            content: "Алдаа! " + (e?.response?.data?.message ?? "Тодорхойгүй алдаа"),
          });
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  return (
    <Modal
      width={500}
      key={"register"}
      confirmLoading={loading}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center !m-0 text-blue-950"
      onCancel={() => {
        editForm.resetFields();
        handleCancel();
      }}
      centered
      open={open}
      footer={[]}
    >
      {contextHolder}
      <Spin spinning={loading}>
        <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950 mb-6">
          Барааны мэдээлэл засах
        </p>
        <Form labelCol={{ span: 7 }} form={editForm} onFinish={submitHanlde}>
          <div className="flex flex-col">
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
              rules={[
                { required: true, message: "Нэр оруулна уу" },
                { whitespace: true, message: "Хоосон зай ашиглах боломжгүй" }
              ]}
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
              editForm.resetFields();
              handleCancel();
            }}
          >
            Болих
          </Button>
          <Button
            loading={loading}
            className="w-1/2 px-1 hover:text-green-900 hover:bg-white bg-green-900 text-white"
            onClick={editForm.submit}
            htmlType="submit"
          >
            Хадгалах
          </Button>
        </Form>
      </Spin>
    </Modal>
  );
};

export default EditProductModal;
