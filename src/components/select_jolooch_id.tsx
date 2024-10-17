import axiosInstance from "@/lib/axios";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const SelectJoloochIdWidget = (props?: any) => {
  const [joloochList, setjoloochList] = useState<any[]>([]);
  const [joloochList2, setjoloochList2] = useState<any[]>([]);
  const [searchjolooch, setsearchjolooch] = useState<string>();

  const getjoloochList = async () => {
    axiosInstance
      .post("/users/getjolooch", {
        limit: 100,
        sort: { username: 1 },
        search: searchjolooch ?? "",
      })
      .then((val) => {
        if (val?.["status"] === 200) {
          const list = val?.data?.data;
          var temp: any[] = [];
          if (props?.isAll) {
            temp.push({ value: "", label: "Бүгд" });
          }
          list.map((e: any) => {
            temp.push({
              value: e._id,
              label:
                e?.username.toString() +
                " - (" +
                e?.phone.toString() +
                ") " +
                e?.name.toString(),
            });
          });
          if (temp.length > 0) setjoloochList(temp);
          else setjoloochList(joloochList2);
          if (joloochList2.length == 0) {
            setjoloochList2(temp);
          }
        }
      })
      .catch((e) => {
        console.log("getbanklist::::::", e);
      });
  };

  useEffect(() => {
    getjoloochList();
    return () => {};
  }, [searchjolooch]);

  return (
    <Form.Item {...props}>
      <Select
        disabled={props?.disabled}
        className="bg-white"
        placeholder={"Жолооч сонгох"}
        style={{ width: 260, height: 28 }}
        options={joloochList}
        showSearch
        filterOption={(input: string, option: any) => {
          setsearchjolooch(input?.toLowerCase());
          return option?.label;
        }}
      />
    </Form.Item>
  );
};

export default SelectJoloochIdWidget;
