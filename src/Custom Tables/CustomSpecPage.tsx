import { useState, useEffect } from "react";
import CustomSpecResults from "./CustomSpecResults";
import { Col, Row, Typography } from "antd";
import "../styles/custom-spec-tables.less";
import "../styles/custom-spec-table-transfer.less";
import { SpecGroupType } from "./Transfer/Types";

const { Title } = Typography;

const CustomSpecTablesPage = () => {
  const [specGroups, setSpecGroups] = useState<SpecGroupType[]>([
    { name: "Dimension", isEdited: false },
    { name: "Size", isEdited: false },
    { name: "Width", isEdited: false },
  ]);

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/ricardomejiasilva/spec-mock-data/main/data.json"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData = await response.json();
        const formattedData = jsonData.map((item: any, index: number) => ({
          ...item,
          id: index + 1,
          columnId: "left",
          hidden: false,
          edited: false,
        }));
        setTasks(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

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
        specGroups={specGroups}
        setSpecGroups={setSpecGroups}
        tasks={tasks}
        setTasks={setTasks}
      />
    </>
  );
};

export default CustomSpecTablesPage;
