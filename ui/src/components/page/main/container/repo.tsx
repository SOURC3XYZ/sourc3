import { BranchSelect, FileText, FileTree } from '@components/container';
import { RepoId } from '@types';
import { Button } from 'antd';
import React from 'react';
import {
  Route, Routes, useNavigate, useParams
} from 'react-router-dom';

type LocationState = {
  id:RepoId;
};

const Repo = () => {
  const location = useParams<'id' & 'oid'>() as LocationState;
  const { id } = location;
  const navigate = useNavigate();

  React.useEffect(() => console.log(`${id} repo mounted`), []);

  return (
    <>
      <Button onClick={() => navigate(-1)} type="link">Return</Button>
      <BranchSelect id={id} />
      <Routes>
        <Route
          path="tree"
          element={<FileTree id={id} />}
        />

        <Route
          path=":oid"
          element={<FileText />}
        />
      </Routes>
    </>
  );
};

export default Repo;
