import {
  BranchSelect, FileText, FileTree, RepoMeta
} from '@components/container';
import { Button, Col, Row } from 'antd';
import {
  Route, Routes, useNavigate, useParams
} from 'react-router-dom';

type LocationState = {
  id:string;
};

const UserRepos = () => {
  const location = useParams<'id' & 'oid'>() as LocationState;
  const { id } = location;
  const navigate = useNavigate();
  const [numId, name] = id.split('&');

  return (
    <>
      <Row>
        <Col span={8}>
          <Button onClick={() => navigate(-1)} type="link">Return</Button>
          <BranchSelect id={+numId} />
        </Col>
        <Col span={16}>
          <RepoMeta name={name} />
        </Col>
      </Row>

      <Routes>
        <Route
          path="tree"
          element={<FileTree id={+numId} />}
        />

        <Route
          path=":oid"
          element={<FileText />}
        />
      </Routes>
    </>
  );
};

export default UserRepos;
