import { useState } from "react";
import CustomSpecResults from "./CustomSpecResults";
import { Col, Row, Typography } from "antd";
import "../styles/custom-spec-tables.less";
import "../styles/custom-spec-tables-group-item.less";
import "../styles/custom-spec-table-transfer.less";
import { SpecGroupType } from "./Transfer/Types";
import CustomSpecTableSearch from "./CustomSpecTableSearch";

const { Title } = Typography;

const CustomSpecTablesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [specGroups, setSpecGroups] = useState<SpecGroupType[]>([
    { name: "Dimension", isEdited: false },
    { name: "Size", isEdited: false },
    { name: "Width", isEdited: false },
  ]);

  return (
    <>
      <Col>
        <Row justify="space-between" align="middle" className="page-title flex">
          <Col>
            <Title className="page-title__name" level={3}>
              Custom Spec Table
            </Title>
          </Col>
        </Row>
      </Col>
      <CustomSpecResults
        selectedCategory={selectedCategory}
        specGroups={specGroups}
        setSpecGroups={setSpecGroups}
      />
    </>
  );
};

export default CustomSpecTablesPage;
