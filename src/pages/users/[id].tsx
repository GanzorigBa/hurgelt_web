import OrdersProdutsModal from "@/components/orders/order_produts";
import SelectJoloochIdWidget from "@/components/select_jolooch_id";
import EditUldeglModal from "@/components/uldegdel/editUldegdel";
import { useData } from "@/helper/context";
import axiosInstance from "@/lib/axios";
import { IProduct, IUser, IUserBalances } from "@/types/next";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Table,
  TableProps,
  Tabs,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import jwt from "jsonwebtoken";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const { Text } = Typography;

const UserDetials = (props?: {
  memberId: string;
  memberData?: any;
}) => {
  const router = useRouter();
  const location: any = props?.memberData?.location
    ? JSON.parse(props?.memberData?.location)
    : null;

  const { userContent } = useData();
  const isdelete = [0, 1];
  const isEdit = [0, 1];
  const [level, setlevel] = useState(0);
  useEffect(() => {
    if (userContent) {
      setlevel(userContent.level);
    }
  }, [userContent]);

  const [page, setpage] = useState(1);
  const [offset, setoffset] = useState(0);
  const [limit, setlimit] = useState(30);
  const [sort, setsort] = useState<any>({ created_at: -1 });
  const [sort2, setsort2] = useState<any>({ product_name: 1 });
  const [status, setstatus] = useState<string>("");

  const [loading, setloading] = useState(false);
  const [loading2, setloading2] = useState(false);
  const [tableData, settableData] = useState<IUser[]>([]);
  const [tableData2, settableData2] = useState<IUserBalances[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [totalcnt, settotalcnt] = useState(0);
  const [totalcnt2, settotalcnt2] = useState(0);
  const [totalsum, settotalsum] = useState<any>();
  const [undsenform] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [searchForm2] = Form.useForm();
  const joloochId = Form.useWatch("jolooch", undsenform);
  const searchValue = Form.useWatch("search", searchForm);
  const searchValue2 = Form.useWatch("search", searchForm2);
  const [selectedItem, setselectedItem] = useState<any>(null);

  useEffect(() => {
    undsenform.setFieldsValue({
      jolooch: props?.memberId,
    });
  }, []);

  useEffect(() => {
    if (props?.memberId != joloochId && joloochId) {
      router.push(`/users/${joloochId}`);
      getData();
      getData2();
    }
  }, [joloochId]);

  const [editModal, seteditModal] = useState(false);
  const [viewModal, setviewModal] = useState(false);

  const [isShowAll, setisShowAll] = useState(true);
  const [isComplete, setisComplete] = useState(0);

  dayjs.extend(customParseFormat);
  const nowDate = new Date();
  const current = new Date(nowDate.setHours(0, 0, 0, 0));
  const [startDate, setStartDate] = useState<Date>(current);
  const [endDate, setEndDate] = useState<Date>(
    new Date(nowDate.setHours(23, 59, 59, 99))
  );

  function disabledendDate(current: any) {
    return startDate > current;
  }
  function disabledstartDate(current: any) {
    return endDate < current;
  }

  const getData2 = async (data?: {
    sort?: any;
    search?: string;
    ofs?: number;
    lim?: number;
  }) => {
    if (!loading2) {
      setloading2(true);
      try {
        const result = await axiosInstance.post("/jolooch/balance", {
          offset: 0,
          limit: 200,
          sort: data?.sort ?? sort,
          search: data?.search,
          jolooch: props?.memberId,
        });
        if (result?.status == 200) {
          settableData2(result?.data?.data);
          settotalcnt2(result?.data?.totalcnt);
        }
      } catch (e: any) {
        const toastId = Math.floor(new Date().getTime() / 5000);
        toast.error(`${e?.toString()}`, { toastId });
      }
      setloading2(false);
    }
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
        const result = await axiosInstance.post("/orders/jolooch", {
          offset: data?.ofs ?? offset,
          limit: data?.lim ?? limit,
          sort: data?.sort ?? sort,
          search: searchValue,
          jolooch: props?.memberId,
          start: startDate,
          end: endDate,
          status: status,
          isCompleted: isComplete == 0 ? null : isComplete == 1 ? false : true,
        });
        if (result?.status == 200) {
          settableData(result?.data?.data);
          settotalcnt(result?.data?.totalcnt);
          settotalsum(result?.data?.totalcum);
        }
      } catch (e: any) {
        const toastId = Math.floor(new Date().getTime() / 5000);
        toast.error(`${e?.toString()}`, { toastId });
      }
      setloading(false);
    }
  };
  const [tableDataBorluulalt, settableDataBorluulalt] = useState<IProduct[]>(
    []
  );
  const getDataBorluulaltBaraa = async (data?: {
    sort?: any;
    search?: string;
  }) => {
    if (!loading) {
      setloading(true);
      try {
        const result = await axiosInstance.post("/jolooch/uldegdel", {
          jolooch: props?.memberId,
          start: startDate,
          end: endDate,
          search: searchValue3,
        });
        if (result?.status == 200) {
          settableDataBorluulalt(result?.data?.data);
        }
      } catch (e: any) {
        messageApi.open({
          type: "error",
          content: e?.toString(),
        });
      }
      setloading(false);
    }
  };
  const onChange: TableProps<IUser>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    let sort2: any;
    let off: number = offset;
    let limt: number = limit;
    if (sorter) {
      const sortTemp: any = sorter;
      if (
        sortTemp &&
        sortTemp?.field &&
        sortTemp?.field != "" &&
        sortTemp?.order
      ) {
        const fieldname = sortTemp.field ?? "";
        switch (fieldname) {
          case "status":
            sort2 = { status: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "isPaid":
            sort2 = { isPaid: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "order_number":
            sort2 = { order_number: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "total_price":
            sort2 = { total_price: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "too":
            sort2 = { too: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "completedDate":
            sort2 = { completedDate: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "created_at":
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
          default:
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
        }
      }
      // getData({ sort: sort });
    }
    if (pagination && pagination?.current && pagination?.pageSize) {
      off = (pagination?.current - 1) * limit;
      limt = pagination?.pageSize;
      setpage(pagination?.current);
    }
    setsort(sort2);
    setoffset(off);
    setlimit(limt);
    getData({
      sort: sort2,
      ofs: off,
      lim: limt,
    });
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
        switch (fieldname) {
          case "product_code":
            sort2 = { product_code: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "uldsen":
            sort2 = { uldsen: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "hurgegdsen":
            sort2 = { hurgegdsen: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "zarlagadsan":
            sort2 = { zarlagadsan: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "orlogodson":
            sort2 = { orlogodson: sortTemp.order == "descend" ? -1 : 1 };
            break;
          case "created_at":
            sort2 = { created_at: sortTemp.order == "descend" ? -1 : 1 };
            break;
          default:
            sort2 = { product_name: sortTemp.order == "descend" ? -1 : 1 };
            break;
        }
      }
    }

    setsort2(sort2);
    getData2({
      sort: sort2,
    });
  };

  useEffect(() => {
    getData({ search: searchValue });
  }, [searchValue, isShowAll, isComplete, status]);
  const [tooTotal, settooTotal] = useState(0);

  useEffect(() => {
    if (tableData.length > 0) {
      let temptoo = 0;
      for (let index = 0; index < tableData.length; index++) {
        const element: any = tableData[index];
        for (let ind = 0; ind < element?.order_product?.length; ind++) {
          const ddddd: any = element?.order_product[ind];
          temptoo += ddddd?.too;
        }
      }
      settooTotal(temptoo);
    }
  }, [tableData]);

  useEffect(() => {
    getData2({ search: searchValue2 });
  }, [searchValue2]);

  const [searchFormBorluulalt] = Form.useForm();
  const searchValue3 = Form.useWatch("search", searchFormBorluulalt) ?? "";

  const columns = [
    {
      title: "",
      dataIndex: "isCompleted",
      width: 20,
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div>
            {item?.isCompleted ? (
              <Image
                src={"/icons/circle-check-regular.svg"}
                alt="pause"
                width={15}
                height={15}
                className={` ${
                  item?.isPaid ? "text-green-400" : "text-red-400"
                } `}
              />
            ) : (
              <Image
                src={"/icons/circle-pause-regular.svg"}
                alt="pause"
                width={15}
                height={15}
                className="text-blue-950"
              />
            )}
          </div>
        );
      },
    },
    {
      title: "Статус",
      dataIndex: "status",
      sorter: true,
      width: "3%",
      editable: true,
    },
    {
      title: "Тайлбар",
      dataIndex: "completeTailbar",
      sorter: true,
      width: "8%",
      editable: true,
    },
    {
      title: "Төлбөр",
      dataIndex: "isPaid",
      sorter: true,
      width: "10%",
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div>
            {item?.isPaid ? "Төлөгдсөн" : "Төлбөр хийгдээгүй"}
            {item?.payment_type ? ` (${item?.payment_type})` : ""}
          </div>
        );
      },
    },
    {
      title: "Захиалгын дугаар",
      dataIndex: "order_number",
      width: "15%",
      sorter: true,
      editable: true,
      render: (val: any) => {
        return (
          <div
            // className="cursor-pointer hover:font-bold"
            onClick={() => {
              // router.push("/");
            }}
          >
            {val}
          </div>
        );
      },
    },
    {
      title: "Үүсгэсэн",
      dataIndex: "owner_name",
      width: "15%",
    },
    {
      title: "Захиалагчын утас",
      dataIndex: "",
      width: "15%",
      render: (rec: any, item: any) => {
        return (
          <div
            className="cursor-pointer hover:font-bold"
            onClick={() => {
              router.push(`/customers/${rec?.customer_phone}`);
            }}
          >
            {rec?.customer_phone}{" "}
            {rec?.customer_name ? `(${rec?.customer_name})` : ""}
          </div>
        );
      },
    },
    {
      title: "Захиалсан бараа",
      dataIndex: "",
      width: "15%",
      sorter: true,
      editable: true,
      render: (rec: any, item: any) => {
        return (
          <div className="flex flex-col">
            {rec?.order_product?.map((baraa: any, index: number) => {
              return (
                <div key={index}>
                  {baraa?.product_name} ({baraa?.too})
                </div>
              );
            })}
          </div>
        );
      },
    },

    {
      title: "Тоо",
      dataIndex: "too",
      width: "5%",
      sorter: true,
      editable: true,
    },
    {
      title: "Хүргэлтийн дүн",
      dataIndex: "delivery_total_price",
      width: "15%",
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Нийт дүн",
      dataIndex: "total_price",
      width: "15%",
      sorter: true,
      editable: true,
      render: (val: number) => {
        return <>{val?.toLocaleString()}</>;
      },
    },
    {
      title: "Бүртгэгдсэн огноо",
      dataIndex: "created_at",
      width: "10%",
      sorter: true,
      editable: true,
      render: (value: any) => {
        return <>{dayjs(value).format("YYYY/MM/DD HH:mm:ss")}</>;
      },
    },
    {
      title: "Хаагдсан огноо",
      dataIndex: "completedDate",
      width: "10%",
      sorter: true,
      editable: true,
      render: (value: any) => {
        return <>{value ? dayjs(value).format("YYYY/MM/DD HH:mm:ss") : ""}</>;
      },
    },
  ];
  const columns2: any = [
    {
      title: "Барааны код",
      dataIndex: "product_code",
      sorter: true,
      width: "3%",
      editable: true,
    },
    {
      title: "Барааны нэр",
      dataIndex: "product_name",
      sorter: true,
      width: "10%",
    },

    {
      title: "Барааны үнэ",
      dataIndex: "product",
      width: "10%",
      render: (rec: any, item: any) => {
        return (
          <div>
            {(
              item?.product?.price + item?.product?.delivery_price
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

  const columns3: any[] = [
    {
      title: "Категор",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Код",
      key: "code",
      dataIndex: "code",
      render: (val: any) => {
        return <>{val}</>;
      },
    },
    {
      title: "Нэр",
      dataIndex: "name",
      key: "name",
      editable: true,
    },
    {
      title: "Борлуулагдсан",
      dataIndex: "hurgegdsen",
      key: "hurgegdsen",
      align: "center",

      editable: true,
      render: (val: number) => {
        return (
          <div className="flex gap-2 w-full justify-center">
            {val?.toLocaleString()}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full flex flex-col gap-1">
      {contextHolder}
      <div className="h-full w-full p-5 bg-white">
        <div className="flex gap-3 items-center justify-between">
          <div className="flex gap-2 items-center h-[30px]">
            <p className="mb-5 font-bold">Хэрэглэгчийн мэдээлэл</p>
            <Form form={undsenform} className="">
              <SelectJoloochIdWidget
                className="m-0 bg-white"
                name={"jolooch"}
              />
            </Form>
          </div>
          {location ? (
            <Link
              className="border rounded-xl max-w-[95px] flex items-center justify-center p-2 bg-white hover:bg-slate-100 hover:border-black"
              href={`https://www.google.com/maps/search/${location?.latitude},+${location?.longitude}?entry=tts`}
              target="_blank"
            >
              <Image
                src={"/assets/googlemap.png"}
                alt=""
                width={95}
                height={18}
              />
            </Link>
          ) : (
            <></>
          )}
        </div>
        <div className="w-full flex gap-1">
          <div className="w-full flex flex-col">
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Нэвтрэх нэр: </p>
              <p className="w-full">{props?.memberData?.username}</p>
            </div>
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Хэрэглэгчийн нэр: </p>
              <p className="w-full">{props?.memberData?.name}</p>
            </div>
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Машины марк: </p>
              <p className="w-full">{props?.memberData?.car_mark}</p>
            </div>
          </div>
          <div className="w-full flex flex-col">
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Утас: </p>
              <p className="w-full">{props?.memberData?.phone}</p>
            </div>
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Утас2: </p>
              <p className="w-full">{props?.memberData?.phone2}</p>
            </div>
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Машины дугаар: </p>
              <p className="w-full">{props?.memberData?.car_number}</p>
            </div>
          </div>
          <div className="w-full flex flex-col">
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Емайл: </p>
              <p className="w-full">{props?.memberData?.email}</p>
            </div>
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Хэрэглэгчийн эрх:</p>
              <p className="w-full">{props?.memberData?.role}</p>
            </div>
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Машины нэмэлт: </p>
              <p className="w-full">{props?.memberData?.car_desc}</p>
            </div>
          </div>
          <div className="w-full flex flex-col">
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Бүртгүүлсэн огноо:</p>
              <p className="w-full">
                {dayjs(props?.memberData?.created_at).format(
                  "YYYY/MM/DD HH:mm:ss"
                )}
              </p>
            </div>
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">
                Cүүлд нэвтэрсэн огноо:
              </p>
              <p className="w-full">
                {dayjs(props?.memberData?.last_login).format(
                  "YYYY/MM/DD HH:mm:ss"
                )}
              </p>
            </div>
            <div className="w-full flex gap-1">
              <p className="w-full text-[12px] font-bold">Хариуцсан бүс:</p>
              <p className="w-full">
                {props?.memberData?.duureg} ( {props?.memberData?.zone} )
              </p>
            </div>
          </div>
          {/* <div className="w-full flex gap-1">
            <p className="w-full text-[12px] font-bold">
              Хамгийн сүүлийн байршил:
            </p>
            <p className="w-full max-w-full flex flex-col gap-1">
              <span>{`latitude: ${location?.latitude}`}</span>
              <span>{`longitude: ${location?.longitude}`}</span>
              <span>
                {location
                  ? `Цаг: ${dayjs(location?.timestamp).format(
                      "YYYY/MM/DD HH:mm:ss"
                    )}`
                  : ""}
              </span>
            </p>
          </div> */}
        </div>
      </div>
      <Tabs
        defaultActiveKey="1"
        type="card"
        items={[
          {
            label: `Захиалгын түүх`,
            key: "1",
            children: (
              <div className="h-full ">
                <div className="flex justify-between ">
                  <div className="flex gap-4">
                    <div className="flex items-center mt-2 md:mt-0">
                      <DatePicker
                        className="ml-0 md:ml-2 w-[130px]"
                        defaultValue={dayjs(startDate)}
                        value={dayjs(startDate)}
                        onChange={(date, dateString) => {
                          const d = new Date(dateString as string);
                          setStartDate(new Date(d.setHours(0, 0, 0, 0)));
                        }}
                        disabledDate={disabledstartDate}
                        allowClear={false}
                        format="YYYY/MM/DD"
                      />
                      <span className={`mx-1`}>~</span>
                      <DatePicker
                        disabledDate={disabledendDate}
                        className="ml-0 md:ml-2 w-[130px]"
                        defaultValue={dayjs(endDate)}
                        value={dayjs(endDate)}
                        format="YYYY/MM/DD"
                        onChange={(date, dateString) => {
                          const d = new Date(dateString as string);
                          setEndDate(new Date(d.setHours(23, 59, 59, 0)));
                        }}
                        allowClear={false}
                      />
                      <button
                        className="ml-2 bg-[#001529] font-bold text-white px-8 py-2 rounded-md whitespace-nowrap"
                        onClick={() => getData()}
                      >
                        Хайх
                      </button>
                    </div>
                    <div className="flex gap-5 items-center">
                      <Form className=" m-0" form={searchForm}>
                        <Form.Item
                          label={"Хайх: "}
                          className="m-0 w-[250px]"
                          name={"search"}
                        >
                          <Input placeholder="Барааны код, нэрээр хайх" />
                        </Form.Item>
                      </Form>
                      <Select
                        className="w-[150px] bg-white"
                        defaultValue={isComplete}
                        onChange={(val) => {
                          setisComplete(val);
                        }}
                        options={[
                          { label: "Бүгд", value: 0 },
                          { label: "Хаагдаагүй", value: 1 },
                          { label: "Хаагдсан", value: 2 },
                        ]}
                      />
                      <Select
                        className="w-[150px] bg-white text-[12px]"
                        defaultValue={status}
                        onChange={(val) => {
                          setstatus(val);
                        }}
                        options={[
                          { label: "Бүгд", value: "" },
                          { label: "Ноорог", value: "Ноорог" },
                          { label: "Бүртгэсэн", value: "Бүртгэсэн" },
                          { label: "Цуцлагдсан", value: "Цуцлагдсан" },
                          { value: "Хүргэлтэнд", label: "Хүргэлтэнд" },
                          { value: "Буцаасан", label: "Буцаасан" },
                          { label: "Хүргэгдсэн", value: "Хүргэгдсэн" },
                        ]}
                      />
                    </div>
                    <p>Барааны тоо: {tooTotal}</p>
                  </div>

                  {/* <p className="font-bold">
                    Нийт хүргэлтийн дүн:
                    <span className="text-[18px]">
                      {totaldelivery?.toLocaleString()}₮
                    </span>
                  </p> */}
                  <div className="flex gap-2 items-center">
                    <Button
                      className="flex items-center"
                      loading={loading}
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
                </div>
                <div className="mt-5 flex flex-col text-[11px]">
                  <div className="flex items-center bg-blue-100 h-[31px]">
                    <p className="flex justify-center w-[150px]">Төлөв</p>
                    <p className="flex justify-center w-[150px]">Тоо</p>
                    <p className="flex justify-center w-[150px]">Барааны тоо</p>
                    <p className="flex justify-center w-[150px]">
                      Хүргэлтийн дүн
                    </p>
                    <p className="flex justify-center w-[150px]">
                      Борлуулалтын дүн
                    </p>
                  </div>
                  {totalsum?.map((item: any, ind: number) => {
                    return (
                      <div key={ind} className="flex items-center bg-[#ffffff]">
                        <p
                          className={`flex justify-center w-[150px] ${
                            item?._id?.status == "Хүргэгдсэн" ? "font-bold" : ""
                          } `}
                        >
                          {item?._id?.status}
                        </p>
                        <p
                          className={`flex justify-center w-[150px] ${
                            item?._id?.status == "Хүргэгдсэн" ? "font-bold" : ""
                          } `}
                        >
                          {item?.orderCount?.toLocaleString()}
                        </p>
                        <p
                          className={`flex justify-center w-[150px] ${
                            item?._id?.status == "Хүргэгдсэн" ? "font-bold" : ""
                          } `}
                        >
                          {item?.too?.toLocaleString()}
                        </p>
                        <p
                          className={`flex justify-center w-[150px] ${
                            item?._id?.status == "Хүргэгдсэн" ? "font-bold" : ""
                          } `}
                        >
                          {item?.delivery?.toLocaleString()}
                        </p>
                        <p
                          className={`flex justify-center w-[150px] ${
                            item?._id?.status == "Хүргэгдсэн" ? "font-bold" : ""
                          } `}
                        >
                          {item?.sum?.toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                  <div className="flex items-center bg-blue-100 h-[18px]">
                    <p className="flex justify-center w-[150px]"></p>
                    <p className="flex justify-center w-[150px]">{totalcnt}</p>
                    <p className="flex justify-center w-[150px]">
                      {totalsum
                        ?.reduce((a: number, b: any) => a + b?.too, 0)
                        ?.toLocaleString()}
                      ш
                    </p>
                    <p className="flex justify-center w-[150px]">
                      {totalsum
                        ?.reduce((a: number, b: any) => a + b?.delivery, 0)
                        ?.toLocaleString()}
                      ₮
                    </p>
                    <p className="flex justify-center w-[150px]">
                      {totalsum
                        ?.reduce((a: number, b: any) => a + b?.sum, 0)
                        ?.toLocaleString()}
                      ₮
                    </p>
                  </div>
                </div>
                <OrdersProdutsModal
                  open={viewModal}
                  handleCancel={() => {
                    setviewModal(false);
                    setselectedItem(null);
                  }}
                  data={selectedItem}
                />
                <Table
                  loading={loading}
                  bordered
                  key={"_id"}
                  onChange={onChange}
                  className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
                  dataSource={tableData}
                  onRow={(record: IUser, rowIndex) => {
                    return {
                      onClick: (event) => {}, // click row
                      onDoubleClick: (event) => {
                        setselectedItem(record);
                        setviewModal(true);
                        // router.push("/members/" + record.memberId);
                      }, // double click row
                      onContextMenu: (event) => {}, // right button click row
                      // onMouseEnter: (event) => {
                      // }, // mouse enter row
                      // onMouseLeave: (event) => {
                      // }, // mouse leave row
                    };
                  }}
                  size="small"
                  columns={columns}
                  rowClassName="editable-row"
                  pagination={{
                    total: totalcnt,
                    pageSize: limit,
                    position: ["bottomCenter"],
                    current: page,
                  }}
                />
              </div>
            ),
          },
          {
            label: `Барааны борлуулалт хийгдсэн тайлан`,
            key: "2",
            children: (
              <div className="h-full max-w-[800px]">
                <div className="flex flex-wrap justify-between gap-2">
                  <div className="flex gap-4">
                    <Form
                      className="text-[12px] m-0"
                      form={searchFormBorluulalt}
                      onFinish={() => {
                        getDataBorluulaltBaraa();
                      }}
                    >
                      <Form.Item
                        className="m-0 !text-[10px] w-[250px]"
                        label={"Хайх: "}
                        name={"search"}
                      >
                        <Input
                          placeholder="Кодоор хайх"
                          onSubmit={() => {
                            getDataBorluulaltBaraa();
                          }}
                        />
                      </Form.Item>
                    </Form>
                    <div className="flex items-center mt-2 md:mt-0">
                      <DatePicker
                        className="ml-0 md:ml-2 w-[130px]"
                        defaultValue={dayjs(startDate)}
                        value={dayjs(startDate)}
                        onChange={(date, dateString) => {
                          const d = new Date(dateString as string);
                          setStartDate(new Date(d.setHours(0, 0, 0, 0)));
                        }}
                        disabledDate={disabledstartDate}
                        allowClear={false}
                        format="YYYY/MM/DD"
                      />
                      <span className={`mx-1`}>~</span>
                      <DatePicker
                        disabledDate={disabledendDate}
                        className="ml-0 md:ml-2 w-[130px]"
                        defaultValue={dayjs(endDate)}
                        value={dayjs(endDate)}
                        format="YYYY/MM/DD"
                        onChange={(date, dateString) => {
                          const d = new Date(dateString as string);
                          setEndDate(new Date(d.setHours(23, 59, 59, 0)));
                        }}
                        allowClear={false}
                      />
                      <button
                        className="ml-2 bg-[#001529] font-bold text-white px-8 py-2 rounded-md whitespace-nowrap"
                        onClick={() => getDataBorluulaltBaraa()}
                      >
                        Хайх
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-5 items-center">
                    <p className="font-bold ">
                      {Math?.round(
                        (endDate?.getTime() - startDate?.getTime()) /
                          (1000 * 3600 * 24)
                      )}{" "}
                      өдөр
                    </p>
                    <div className="flex gap-2 items-center">
                      <Button
                        className="flex items-center"
                        loading={loading}
                        onClick={() => {
                          getDataBorluulaltBaraa();
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
                </div>
                <Table
                  loading={loading}
                  bordered
                  className="border mt-5 rounded-t-[8px] bg-[#E7ECF0] !text-[12px]"
                  dataSource={tableDataBorluulalt}
                  onRow={(record: IProduct, rowIndex) => {
                    return {
                      onClick: (event) => {
                        // console.log("onclickROW:", record);
                      }, // click row
                      onDoubleClick: (event) => {
                        // router.push("/members/" + record.memberId);
                      }, // double click row
                      onContextMenu: (event) => {},
                    };
                  }}
                  size="small"
                  columns={columns3}
                  rowClassName="editable-row"
                  pagination={false}
                  summary={(data: readonly any[]) => {
                    let dtoo = 0;
                    data.forEach(({ hurgegdsen }) => {
                      dtoo += hurgegdsen;
                    });
                    return (
                      <Table.Summary.Row className="bg-gray-100 font-bold text-[12px]">
                        <Table.Summary.Cell index={1} colSpan={3}>
                          Хөл дүн:
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <Text>{dtoo?.toLocaleString()}</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              </div>
            ),
          },
          {
            label: `Барааны үлдэгдэл нөөц`,
            key: "3",
            children: (
              <div className="h-full ">
                <div className="flex justify-between ">
                  <div className="flex gap-4 items-center">
                    <div className="flex gap-5 items-center">
                      <Form className=" m-0" form={searchForm2}>
                        <Form.Item
                          label={"Хайх: "}
                          className="m-0 w-[250px]"
                          name={"search"}
                        >
                          <Input />
                        </Form.Item>
                      </Form>
                    </div>
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
            ),
          },
        ]}
      />
    </div>
  );
};

export async function getServerSideProps(context: any) {
  try {
    const data = context?.query?.id?.toString().trim() ?? "";
    var memberData: any = {};
    const ooo: any = jwt.decode(context.req.cookies["accessToken"]);
    if (![0, 1].includes(ooo?.user?.level)) {
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
        props: {},
      };
    }
    const res = await axiosInstance.get(
      `${process.env.API_BASE_URL}/users/jolooch/${data}`
    );

    if (data && res?.["status"] === 200 && res?.data?.data != null) {
      memberData = res?.data?.data;
      return {
        props: {
          memberId: data,
          memberData: memberData,
        },
      };
    } else {
      return {
        redirect: {
          permanent: false,
          destination: "/settings/deliveryzones",
        },
        props: {},
      };
    }
  } catch (e) {
    console.log(e);
    return {
      redirect: {
        permanent: false,
        destination: "/settings/deliveryzones",
      },
      props: {},
    };
  }
}
export default UserDetials;
