import React, { useState } from "react";
import {
  Col,
  Card,
  Row,
  Typography,
  Button,
  Empty,
  Form,
  Space,
  Popconfirm,
} from "antd";
import CustomSpecGroupModal from "./CustomSpecGroupModal";
import TransferTable from "./Transfer/TransferTable";
("../styles/custom-spec-tables-results.less");

interface ContainerProps {
  specGroups: string[];
  setSpecGroups: (specGroups: string[]) => void;
}
const { Text } = Typography;

const CustomSpecResults = ({ specGroups, setSpecGroups }: ContainerProps) => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const cancelText =
    "Are you sure you want to cancel your changes?\nYou will lose any changes that you have made.";

  const showModal = () => {
    setIsModalOpen(true);
  };

  const dataSource = [
    ...data,
    ...specGroups.map((specGroup) => ({
      key: specGroup,
      title: specGroup,
      disabled: true,
    })),
  ];

  return (
    <Row className="flex results-container" style={{ paddingTop: 24 }}>
      <Col span={24}>
        <Card
          className="card-container"
          type="inner"
          title="Spec Table Results"
          extra={
            <Button
              onClick={showModal}
              type="primary"
              ghost
              disabled={
                form.isFieldsTouched(true) && form.getFieldsError().length > 0
              }
            >
              Add Spec Group(s)
            </Button>
          }
        >
          {/* {!selectedCategory && (
            <>
              <Row justify="center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={false}
                  className="empty-image"
                />
              </Row>
              <Row justify="center">
                <Text className="search-results-nodata">
                  Search Category Name or ID above to create custom spec table.
                </Text>
              </Row>
            </>
          )} */}

          <Row>
            <Col span={24}>
              <TransferTable
                specGroups={specGroups}
                setSpecGroups={setSpecGroups}
              />
            </Col>
          </Row>
          <CustomSpecGroupModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            specGroups={specGroups}
            setSpecGroups={setSpecGroups}
          />
        </Card>

        <Row style={{ marginTop: 24 }} justify="end">
          <Space size={16}>
            <Popconfirm
              placement="top"
              title={cancelText}
              okText="Yes, Cancel"
              cancelText="No"
            >
              <Button>Cancel</Button>
            </Popconfirm>
            <Button type="primary">Save Custom Spec Table</Button>
          </Space>
        </Row>
      </Col>
    </Row>
  );
};

export default CustomSpecResults;
