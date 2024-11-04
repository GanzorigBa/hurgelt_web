import axiosInstance from "@/lib/axios";
import { Form, Select, message, FormItemProps } from "antd";
import { useEffect, useState, memo, useMemo } from "react";
import debounce from 'lodash/debounce';

interface Operator {
  _id: string;
  username: string;
  phone: string;
  name: string;
}

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectOperatorsIdWidgetProps extends FormItemProps {
  isAll?: boolean;
  disabled?: boolean;
}

interface OperatorResponse {
  status: number;
  data: {
    data: Operator[];
    total: number;
  };
}

const SelectOperatorsIdWidget = (props: SelectOperatorsIdWidgetProps) => {
  const [operatorList, setOperatorList] = useState<SelectOption[]>([]);
  const [backupList, setBackupList] = useState<SelectOption[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [messageApi] = message.useMessage();

  // Cache mechanism
  const [cache, setCache] = useState<Record<string, SelectOption[]>>({});

  const formatOperatorOption = (operator: Operator): SelectOption => ({
    value: operator._id,
    label: `${operator.username} - (${operator.phone}) ${operator.name}`.trim(),
  });

  const getOperatorList = async (searchValue: string) => {
    // Cache-д байвал шууд буцаах
    if (cache[searchValue]) {
      setOperatorList(cache[searchValue]);
      return cache[searchValue];
    }

    const startTime = Date.now();
    
    try {
      setLoading(true);
      const response = await axiosInstance.post<OperatorResponse>("/users/getoperator", {
        limit: 100,
        sort: { username: 1 },
        search: searchValue ?? "",
      });

      if (!response || !response.data) {
        throw new Error('Invalid response');
      }

      const operators: Operator[] = response.data.data.data;
      const formattedOptions: SelectOption[] = operators.map(formatOperatorOption);

      // "Бүгд" сонголт нэмэх
      const options = props?.isAll 
        ? [{ value: "", label: "Бүгд" }, ...formattedOptions]
        : formattedOptions;

      setOperatorList(options);
      
      // Backup жагсаалт хадгалах (анх удаа л хоосон байх үед)
      if (backupList.length === 0) {
        setBackupList(options);
      }

      setCache(prev => ({
        ...prev,
        [searchValue]: options
      }));

      return options;
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Операторын жагсаалт ачаалахад алдаа гарлаа';
      console.error("[ERROR][getOperatorList]:", error);
      messageApi.error(errorMessage);
      // Backup жагсаалт ашиглах
      setOperatorList(backupList);
      return backupList;
    } finally {
      setLoading(false);
    }
  };

  // Debounce хийсэн хайлтын функц
  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 500);

  useEffect(() => {
    let isSubscribed = true; // unmount flag

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getOperatorList(searchTerm);
        if (isSubscribed) {
          // update states only if component is mounted
          setOperatorList(response);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isSubscribed = false;
      debouncedSearch.cancel();
    };
  }, [searchTerm]);

  // Props validation
  if (props.isAll && props.disabled) {
    console.warn('SelectOperatorsIdWidget: isAll and disabled props should not be used together');
  }

  return (
    <Form.Item {...props}>
      <Select
        disabled={props?.disabled}
        className="bg-white max-w-[300px]"
        placeholder="Оператор сонгох"
        style={{ height: 32 }}
        options={operatorList}
        showSearch
        loading={loading}
        filterOption={(input: string, option?: SelectOption) => {
          if (!option) return false;
          const searchValue = input.toLowerCase();
          return option.label.toLowerCase().includes(searchValue);
        }}
        onSearch={(value: string) => {
          debouncedSearch(value.toLowerCase());
        }}
        notFoundContent={loading ? "Уншиж байна..." : "Оператор олдсонгүй"}
      />
    </Form.Item>
  );
};

export default memo(SelectOperatorsIdWidget, (prevProps, nextProps) => {
  return prevProps.disabled === nextProps.disabled && 
         prevProps.isAll === nextProps.isAll;
});
