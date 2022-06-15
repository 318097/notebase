import React, { useEffect } from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import _ from "lodash";
import { fetchStats } from "../store/actions";
import colors from "@codedrops/react-ui";
import { Doughnut, HorizontalBar, Bar } from "react-chartjs-2";
import { getTagsMap } from "../lib/utils";

const StyledContainer = styled.section`
  display: flex;
  flex-direction: column;
  padding: 0 40px;
  .wrapper {
    flex: 1 1 50%;
    display: flex;
    justify-content: space-between;
  }
  .chart {
    flex: 1 1 50%;
    width: 100%;
    padding: 10px;
    margin: 0 auto;
    position: relative;
    .chart-name {
      position: absolute;
      text-transform: uppercase;
      font-size: 1.4rem;
      color: ${colors.strokeThree};
      bottom: 32px;
      right: 32px;
      &.created {
        top: 32px;
        bottom: unset;
      }
      &.type {
        top: 32px;
        left: 32px;
      }
      &.status {
        bottom: 32px;
        left: 32px;
      }
    }
  }
`;

const getChartData = ({ data = {}, type, tagsMap } = {}) =>
  _.reduce(
    _.get(data, type, {}),
    (acc, value, label) => {
      acc.labels.push(label);
      acc.values.push(value);
      if (type === "tags") {
        const selectedColor = _.get(tagsMap, [label, "color"]);
        acc.colors.push(selectedColor);
      }
      return acc;
    },
    { labels: [], values: [], colors: [] }
  ) || {};

const Stats = ({ tagsMap, stats, fetchStats }) => {
  useEffect(() => {
    fetchStats();
  }, []);

  const tagsData = getChartData({ data: stats, type: "tags", tagsMap });
  const typesData = getChartData({ data: stats, type: "types" });
  const statusData = getChartData({ data: stats, type: "status" });
  const createdOnData = getChartData({ data: stats, type: "created" });
  const selectedColors = Object.values(colors).slice(0, 7);
  const barColors = [...selectedColors, ...selectedColors, ...selectedColors];
  return (
    <StyledContainer>
      <div className="wrapper">
        <div className="chart">
          <div className="chart-name status">Status</div>
          <Doughnut
            data={{
              labels: statusData.labels,
              datasets: [
                {
                  backgroundColor: [
                    colors.green,
                    colors.orange,
                    colors.orchid,
                    colors.coffee,
                  ],
                  data: statusData.values,
                },
              ],
            }}
            options={{
              cutoutPercentage: 0,
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                position: "bottom",
              },
              tooltips: {
                enabled: true,
              },
            }}
          />
        </div>
        <div className="chart">
          <div className="chart-name created">Created</div>
          <Bar
            data={{
              labels: createdOnData.labels,
              datasets: [
                {
                  backgroundColor: barColors,
                  data: createdOnData.values,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                      fontSize: 10,
                    },
                  },
                ],
                xAxes: [
                  {
                    ticks: {
                      fontSize: 10,
                    },
                  },
                ],
              },
              legend: {
                display: false,
              },
            }}
          />
        </div>
      </div>

      <div className="wrapper">
        <div className="chart">
          <div className="chart-name tags">Tags</div>
          <HorizontalBar
            data={{
              labels: tagsData.labels,
              datasets: [
                {
                  backgroundColor: tagsData.colors,
                  data: tagsData.values,
                },
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: true,
                      fontSize: 10,
                    },
                  },
                ],
                xAxes: [
                  {
                    ticks: {
                      fontSize: 10,
                    },
                  },
                ],
              },
              legend: {
                display: false,
              },
            }}
          />
        </div>
        <div className="chart">
          <div className="chart-name type">Type</div>
          <Doughnut
            data={{
              labels: typesData.labels,
              datasets: [
                {
                  backgroundColor: [
                    colors.coffee,
                    colors.yellow,
                    colors.blue,
                    colors.orange,
                  ],
                  data: typesData.values,
                },
              ],
            }}
            options={{
              cutoutPercentage: 0,
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                position: "bottom",
              },
            }}
          />
        </div>
      </div>
    </StyledContainer>
  );
};

const mapStateToProps = ({ settings, stats }) => ({
  tagsMap: getTagsMap(settings),
  stats,
});

const mapDispatchToProps = { fetchStats };

export default connect(mapStateToProps, mapDispatchToProps)(Stats);
