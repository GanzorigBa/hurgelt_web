import AddInvoiceHudulguunTootsooModal from "@/components/invioces/addInvoinceHudulguun";
import SelectProductWidget from "@/components/select_product";
import SelectPadaanUserWidget from "@/components/select_userpadaan";
import EditUldeglModal from "@/components/uldegdel/editUldegdel";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IUserBalances } from "@/types/next";
import { Button, Form, Modal, Table, TableProps, Tabs, Typography } from "antd";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const { Text } = Typography;

const UldegdelPage = () => {
  const router = useRouter();
  const { userContent } = useData();
  const isEdit = [0, 1];
  const [level, setlevel] = useState(0);
  useEffect(() => {
    if (userContent) {
      setlevel(userContent.level);
    }
  }, [userContent]);

  const [sort, setsort] = useState<any>({ created_at: -1 });
  const [sort2, setsort2] = useState<any>({ product_name: 1 });

  const [loading, setloading] = useState(false);
  const [loading2, setloading2] = useState(false);
  const [tableData, settableData] = useState<IUserBalances[]>([]);
  const [tootsooUldegdel, settootsooUldegdel] = useState<IUserBalances[]>([]);
  const [tableData2, settableData2] = useState<IUserBalances[]>([]);
  const [totalcnt, settotalcnt] = useState(0);
  const [totalcnt2, settotalcnt2] = useState(0);
  const [undsenform] = Form.useForm();
  const [baraform] = Form.useForm();
  const [openHudulguun, setOpenHudulguun] = useState(false);
  const joloochId = Form.useWatch("jolooch", undsenform);
  const prodId = Form.useWatch("baraa", baraform);
  const [selectedItem, setselectedItem] = useState<any>(null);
  const [editModal, seteditModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const showModal = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      const reult = await axiosInstance.post("/jolooch/balanceend", {
        jolooch: joloochId != null ? JSON?.parse(joloochId)?._id : "",
      });
      if (reult?.status == 200) {
        toast.success("Амжилттай хадгалсан.");
      }
    } catch (error) {
      toast.error(JSON.stringify(error));
    } finally {
      setOpen(false);
      setConfirmLoading(false);
      getData();
    }
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setOpen(false);
  };

  const getData = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
  }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/jolooch/balance", {
          offset: 0,
          limit: 200,
          sort: data?.sort ?? sort,
          search: data?.search,
          jolooch:
            joloochId != null
              ? joloochId == "isBugd"
                ? joloochId
                : JSON?.parse(joloochId)?._id
              : "",
        });
        if (result?.status == 200) {
          let temp = [];
          for (let index = 0; index < result?.data?.data.length; index++) {
            const element = result?.data?.data[index];
            temp.push({
              ...element,
              uldsen:
                element?.orlogodson -
                element?.zarlagadsan -
                element?.hurgegdsen,
            });
          }
          settableData(temp);
          const tempdd = [];
          if (result?.data?.data && result?.data?.data?.length > 0) {
            for (let index = 0; index < result?.data?.data.length; index++) {
              const item = result?.data?.data[index];
              if (item?.orlogodson - item?.zarlagadsan - item?.hurgegdsen)
                tempdd.push(item);
            }
          }
          settootsooUldegdel(tempdd);
          settotalcnt(result?.data?.totalcnt);
        }
      } catch (e: any) {
        const toastId = Math.floor(new Date().getTime() / 5000);
        toast.error(`${e?.toString()}`, { toastId });
      }
      setloading(false);
    }
  };
  const getData2 = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
  }) => {
    if (!loading2) {
      setloading2(true);
      try {
        const result = await axiosInstance.post("/jolooch/balance2", {
          offset: 0,
          limit: 200,
          sort: data?.sort ?? sort,
          search: data?.search,
          prodId: prodId != null ? JSON?.parse(prodId)?._id : "",
        });
        if (result?.status == 200) {
          let temp = [];
          for (let index = 0; index < result?.data?.data.length; index++) {
            const element = result?.data?.data[index];
            temp.push({
              ...element,
              uldsen:
                element?.orlogodson -
                element?.zarlagadsan -
                element?.hurgegdsen,
            });
          }
          settableData2(temp);
          settotalcnt2(result?.data?.totalcnt);
        }
      } catch (e: any) {
        const toastId = Math.floor(new Date().getTime() / 5000);
        toast.error(`${e?.toString()}`, { toastId });
      }
      setloading2(false);
    }
  };

  const onChange: TableProps<IUserBalances>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    let sort2: any;
    if (sorter) {
      const sortTemp: any = sorter;
      if (
        sortTemp &&
        sortTemp?.field &&
        sortTemp?.field != "" &&
        sortTemp?.order
      ) {
        const fieldname = sortTemp.field ?? "";
        let tempSort = [];
        switch (fieldname) {
          case "uldsen":
            sort2 = { uldsen: sortTemp.order == "descend" ? -1 : 1 };
            tempSort = tableData.sort((a: any, b: any) =>
              sortTemp.order == "descend"
                ? a.uldsen - b.uldsen
                : b.uldsen - a.uldsen
            );
            settableData(tempSort);
            break;
          case "hurgegdsen":
            sort2 = { hurgegdsen: sortTemp.order == "descend" ? -1 : 1 };
            tempSort = tableData.sort((a: any, b: any) =>
              sortTemp.order == "descend"
                ? a.hurgegdsen - b.hurgegdsen
                : b.hurgegdsen - a.hurgegdsen
            );
            settableData(tempSort);
            break;
          case "zarlagadsan":
            sort2 = { zarlagadsan: sortTemp.order == "descend" ? -1 : 1 };
            tempSort = tableData.sort((a: any, b: any) =>
              sortTemp.order == "descend"
                ? a.zarlagadsan - b.zarlagadsan
                : b.zarlagadsan - a.zarlagadsan
            );
            settableData(tempSort);
            break;
          case "orlogodson":
            sort2 = { orlogodson: sortTemp.order == "descend" ? -1 : 1 };
            tempSort = tableData.sort((a: any, b: any) =>
              sortTemp.order == "descend"
                ? a.orlogodson - b.orlogodson
                : b.orlogodson - a.orlogodson
            );
            settableData(tempSort);
            break;
          default:
            sort2 = { product_name: sortTemp.order == "descend" ? -1 : 1 };
            break;
        }
      }
    }
    // setsort(sort2);
    // getData({
    //   sort: sort2,
    // });
  };
  const onChange2: TableProps<IUserBalances>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    let sort2: any;
    if (sorter) {
      const sortTemp: any = sorter;
      if (
        sortTemp &&
        sortTemp?.field &&
        sortTemp?.field != "" &&
        sortTemp?.order
      ) {
        const fieldname = sortTemp.field ?? "";
        let tempSort = [];
        switch (fieldname) {
          case "uldsen":
            sort2 = { uldsen: sortTemp.order == "descend" ? -1 : 1 };
            tempSort = tableData2.sort((a: any, b: any) =>
              sortTemp.order == "descend"
                ? a.uldsen - b.uldsen
                : b.uldsen - a.uldsen
            );
            settableData2(tempSort);
            break;
          case "hurgegdsen":
            sort2 = { hurgegdsen: sortTemp.order == "descend" ? -1 : 1 };
            tempSort = tableData2.sort((a: any, b: any) =>
              sortTemp.order == "descend"
                ? a.hurgegdsen - b.hurgegdsen
                : b.hurgegdsen - a.hurgegdsen
            );
            settableData2(tempSort);
            break;
          case "zarlagadsan":
            sort2 = { zarlagadsan: sortTemp.order == "descend" ? -1 : 1 };
            tempSort = tableData2.sort((a: any, b: any) =>
              sortTemp.order == "descend"
                ? a.zarlagadsan - b.zarlagadsan
                : b.zarlagadsan - a.zarlagadsan
            );
            settableData2(tempSort);
            break;
          case "orlogodson":
            sort2 = { orlogodson: sortTemp.order == "descend" ? -1 : 1 };
            tempSort = tableData2.sort((a: any, b: any) =>
              sortTemp.order == "descend"
                ? a.orlogodson - b.orlogodson
                : b.orlogodson - a.orlogodson
            );
            settableData2(tempSort);
            break;
          default:
            sort2 = { product_name: sortTemp.order == "descend" ? -1 : 1 };
            break;
        }
      }
    }
  };

  useEffect(() => {
    if (joloochId != null) getData();
  }, [joloochId]);
  useEffect(() => {
    if (prodId != null) getData2();
  }, [prodId]);

  const columns: any = [
    {
      title: "Барааны код",
      dataIndex: "product_code",
      sorter: true,
      width: "3%",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div>
            {joloochId == "isBugd" ? item?._id?.code : item?.product_code}
          </div>
        );
      },
    },
    {
      title: "Барааны нэр",
      dataIndex: "product_name",
      sorter: true,
      width: "10%",
      render: (rec: any, item: any) => {
        return (
          <div>
            {joloochId == "isBugd" ? item?._id?.name : item?.product_name}
          </div>
        );
      },
    },

    {
      title: "Барааны үнэ",
      dataIndex: "product",
      width: "10%",
      render: (rec: any, item: any) => {
        return (
          <div>
            {(joloochId == "isBugd"
              ? item?._id?.price + item?._id?.delivery_price
              : item?.product?.price + item?.product?.delivery_price
            )?.toLocaleString()}
            ₮
          </div>
        );
      },
    },
    {
      title: "Орлогодсон",
      dataIndex: "orlogodson",
      key: "orlogodson",
      width: "5%",
      sorter: true,
      align: "center",
      editable: true,
    },
    {
      title: "Шилжүүлсэн",
      dataIndex: "zarlagadsan",
      key: "zarlagadsan",
      width: "5%",
      sorter: true,
      editable: true,
      align: "center",
    },
    {
      title: "Хүргэсэн",
      dataIndex: "hurgegdsen",
      key: "hurgegdsen",
      width: "5%",
      sorter: true,
      align: "center",
      editable: true,
    },
    {
      title: "Үлдсэн",
      dataIndex: "uldsen",
      key: "uldsen",
      width: "5%",
      sorter: true,
      editable: true,
      align: "center",
      render: (rec: any, item: any) => {
        return (
          <div className="font-bold">
            {item?.orlogodson - item?.zarlagadsan - item?.hurgegdsen}
          </div>
        );
      },
    },
    {
      title: "",
      dataIndex: "",
      width: "2%",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex justify-center">
            {isEdit.includes(level) ? (
              <Image
                src={"/icons/pen-to-square-regular.svg"}
                alt="edit"
                width={15}
                height={15}
                className="cursor-pointer"
                onClick={() => {
                  setselectedItem(rec);
                  seteditModal(true);
                }}
              />
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];

  const columns2: any = [
    {
      title: "Жолоооч",
      dataIndex: "product",
      width: "10%",
      render: (rec: any, item: any) => {
        return <div>{item?.owner?.username?.toLocaleString()}</div>;
      },
    },
    {
      title: "Орлогодсон",
      dataIndex: "orlogodson",
      key: "orlogodson",
      width: "5%",
      sorter: true,
      align: "center",
      editable: true,
    },
    {
      title: "Шилжүүлсэн",
      dataIndex: "zarlagadsan",
      key: "zarlagadsan",
      width: "5%",
      sorter: true,
      editable: true,
      align: "center",
    },
    {
      title: "Хүргэсэн",
      dataIndex: "hurgegdsen",
      key: "hurgegdsen",
      width: "5%",
      sorter: true,
      align: "center",
      editable: true,
    },
    {
      title: "Үлдсэн",
      dataIndex: "uldsen",
      key: "uldsen",
      width: "5%",
      sorter: true,
      editable: true,
      align: "center",
      render: (rec: any, item: any) => {
        return (
          <div>{item?.orlogodson - item?.zarlagadsan - item?.hurgegdsen}</div>
        );
      },
    },
    {
      title: "",
      dataIndex: "",
      width: "2%",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex justify-center">
            {isEdit.includes(level) ? (
              <Image
                src={"/icons/pen-to-square-regular.svg"}
                alt="edit"
                width={15}
                height={15}
                className="cursor-pointer"
                onClick={() => {
                  setselectedItem(rec);
                  seteditModal(true);
                }}
              />
            ) : (
              <></>
            )}
          </div>
        );
      },
    },
  ];
  return (
    <div className="w-full ">
      <AddInvoiceHudulguunTootsooModal open={openHudulguun} data={
        {joloochId : joloochId, 
          prod : tootsooUldegdel
        }
      } handleCancel={()=>{
        setOpenHudulguun(false);
      }} handleOk={()=>{
        setOpenHudulguun(false);
        getData();
      }}/>
      <Tabs
        defaultActiveKey="1"
        type="card"
        items={[
          {
            label: `Жолооч`,
            key: "1",
            children: (
              <div className="w-full flex flex-col gap-1">
                <div className="h-full w-full p-5 bg-white">
                  <div className="flex gap-3 items-center justify-between">
                    <div className="flex gap-2 items-center h-[30px]">
                      <p className="mb-5 font-bold">Жолооч нарын жагсаалт</p>
                      <Form form={undsenform} className="">
                        <SelectPadaanUserWidget
                          className="m-0 bg-white"
                          name={"jolooch"}
                          level={[3, 4]}
                          isbugd={"true"}
                        />
                      </Form>
                    </div>
                    {joloochId != "isBugd" && (
                      <Button
                        disabled={!joloochId || tableData?.length == 0}
                        className={` ${tootsooUldegdel?.length == 0 ? "bg-green-300" : ""}`}
                        onClick={showModal}
                      >
                        {" "}
                        Тооцоо дуусгах
                      </Button>
                    )}
                    <Modal
                      title="Тооцоо дуусгах"
                      open={open}
                      onOk={
                        tootsooUldegdel?.length > 0 ? handleCancel : handleOk
                      }
                      confirmLoading={confirmLoading}
                      onCancel={handleCancel}
                    >
                      <p>
                        Тооцоо дуусгах даа итгэлтэй байна уу ? Бүх тооцооны
                        үлдэгдэл мэдээллийг устгах болно.
                      </p>
                      {tootsooUldegdel?.length > 0 && (
                        <div className="text-red-600">
                          Доорх барааны тооцоог дуусгаж байж тооцоог дуусгана
                          уу!
                        </div>
                      )}
                      <div className="flex flex-col">
                        {tootsooUldegdel?.map((item: any, index: number) => {
                          return (
                            <div key={index} className="flex w-full border p-1">
                              <p className="w-1/2">
                                {item?.product_code} - {item?.product_name}
                              </p>
                              <p>
                                {item?.orlogodson -
                                  item?.zarlagadsan -
                                  item?.hurgegdsen}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                      {tootsooUldegdel?.length > 0 && (
                        <Button className="bg-slate-500 text-white mt-3" onClick={()=>{
                          handleCancel();

                          setOpenHudulguun(true);
                        }}>
                          Хөдөлгөөнөөр татах
                        </Button>
                      )}
                    </Modal>
                  </div>
                </div>
                <div className="h-full ">
                  <div className="flex justify-between ">
                    <div className="flex gap-4 items-center">
                      <p>Мөрийн тоо: {totalcnt}</p>
                    </div>
                    <EditUldeglModal
                      open={editModal}
                      handleCancel={() => {
                        seteditModal(false);
                        setselectedItem(null);
                      }}
                      handleOk={() => {
                        seteditModal(false);
                        setselectedItem(null);
                        getData();
                      }}
                      data={selectedItem}
                    />
                    {
                      <div className="flex gap-2 items-center">
                        <Button
                          className="flex items-center"
                          loading={loading2}
                          onClick={() => {
                            getData();
                          }}
                        >
                          <Image
                            src={"/icons/rotate-right-solid.svg"}
                            alt="refresh"
                            width={15}
                            height={15}
                          />
                        </Button>
                      </div>
                    }
                  </div>
                  <Table
                    loading={loading}
                    bordered
                    key={"_id"}
                    onChange={onChange}
                    className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
                    dataSource={tableData}
                    size="small"
                    columns={columns}
                    rowClassName="editable-row"
                    pagination={false}
                  />
                </div>
              </div>
            ),
          },
          {
            label: `Бараа`,
            key: "2",
            children: (
              <div className="w-full flex flex-col gap-1">
                <div className="h-full w-full p-5 bg-white">
                  <div className="flex gap-3 items-center justify-between">
                    <div className="flex gap-2 items-center h-[30px]">
                      <p className="mb-5 font-bold">Жарааны жагсаалт</p>
                      <Form form={baraform} className="">
                        <SelectProductWidget
                          wrapperCol={{ span: 24 }}
                          className="m-0 w-[250px]"
                          ismer={"true"}
                          name="baraa"
                        />
                      </Form>
                    </div>
                  </div>
                </div>
                <div className="h-full ">
                  <div className="flex justify-between ">
                    <div className="flex gap-4 items-center">
                      <p>Мөрийн тоо: {totalcnt2}</p>
                    </div>
                    <EditUldeglModal
                      open={editModal}
                      handleCancel={() => {
                        seteditModal(false);
                        setselectedItem(null);
                      }}
                      handleOk={() => {
                        seteditModal(false);
                        setselectedItem(null);
                        getData2();
                      }}
                      data={selectedItem}
                    />
                    <div className="flex gap-2 items-center">
                      <Button
                        className="flex items-center"
                        loading={loading2}
                        onClick={() => {
                          getData2();
                        }}
                      >
                        <Image
                          src={"/icons/rotate-right-solid.svg"}
                          alt="refresh"
                          width={15}
                          height={15}
                        />
                      </Button>
                    </div>
                  </div>
                  <Table
                    loading={loading2}
                    bordered
                    key={"_id"}
                    onChange={onChange2}
                    className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
                    dataSource={tableData2}
                    size="small"
                    columns={columns2}
                    rowClassName="editable-row"
                    pagination={false}
                  />
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default UldegdelPage;
