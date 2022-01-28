import { FormOutlined } from '@ant-design/icons';
import {
  PageHeader, Button
} from 'antd';
// import SubMenu from 'antd/lib/menu/SubMenu';

const Header = () => (
  <>
    <PageHeader
      style={{ background: 'white', margin: '0 auto', maxWidth: '74rem' }}
      className="site-page-header-responsive"
      title="PIT"
      // subTitle="This is a subtitle"
      extra={[
        <>
          <Button shape="round" icon={<FormOutlined />}>New</Button>
        </>
      ]}
    />
  </>
);

export default Header;
