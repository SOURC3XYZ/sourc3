import {
  Select, Form, Button, Tabs
} from 'antd';

import styles from './local-rep.module.scss';

function LocalRepos() {
  const [form] = Form.useForm();
  const { Option } = Select;

  const handleChange = (value:any) => {
    console.log(`selected ${value}`);
  };
  const { TabPane } = Tabs;

  return (
    <div className={styles.wrapper}>
      <div className={styles.wrapperSelect}>
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item label="Current repositories:">
            <Select
              defaultValue="lucy"
              style={{ width: 300 }}
              onChange={handleChange}
            >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>
                Disabled
              </Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </Form.Item>
        </Form>
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item label="Current branch:">
            <Select
              defaultValue="lucy"
              style={{ width: 300 }}
              onChange={handleChange}
            >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="disabled" disabled>
                Disabled
              </Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </Form.Item>
        </Form>
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item label="Fetch:">
            <Button>Fetch</Button>
          </Form.Item>
        </Form>

      </div>
      <div className={styles.wrapperRadio}>
        <Tabs defaultActiveKey="1" type="card">
          <TabPane tab="Changes" key="1">
            <div style={{ width: '75em' }}>
              <ul>
                <li>2</li>
                <li>3</li>
                <li>2</li>
                <li>33</li>
                <li>2</li>
              </ul>
            </div>
          </TabPane>
          <TabPane tab="History" key="3">
            Content of card tab 2
          </TabPane>
          <TabPane tab="Merge" key="4">
            Content of card tab 3
          </TabPane>
          <TabPane tab="Pull request" key="5">
            Content of card tab 4
          </TabPane>
        </Tabs>

      </div>
    </div>
  );
}

export default LocalRepos;
