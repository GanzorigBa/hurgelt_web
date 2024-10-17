import axiosInstance from "@/lib/axios";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const SelectPadaanUserWidget = (props?: any) => {
  const [joloochList, setjoloochList] = useState<any[]>([]);
  const [joloochList2, setjoloochList2] = useState<any[]>([]);
  const [searchjolooch, setsearchjolooch] = useState<string>();
  const [loading, setloading] = useState(false);

  const getUserList = async () => {
    const templist = sessionStorage.getItem(
      "getJoloochAguulah" + (props?.level ?? "")
    );
    if (templist) {
      setjoloochList(JSON.parse(templist));
    } else {
      axiosInstance
        .post("/users/getpadaanuser", {
          limit: 100,
          sort: { username: 1 },
          search: searchjolooch ?? "",
          level: props?.level ?? [3, 4],
        })
        .then((val: any) => {
          if (val?.["status"] === 200) {
            const list = val?.data?.data;
            var temp: any[] = [];
            if (props?.isbugd) {
              temp.push({
                value: "isBugd",
                label: "Бүгд",
              });
            }
            list.map((e: any) => {
              temp.push({
                value: JSON.stringify(e),
                label:
                  e?.username.toString() +
                  " - (" +
                  e?.phone.toString() +
                  ") " +
                  e?.name.toString(),
              });
            });
            if (temp.length > 0) {
              setjoloochList(temp);
              sessionStorage.setItem(
                "getJoloochAguulah" + (props?.level ?? ""),
                JSON.stringify(temp)
              );
            } else setjoloochList(joloochList2);
            if (joloochList2.length == 0) {
              setjoloochList2(temp);
            }
          }
        })
        .catch((e) => {
          console.log("getbanklist::::::", e);
        });
    }
  };

  useEffect(() => {
    getUserList();
    return () => {};
  }, [searchjolooch, props]);

  return (
    <Form.Item {...props}>
      <Select
        disabled={props?.disabled}
        className="mr-2"
        placeholder={"Хэрэглэгч сонгох"}
        style={{ width: 230, height: 38 }}
        options={joloochList}
        showSearch
        filterOption={(input: string, option: any) => {
          return (option?.label ?? "").toLowerCase()?.includes(input);
          // setsearchjolooch(input?.toLowerCase());
          // return option?.label;
        }}
        // filterSort={(optionA, optionB) =>
        //   (optionA?.label ?? "")
        //     .toLowerCase()
        //     .localeCompare((optionB?.label ?? "").toLowerCase())
        // }
      />
    </Form.Item>
  );
};

export default SelectPadaanUserWidget;
