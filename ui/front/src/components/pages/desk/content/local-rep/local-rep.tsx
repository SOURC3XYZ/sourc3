import {
  Select, Form, Button, Radio
} from 'antd';

import styles from './local-rep.module.css';

const LocalRepos = () => {
  const [form] = Form.useForm();
  const { Option } = Select;

  const handleChange = (value:any) => {
    console.log(`selected ${value}`);
  };
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
        {' '}
        <Radio.Group onChange={(e) => (console.log(e.target.value))} defaultValue="a" size="middle">
          <Radio.Button value="a">Changes</Radio.Button>
          <Radio.Button value="b">History</Radio.Button>
          <Radio.Button value="c">Merge</Radio.Button>
          <Radio.Button value="d">Pull request</Radio.Button>
        </Radio.Group>

      </div>
    </div>
  );
};

export default LocalRepos;
