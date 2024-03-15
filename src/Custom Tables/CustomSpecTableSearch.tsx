import React, { useEffect, useState } from "react";
import { Select, Button, Form, Col, Row, Typography, Popconfirm } from "antd";
import { OptionProps } from "antd/lib/select";

interface SelectedCategoryProps {
  setSpecGroups: (specGroups: string[]) => void;
}

const CustomSpecTableSearch: React.FC<SelectedCategoryProps> = ({}) => {
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<
    string | null
  >(null);

  const resetText =
    "Are you sure you want to reset the category?\nYou will lose the unsaved Custom Spec Table.";

  const customFilterOption = (inputValue: string, option: OptionProps) => {
    if ("value" in option && "children" in option) {
      const optionValue = option.value ? option.value.toString() : "";
      const optionLabel = option.children ? option.children.toString() : "";
      const idMatch = optionValue.includes(inputValue);
      const nameMatch = optionLabel
        .toLowerCase()
        .includes(inputValue.toLowerCase());

      return idMatch || nameMatch;
    }

    return false;
  };

  // const handleSelectChange = (value: string | number | null) => {
  //     const selectedOption = categories.find((option) => option.categoryId === value);
  //     if (selectedOption) {
  //         setStagedCategory(selectedOption);
  //         setSelectedCategoryLabel(selectedOption.categoryName);
  //     } else {
  //         setStagedCategory(null);
  //         setSelectedCategoryLabel(null);
  //     }
  // };

  // const onReset = () => {
  //     setSelectedCategory(null);
  //     setSpecGroups([]);
  //     setSelectedCategoryLabel('');
  // };
  // const onSearch = () => {
  //     setSelectedCategory(stagedCategory);
  //     setSpecGroups([]);
  // };

  return (
    <>
      <Form layout="vertical" className="search-form">
        <Row align="bottom" gutter={16}>
          <Col flex={1}>
            <Form.Item label="Search Category Name or ID">
              <Select
                showSearch
                placeholder="Search Category Name or ID"
                value={selectedCategoryLabel}
                optionFilterProp="children"
                className="multiple-select"
              >
                {/* {categories.map((categoryOption) => (
                                    <Select.Option
                                        key={categoryOption.categoryId}
                                        value={categoryOption.categoryId}
                                    >
                                        {categoryOption.categoryName}
                                    </Select.Option>
                                ))} */}
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Popconfirm
                placement="top"
                title={resetText}
                okText="Reset Category"
                cancelText="No"
              >
                <Button>Reset Category</Button>
              </Popconfirm>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button type="primary">Search for Category</Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CustomSpecTableSearch;
