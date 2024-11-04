import axiosInstance from "@/lib/axios";
import { Form, Select } from "antd";
import { useEffect, useState } from "react";

const SelectProductWidget = (props?: any) => {
  const [joloochList, setjoloochList] = useState<any[]>([]);
  const [joloochList2, setjoloochList2] = useState<any[]>([]);
  const [searchjolooch, setsearchjolooch] = useState<string>();
  const [loading, setloading] = useState(false);

  const getProductList = async () => {
    const templist = sessionStorage.getItem("productLists");
    if (templist) {
      setjoloochList(JSON.parse(templist));
    } else {
      setloading(true);
      axiosInstance
        .post("/products/getproducts", {
          limit: 300,
          sort: { name: 1 },
          search: searchjolooch ?? "",
        })
        .then((val) => {
          if (val?.["status"] === 200) {
            const list = val?.data?.data;
            var temp: any[] = [];
            list.map((e: any) => {
              temp.push({
                value: JSON.stringify({
                  _id:e._id,
                  code: e.code,
                  name: e.name,
                  price: e.price,
                  delivery_price: e.delivery_price,
                }),
                label:
                  e?.name.toString() +
                  " - (" +
                  e?.code.toString() +
                  ") " +
                  (e?.price + e?.delivery_price).toLocaleString(),
              });
            });
            if (temp.length > 0) {
              setjoloochList(temp);
              sessionStorage.setItem("productLists", JSON.stringify(temp));
            } else setjoloochList(joloochList2);
            if (joloochList2.length == 0) {
              setjoloochList2(temp);
            }
          }
        })
        .catch((e) => {
          console.log("getProductList::::::", e);
        })
        .finally(() => {
          setloading(false);
        });
    }
  };

  useEffect(() => {
    getProductList();
    return () => {};
  }, [searchjolooch]);

  return (
    <Form.Item {...props}>
      <Select
        disabled={props?.disabled}
        placeholder={"Бараа сонгох"}
        style={{ height: 32 }}
        options={joloochList}
        showSearch
        filterOption={(input: string, option: any) => {
          return (option?.label ?? "")
            .toLowerCase()
            ?.includes(input.toLowerCase());
          // setsearchjolooch(input.toLowerCase());
          // return option?.label;
        }}
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? "")
            .toLowerCase()
            .localeCompare((optionB?.label ?? "").toLowerCase())
        }
      />
    </Form.Item>
  );
};

export default SelectProductWidget;
