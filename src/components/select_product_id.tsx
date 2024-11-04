import { Form, Select } from "antd";
import { FC } from "react";

interface SelectProductIDWidgetProps {
  className?: string;
  name?: string;
  label?: string;
  level?: number[];
  firstvalue?: string;
  optionList?: Array<{
    label: string;
    value: string | number;
  }>;
  setFirstValue?: (value: string) => void;
  disabled?: boolean;
}

const SelectProductIDWidget: FC<SelectProductIDWidgetProps> = ({
  className,
  name,
  label,
  optionList = [],
  firstvalue,
  disabled,
}) => {
  return (
    <Form.Item
      name={name}
      label={label}
      className={className}
    >
      <Select
        disabled={disabled}
        placeholder="Бараа сонгох"
        style={{ width: "100%" }}
        options={optionList}
        value={firstvalue}
        showSearch
        filterOption={(input: string, option) => 
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        filterSort={(optionA, optionB) =>
          (optionA?.label ?? "").toLowerCase()
            .localeCompare((optionB?.label ?? "").toLowerCase())
        }
      />
    </Form.Item>
  );
};

export default SelectProductIDWidget;
