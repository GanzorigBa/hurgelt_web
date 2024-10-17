import { IInvoice } from "@/types/next";
import { Modal,Button } from "antd";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import AddInvoiceZarlagaCopyModal from "./addInvoinceZarlaga";
import { useState } from "react";

const InvoiceProdutsModal = ({
  handleCancel,
  handleOk,
  open,
  data,
}: {
  handleCancel: Function;
  handleOk: Function;
  open: boolean;
  data: IInvoice;
}) => {
  const [openMo, setOpenMo] = useState(false);
  return (
    <Modal
      width={790}
      key={"register"}
      destroyOnClose
      style={{ maxWidth: "100vw !important" }}
      className="items-center  !m-0 text-blue-950"
      onCancel={() => {
        handleCancel();
      }}
      onOk={() => {
        handleOk();
      }}
      centered
      open={open}
      footer={[]}
    >
      <div className="flex justify-between border-b-2 mb-6 pb-4">
        <p className="">{data?.type}</p>
        <p className="h1 flex items-center justify-center font-medium text-[12px] text-blue-950  ">
          Падааны тайлан
        </p>
        <p></p>
      </div>
      <div className="flex gap-2 justify-between mb-3">
        <p className="font-semibold">№ {data?.invoice_number}</p>
        <p>
          Үүсгэсэн:
          <span className="font-semibold"> {data?.owner?.username}</span>
        </p>
      </div>
      <div className="flex gap-2 justify-between mb-3">
        <p className="">
          Баримтын тайлбар :{" "}
          <span className="font-semibold">{data?.isPaid}</span>
        </p>
        <Link href={`/warehouse/print/${data?._id}`} target="_blank">
          <div className="cursor-pointer">
            <Image
              src={"/icons/print-solid.svg"}
              alt="edit"
              width={25}
              height={25}
            />
          </div>
        </Link>
      </div>
      <div className="border w-full  flex flex-col justify-start">
        <div className="flex w-full justify-between font-semibold border-b pb-2 bg-slate-200 p-2">
          <p className="min-w-[90px] text-left">Код</p>
          <p className="min-w-[130px] text-center">Барааны нэр</p>
          <p className="min-w-[50px] text-right">Тоо</p>
          <p className="min-w-[85px] text-right">Зарах үнэ</p>
          <p className="min-w-[80px] text-right">Бүгд</p>
        </div>
        {data?.invoice_product?.map((item: any, index: number) => {
          return (
            <div className="flex justify-between py-2 p-2" key={index}>
              <p className="min-w-[90px] text-left"> {item?.product_code}</p>
              <p className="min-w-[130px] text-left"> {item?.product_name}</p>
              <p className="min-w-[50px] text-right"> {item?.too}ш</p>
              <p className="min-w-[85px] text-right">
                {item?.sale_price?.toLocaleString()}₮
              </p>
              <p className="min-w-[80px] text-right">
                {(item?.sale_price * item?.too).toLocaleString()}₮
              </p>
            </div>
          );
        })}
        <div className="flex justify-between py-1 border-t font-bold bg-slate-200 p-2">
          <p className="min-w-[90px] text-left">Нийт</p>
          <p className="min-w-[130px] text-left"></p>
          <p className="min-w-[50px] text-right">{data?.too}ш</p>
          <p className="min-w-[85px] text-right">
            {data?.invoice_product
              ?.reduce((a: number, b: any) => a + b.sale_price, 0)
              .toLocaleString()}
            ₮
          </p>
          <p className="min-w-[80px] text-right">
            {data?.invoice_product
              ?.reduce((a: number, b: any) => a + b.sale_price * b.too, 0)
              .toLocaleString()}
            ₮
          </p>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        <p>{dayjs(data?.updated_at).format("YYYY/MM/DD HH:mm")}</p>
        <p> {data?.isCompleted ? "Дууссан" : "Дуусаагүй"}</p>
      </div>
      <div className="flex gap-2 justify-between mb-3 border-b-[1px] border-blue-950 pb-[40px] ">
        <p>
          Хэнээс : <span className="font-semibold">{data?.from_username}</span>
        </p>
        <p>
          Хэнд: <span className="font-semibold">{data?.to_username}</span>
        </p>
      </div>
      {
        data?.type=='Хөдөлгөөн' && <Button onClick={()=>{
          
          setOpenMo(true);
        }}>Хуулбар зарлага үүсгэх</Button>
      }
      <AddInvoiceZarlagaCopyModal open={openMo} data={{
        joloochId : JSON.stringify({
          "_id": data?.from_user?._id,
          "username": data?.from_user?.username,
          "name": data?.from_user?.name,
          "email": data?.from_user?.email,
          "phone": data?.from_user?.phone,
          "role": data?.from_user?.role,
        }),
        prod : data?.invoice_product
      }} handleOk={()=>{
        setOpenMo(false);
        handleOk();
        handleCancel();
      }} handleCancel={()=>{
         setOpenMo(false);
         handleCancel();
      }} />
    </Modal>
  );
};
export default InvoiceProdutsModal;
