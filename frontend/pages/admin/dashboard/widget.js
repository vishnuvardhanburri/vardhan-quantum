import React from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    Tooltip,
  } from "recharts";
import PropTypes from 'prop-types';

import MoneyIcon from 'public/images/e-commerce/admin/widgets/moneyIcon';
import s from './Dashboard.module.scss';

const SimpleLine = ({ color, title, subtitle, value }) => {

    function getRandomData(length, min, max, multiplier = 15, maxDiff = 5) {
        var array = new Array(length).fill();
        let lastValue;
      
        return array.map((item, index) => {
          let randomValue = Math.floor(Math.random() * multiplier + 1);
      
          while (
            randomValue <= min ||
            randomValue >= max ||
            (lastValue && randomValue - lastValue > maxDiff)
          ) {
            randomValue = Math.floor(Math.random() * multiplier + 1);
          }
      
          lastValue = randomValue;
      
          return { value: randomValue };
        });
      }
    const randomData = React.useMemo(() => getRandomData(10), []);
    return (
      <div className={s.dashboardWidgetWrapper}>
        <h4 className={s.widgetTitle}>{title}</h4>
        <span className={s.widgetSubtitle}>{subtitle}</span>
        <div>
          <MoneyIcon className={s.moneyIcon} />
          <ResponsiveContainer height={90} width="100%">
            <AreaChart data={randomData}>
              <Area
                type="natural"
                dataKey="value"
                stroke={color}
                fill={color}
                strokeWidth={3}
                fillOpacity="0.1"
              />
              <Tooltip
                itemStyle={{
                  background: 'transparent',
                  color: '#ffffff',
                }}
                wrapperStyle={{
                  background: 'rgba(0,0,0,.6)',
                  borderRadius: 2,
                  border: 'none',
                }}
                contentStyle={{
                  background: 'transparent',
                  border: 'none',
                }}
                labelStyle={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,.8)'
                }}
                offset={0}
                allowEscapeViewBox={{
                  x: true,
                  y: true
                }}
                coordinate={{ x: -400, y: -240 }}
                payload={[{ name: '05-01', value: 12, unit: 'kg' }]}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
}

SimpleLine.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  value: PropTypes.number,
}

export async function getServerSideProps(context) {
    // const res = await axios.get("/products");
    // const products = res.data.rows;

    return {
        props: {  }, // will be passed to the page component as props
    };
}

export default SimpleLine;
