import {
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineController, LineElement, PointElement,
    Title, Tooltip
} from 'chart.js';
import React, { useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useChartDataStateContext } from '../../../../providers/chartData';
import { IChartData, IChartDataProps } from '../../model';
import { useGeneratedTitle } from "../../hooks";

interface ILineChartProps extends IChartDataProps {
    data: IChartData;
}

ChartJS.register(
    CategoryScale,
    LineController,
    LineElement,
    PointElement,
    LinearScale,
    Title,
    Tooltip,
    Legend
);

const LineChart: React.FC<ILineChartProps> = ({ data }) => {
    const { axisProperty: xProperty, valueProperty: yProperty, aggregationMethod, showLegend, showTitle, legendPosition, showXAxisScale, showXAxisTitle, showYAxisScale, showYAxisTitle, tension, strokeColor, dataMode, strokeWidth } = useChartDataStateContext();

    const chartTitle: string = useGeneratedTitle();

    if (!data || !data.datasets || !data.labels) {
        if (!data)
            throw new Error('LineChart: No data to display. Please check the data source');

        if (!data.datasets || !data.labels)
            throw new Error('LineChart: No datasets or labels to display. Please check the data source');
    }

    useEffect(() => {
        if (dataMode === 'url') {
            data?.datasets?.map((dataset: any) => {
                dataset.borderColor = strokeColor || 'black';
                dataset.pointRadius = 5;
                dataset.borderWidth = typeof (strokeWidth) === 'number' || strokeWidth > 1 ? strokeWidth : 1;
                dataset.tension = tension;
                return dataset;
            });
        } else {
            data?.datasets?.map((dataset: any) => {
                dataset.tension = tension;
                return dataset;
            });
        }
    }, [dataMode, data?.datasets, strokeColor, strokeWidth, tension]);

    const options: any = {
        responsive: true,
        plugins: {
            legend: {
                display: showLegend ? true : false,
                position: legendPosition ?? 'top',
            },
            title: {
                display: showTitle && chartTitle.length > 0 ? true : false,
                text: chartTitle,
            }
        },
        scales: {
            x: {
                title: {
                    display: showXAxisTitle && xProperty?.trim().length > 0 ? true : false,
                    text: xProperty?.trim() ?? ''
                },
                display: showXAxisScale ? true : false,
                offset: true, // Ensure the x-axis does not coincide with the y-axis
            },
            y: {
                title: {
                    display: showYAxisTitle && yProperty?.trim().length > 0 ? true : false,
                    text: `${yProperty?.trim() ?? ''} (${aggregationMethod})`,
                },
                display: showYAxisScale ? true : false,
                beginAtZero: true
            }
        }
    };

    return <Line data={data as any} options={options} />;
};

export default LineChart;
