import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import {useState, useEffect, PureComponent} from "react";
import axios from "axios";
import Chart from "chart.js";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
    Area,
    BarChart,
    Bar,
    ResponsiveContainer, Treemap,
} from "recharts";

import '../App.css'

function FormDisabledExample() {
    const [loading, setLoading] = useState({
        modal: false,
        type: 'predict'
    });
    const [data, setData] = useState({});
    const [formData, setFormData] = useState({
        lyrics: "",
    });

    const {lyrics} = formData;
    const COLORS = ["#8884d8", "#82ca9d", "#c50909", "#17299e", "#AF19FF", "#9E1795", "#e0e009", "#09e0e0"];

    const pieData = Object.entries(data).map(([name, value], index) => ({
        name,
        value,
    }));

    const treeData = Object.entries(data).map(([name, value], index) => ({
        name,
        children: [
            {name: name, size: value}
        ],
    }));

    const chartData = Object.keys(data).map((key) => {
        return {
            name: key,
            value: data[key],
        };
    });

    const CustomTooltip = ({active, payload, label}) => {
        if (active) {
            return (
                <div
                    className="custom-tooltip"
                    style={{
                        backgroundColor: "#ffff",
                        padding: "5px",
                        border: "1px solid #cccc",
                    }}
                >
                    <label>{`${payload[0].name} : ${payload[0].value.toFixed(2)}%`}</label>
                </div>
            );
        }
        return null;
    };

    const CustomizedTreeContent = ({root, depth, x, y, width, height, index, payload, colors, rank, name}) => {

        return (
            <g>
                <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    style={{
                        fill: depth < 2 ? colors[index] : '#ffffff00',
                        stroke: '#fff',
                        strokeWidth: 2 / (depth + 1e-10),
                        strokeOpacity: 1 / (depth + 1e-10),
                    }}
                />
                {depth === 1 ? (
                    <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={11}>
                        {name}
                    </text>
                ) : null}
                {depth === 1 ? (
                    <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
                        {index + 1}
                    </text>
                ) : null}
            </g>
        );
    }


    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    "Content-Type": "text/plain",
                },
            };
            setLoading({
                modal: true,
                type: 'predict'
            });
            // make request
            let {data} = await axios.post(
                "http://localhost:9090/lyrics/predict",
                lyrics,
                config
            );
            delete data.genre
            setData(data);
            setLoading({
                modal: false,
                type: 'predict'
            });
        } catch (error) {
            setLoading({
                modal: false,
                type: 'predict'
            });
            console.log(error);
        }
    };

    const onReset = async (e) => {
        e.preventDefault();
        setLoading(true);
        setData({})
        setLoading(false)
    };

    const onTrainSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            };
            setLoading({
                modal: true,
                type: 'train'
            });
            // make request
            let {data} = await axios.get(
                "http://localhost:9090/lyrics/train",
                config
            );
            setLoading({
                modal: false,
                type: 'train'
            });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div style={{display: loading.modal ? 'flex' : 'none'}} className='modal'>
                <div className='modal-content'>
                    <div className='loader'></div>
                    {loading.type === 'train' ?
                        <div className='modal-text'>Training the model...<br/>This takes lot of time.
                        </div> :
                        <div className='modal-text'>Loading the results...<br/>Predicting the Genre takes sometime.
                        </div>
                    }
                </div>
            </div>

            <h1><strong>Lyrics Genre Prediction</strong></h1>
            <Form
                onSubmit={onSubmit}
                onReset={onReset}
                className="text-center"
                style={{maxWidth: "800px", margin: "0 auto"}}
            >
                <Form.Group className="mb-3">
                    <Form.Label style={{fontSize: "18px"}}>
                        Insert Lyrics
                    </Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        id="lyrics"
                        name="lyrics"
                        value={lyrics}
                        placeholder="Enter your lyrics"
                        onChange={onChange}
                        required
                        style={{
                            fontSize: "16px",
                            borderRadius: "4px",
                            borderColor: "#ccc"
                        }}
                    />
                </Form.Group>
                <Form.Group style={{display: "flex", justifyContent: "center"}}>
                    <Button
                        type="submit"
                        style={{
                            backgroundColor: "#007bff",
                            borderColor: "#007bff",
                            fontSize: "16px",
                            marginRight: "10px"
                        }}
                    >
                        Submit
                    </Button>
                    <Button
                        type="reset"
                        style={{
                            backgroundColor: "#007bff",
                            borderColor: "#007bff",
                            fontSize: "16px",
                            marginLeft: "10px"
                        }}
                    >
                        Clear
                    </Button>
                </Form.Group>
            </Form>

            <Form
                onSubmit={onTrainSubmit}
            >
                <Form.Group style={{display: "flex", justifyContent: "center"}}>
                    <Button
                        type="submit"
                        style={{
                            backgroundColor: "#007bff",
                            borderColor: "#007bff",
                            fontSize: "16px",
                            marginTop: "30px"
                        }}
                    >
                        Train the Model
                    </Button>
                </Form.Group>
            </Form>
            {data == null || (Object.keys(data).length === 0 && data.constructor === Object) ?
                <div className="row"
                     style={{
                         display: "flex",
                         flexDirection: "column",
                         alignItems: "center",
                         margin: "1rem 0",
                         height: "500px",
                         justifyContent: "center"
                     }}><h3>Not data available.</h3></div>
                :
                <div className="row"
                     style={{
                         display: "flex",
                         flexDirection: "column",
                         alignItems: "center",
                         margin: "1rem 0",
                     }}
                >
                    <div className="visualization-item">
                        <PieChart width={400} height={400}>
                            <Pie
                                data={pieData}
                                color="#000000"
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={120}
                                fill="#8884d8"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend/>
                        </PieChart>
                    </div>
                    <div className="visualization-item">
                        <Treemap
                            width={400}
                            height={400}
                            data={treeData}
                            nameKey="name"
                            dataKey="size"
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedTreeContent colors={COLORS}/>}
                        >
                            <Tooltip content={<CustomTooltip/>}/>
                        </Treemap>
                    </div>
                    <div className="visualization-item">
                        <BarChart
                            width={800} height={400}
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >

                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="name"/>
                            <YAxis/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Bar dataKey="value" fill="#8884d8">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} cursor="pointer" fill={COLORS[index]}/>
                                ))}
                            </Bar>
                        </BarChart>
                    </div>
                </div>
            }
        </>
    );
}

export default FormDisabledExample;
  