import React from 'react';
import { Select } from 'antd';
import circle from '@assets/img/circle.svg';
import circleG from '@assets/img/circleG.svg';
import circleO from '@assets/img/circleO.svg';
import arrowUp from '@assets/img/arrowUp.svg';
import card2Scr from '@assets/img/card2Scr.png';
import styles from './repositories-status.module.scss';

const { Option } = Select;

function RepositoriesStatus() {
  return (
    <div className={styles.RepositoriesStatus}>
      <div className={styles.list}>
        <div className={styles.item}>
          <div className={styles.title}>
            <h4>Issues</h4>
            <Select defaultValue="This Month" bordered={false}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </div>
          <div className={styles.counts}>
            <div className={styles.countsItem}>
              <img className={styles.circleImg} src={circle} alt="" />
              <h2>990</h2>
            </div>
            <div className={styles.countsItem}>
              <div className={styles.countsGraph}>
                <img src={circleG} alt="" />
                <div>
                  <h4>Open</h4>
                  <p>789</p>
                </div>
              </div>
              <div className={styles.countsGraph}>
                <img src={circleO} alt="" />
                <div>
                  <h4>Close</h4>
                  <p>201</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>
            <h4>Pull requests</h4>
            <Select defaultValue="This Month" bordered={false}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </div>
          <div className={styles.counts}>
            <img className={styles.card2Scr} src={card2Scr} alt="" />
          </div>
        </div>
        <div className={styles.item}>
          <div className={styles.title}>
            <h4>Funds</h4>
            <Select defaultValue="This Month" bordered={false}>
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="Yiminghe">yiminghe</Option>
            </Select>
          </div>
          <div className={styles.counts}>
            <div className={styles.countsMoney}>
              <p>Earned</p>
              <h2>1789 PIT</h2>
              <h4 className={styles.countPercent}>
                <img src={arrowUp} alt="" />
                <span>34</span>
                %
              </h4>
              <p>
                higher than
                on previous month
              </p>
            </div>
            <div className={styles.countsMoney}>
              <p>Spend</p>
              <h2 className={styles.orange}>598 PIT</h2>
              <h4 className={styles.countPercent}>
                <img src={arrowUp} alt="" />
                <span>12</span>
                %
              </h4>
              <p>
                higher than
                on previous month
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default RepositoriesStatus;
